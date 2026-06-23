// Team Sophia Slack 어댑터 (순수 변환 · 네트워크 없음)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md §6
//   Slack(내부 운영실)에는 고객 상담 전체가 아니라 요약 / 검수 필요 케이스 / 운영 로그만 보낸다.
//
// 이 모듈은 TeamSophiaSlackBundle 을 Slack chat.postMessage 페이로드 배열로 변환만 한다.
// 실제 전송은 server/index.ts(백엔드)가 담당한다. (토큰 노출 방지 — 정의서 §5-6 내부 운영실)

import { TeamSophiaSlackBundle } from "./types.js";

/** Slack chat.postMessage 한 건에 해당하는 페이로드 */
export interface SlackMessage {
  channel: string;
  /** 알림/접근성용 fallback 텍스트 */
  text: string;
  /** Block Kit 블록 (선택) */
  blocks?: unknown[];
}

function section(text: string) {
  return { type: "section", text: { type: "mrkdwn", text } };
}

function context(text: string) {
  return { type: "context", elements: [{ type: "mrkdwn", text }] };
}

function divider() {
  return { type: "divider" };
}

const SEVERITY_EMOJI: Record<string, string> = {
  low: "🟢",
  medium: "🟡",
  high: "🔴",
};

/**
 * TeamSophiaSlackBundle 을 채널별 Slack 메시지 배열로 변환한다.
 * 반환 순서: 요약 → 검수 필요 케이스(있을 때만) → 운영 로그.
 */
export function buildSlackMessages(bundle: TeamSophiaSlackBundle): SlackMessage[] {
  const messages: SlackMessage[] = [];

  // 1) 요약 (#team-sophia-daily)
  const s = bundle.summary;
  messages.push({
    channel: s.channel,
    text: s.headline,
    blocks: [
      section(`*📋 ${s.headline}*`),
      section(
        ["*오늘 바로 할 일*", ...s.todayActions.map((a) => `• ${a}`)].join("\n")
      ),
      context(`매장: *${s.storeName}*  ·  관여 코치: ${s.coachesInvolved.join(", ")}`),
    ],
  });

  // 2) 코치별 결과 요약 (각 코치 채널) — 5인 코치가 운영실에서 모두 보이도록
  for (const d of bundle.coachDigests) {
    messages.push({
      channel: d.channel,
      text: d.headline,
      blocks: [
        section(`*🧩 ${d.headline}*`),
        section(d.lines.map((l) => `• ${l}`).join("\n")),
      ],
    });
  }

  // 3) 검수 필요 케이스 (해당 코치 채널)
  for (const r of bundle.reviewCases) {
    const emoji = SEVERITY_EMOJI[r.severity] ?? "⚪";
    messages.push({
      channel: r.channel,
      text: `${emoji} 검수 필요: ${r.reason}`,
      blocks: [
        section(`*${emoji} 검수 필요 (${r.coachId})*\n${r.reason}`),
        section(`> ${r.excerpt}`),
        divider(),
      ],
    });
  }

  // 4) 운영 로그 (#build-log)
  for (const log of bundle.opsLog) {
    messages.push({
      channel: log.channel,
      text: `[${log.event}] ${log.detail}`,
      blocks: [context(`\`${log.event}\` · ${log.detail} · ${log.timestamp}`)],
    });
  }

  return messages;
}
