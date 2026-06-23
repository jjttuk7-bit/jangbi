// 팀소피아 Slack 번들 빌더 (엔진 공통)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md §6
//   Slack(내부 운영실)에는 요약 / 검수 필요 케이스 / 운영 로그만 보낸다.
//
// 더미 엔진과 LLM 엔진이 동일한 §6 페이로드를 내도록, 리포트(§7)로부터 Slack 번들을
// 결정적으로 파생한다. 검수 케이스/요약/로그는 리포트 내용만으로 도출된다.

import {
  CHANNEL_BUILD_LOG,
  CHANNEL_TEAM_DAILY,
  COACHES,
  CoachId,
  TeamSophiaReport,
  TeamSophiaSlackBundle,
} from "./types.js";

/** 리포트에서 각 코치의 산출물을 채널용 요약 불릿으로 만든다. 내용 없는 코치는 제외. */
function buildCoachDigests(report: TeamSophiaReport): TeamSophiaSlackBundle["coachDigests"] {
  const digests: TeamSophiaSlackBundle["coachDigests"] = [];
  const add = (coachId: CoachId, headline: string, lines: (string | undefined)[]) => {
    const clean = lines.map((l) => (l ?? "").trim()).filter((l) => l !== "");
    if (clean.length > 0) {
      digests.push({ channel: COACHES[coachId].channel, coachId, headline, lines: clean });
    }
  };

  add("sophia", "마스터 코치 소피아 · 종합 정리", [report.sophiaSummary.overview]);
  add("anne-data", "데이터 분석가 앤 · 매출/데이터 진단", [
    report.anneDiagnosis.diagnosis,
    ...report.anneDiagnosis.findings.slice(0, 3),
  ]);
  add("claire-cs", "CS 코치 클레어 · 고객/리뷰", [
    ...report.claireDiagnosis.customerIssues.slice(0, 2),
    ...report.claireDiagnosis.preventiveActions.slice(0, 2),
  ]);
  add(
    "jane-marketer",
    "마케터 제인 · 마케팅 실행안",
    report.janePlan.actions.map((a) => `${a.idea} (${a.cost}) → ${a.expectedEffect}`)
  );
  add(
    "kelly-creator",
    "크리에이터 켈리 · 콘텐츠 아이디어",
    report.kellyIdeas.ideas.map((i) => `[${i.format}] ${i.concept}`)
  );

  return digests;
}

export interface BuildBundleOptions {
  storeName: string;
  /** ISO 8601 timestamp */
  generatedAt: string;
  engine: "dummy" | "llm";
  /** 요약 헤드라인 override. 없으면 리포트 상태로 자동 생성. */
  headline?: string;
}

/** 리포트로부터 Slack 번들(§6 3종류)을 만든다. */
export function buildSlackBundle(
  report: TeamSophiaReport,
  opts: BuildBundleOptions
): TeamSophiaSlackBundle {
  const { storeName, generatedAt, engine } = opts;

  const reviewCases: TeamSophiaSlackBundle["reviewCases"] = [];

  // 앤: 핵심 숫자 데이터 누락 시 검수 케이스
  const missing = report.anneDiagnosis.missingData;
  if (missing.length > 0) {
    reviewCases.push({
      channel: COACHES["anne-data"].channel,
      coachId: "anne-data",
      reason: "핵심 숫자 데이터 누락 — 매출 진단 신뢰도 낮음",
      excerpt: `누락 항목: ${missing.join(", ")}`,
      severity: missing.length >= 3 ? "high" : "medium",
    });
  }

  // 클레어: 답글 초안이 있으면 발송 전 사람 검수 케이스
  const draft = report.claireDiagnosis.replyDrafts[0];
  if (draft) {
    reviewCases.push({
      channel: COACHES["claire-cs"].channel,
      coachId: "claire-cs",
      reason: "고객 답글 초안 — 발송 전 사람 검수 필요",
      excerpt: draft,
      severity: "medium",
    });
  }

  const headline =
    opts.headline ??
    (report.neededData.length > 0
      ? `[${storeName}] 데이터 보강 우선 — 진단 진행`
      : `[${storeName}] 진단 완료`);

  const coachDigests = buildCoachDigests(report);
  // 관여 코치 = 실제 산출물이 있어 채널에 요약이 올라간 코치만. (하드코딩 X)
  const coachesInvolved = coachDigests.map((d) => d.coachId);

  return {
    summary: {
      channel: CHANNEL_TEAM_DAILY,
      storeName,
      headline,
      todayActions: report.todayActions.map((a) => a.task),
      coachesInvolved,
    },
    coachDigests,
    reviewCases,
    opsLog: [
      {
        channel: CHANNEL_BUILD_LOG,
        event: "report.generated",
        detail: `engine=${engine} store="${storeName}" coaches=${coachesInvolved.length} reviewCases=${reviewCases.length} neededData=${report.neededData.length}`,
        timestamp: generatedAt,
      },
    ],
  };
}
