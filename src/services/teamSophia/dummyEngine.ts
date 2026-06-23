// Team Sophia Dummy Engine
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md (이하 "정의서")
// 이 엔진은 실제 LLM을 호출하지 않는다. 장사비서 폼 입력값을 규칙 기반으로 매핑해
// TeamSophiaEngineResult 타입을 만족하는 결과를 반환한다. (LLM 연결은 다음 단계)
//
// 핵심 규칙(정의서 §5):
//   - 입력에 없는 숫자/메뉴/고객 반응/매장 정보는 지어내지 않는다. (§5-2)
//     → 값이 없으면 사실로 쓰지 않고 neededData / missingData 로 보낸다.
//   - 오늘 바로 할 일은 10~30분 내 작은 행동으로 제안한다. (§5-3)
//   - 코치가 맡을 일과 사장님이 직접 할 일을 구분한다. (§5-4)
//   - 등록부(COACHES)에 없는 코치는 만들지 않는다. (§5-5)

import {
  CONTEXT_DOC,
  TeamSophiaEngine,
  TeamSophiaEngineInput,
  TeamSophiaEngineResult,
  TeamSophiaReport,
} from "./types";
import { buildSlackBundle } from "./slackBundle";

// 진단 폼 항목 ID (constants.ts DIAGNOSIS_ITEMS 기준). 더미 엔진이 참조하는 것만 정의.
const FIELD = {
  category: 1, // 운영 업종 및 핵심 카테고리
  monthlySales: 7, // 월 평균 매출액
  monthlyCustomers: 9, // 월 평균 방문 고객 수
  avgTicket: 10, // 평균 객단가
  rent: 14, // 월 임대료
  materialRatio: 15, // 원재료비 점유율
  topMenus: 21, // 판매량 TOP 3
  retentionRate: 28, // 추정 단골 비율
  newCustomerChannels: 29, // 신규 고객 유입 경로
  claims: 30, // 주요 클레임 및 개선 요구사항
  positivePoints: 31, // 현장의 긍정적 반응 포인트
  naverPlace: 37, // 네이버 플레이스 관리 상태
  sns: 40, // 자체 SNS 채널 홍보 현황
  bottleneck: 50, // 가장 개선하고 싶은 병목 업무
  urgentTask: 52, // 현재 가장 시급한 경영 해결 과제
} as const;

/** 입력값을 안전하게 읽는다. 비어 있으면 undefined. (정의서 §5-2: 없는 값은 지어내지 않는다) */
function read(input: TeamSophiaEngineInput, id: number): string | undefined {
  const raw = input.diagnosis?.[id];
  if (raw == null) return undefined;
  const v = String(raw).trim();
  if (v === "" || v === "데이터 없음") return undefined;
  return v;
}

function has(input: TeamSophiaEngineInput, id: number): boolean {
  return read(input, id) !== undefined;
}

export const runDummyEngine: TeamSophiaEngine = async (
  input: TeamSophiaEngineInput
): Promise<TeamSophiaEngineResult> => {
  const generatedAt = new Date().toISOString();
  const storeName =
    input.storeName?.trim() || read(input, FIELD.category) || "사장님 매장";

  const urgent = read(input, FIELD.urgentTask);
  const bottleneck = read(input, FIELD.bottleneck);
  const claims = read(input, FIELD.claims);
  const positive = read(input, FIELD.positivePoints);
  const topMenus = read(input, FIELD.topMenus);
  const sns = read(input, FIELD.sns);
  const naver = read(input, FIELD.naverPlace);

  // --- 추가로 필요한 데이터 (§7-8): 진단 핵심 항목 중 비어 있는 것을 모은다. -----
  const neededChecks: { id: number; label: string }[] = [
    { id: FIELD.monthlySales, label: "월 평균 매출액" },
    { id: FIELD.monthlyCustomers, label: "월 평균 방문 고객 수" },
    { id: FIELD.avgTicket, label: "평균 객단가" },
    { id: FIELD.rent, label: "월 임대료" },
    { id: FIELD.materialRatio, label: "원재료비 점유율" },
    { id: FIELD.retentionRate, label: "추정 단골 비율" },
    { id: FIELD.topMenus, label: "판매량 TOP 3 메뉴" },
    { id: FIELD.claims, label: "주요 클레임" },
  ];
  const neededData = neededChecks
    .filter((c) => !has(input, c.id))
    .map((c) => `${c.label}을(를) 알려주시면 더 정확히 진단할 수 있어요.`);

  // --- 1. 소피아: 종합 정리 (§7-1) ----------------------------------------
  const sophiaSummary: TeamSophiaReport["sophiaSummary"] = {
    coachId: "sophia",
    emotionalNote:
      "사장님, 매장을 지키며 여기까지 오신 것만으로도 충분히 잘하고 계세요. 오늘은 가장 급한 한 가지부터 같이 정리해볼게요.",
    problemBreakdown: [
      urgent
        ? `가장 시급한 과제: ${urgent}`
        : "가장 시급한 과제가 아직 정리되지 않았어요. 함께 한 줄로 정리해봐요.",
      bottleneck
        ? `운영 병목: ${bottleneck}`
        : "운영 병목 지점이 입력되지 않아, 앤·클레어 진단으로 후보를 좁혀볼게요.",
    ],
    overview: urgent
      ? `이번 진단의 나침반은 "${urgent}"입니다. 앤이 숫자를, 클레어가 고객 반응을, 제인과 켈리가 실행안을 맡습니다.`
      : "이번 진단은 데이터를 먼저 채우는 데 집중합니다. 숫자가 모이면 처방이 날카로워집니다.",
  };

  // --- 2. 앤: 매출/데이터 진단 (§7-2) -------------------------------------
  const anneFindings: string[] = [];
  if (has(input, FIELD.monthlySales))
    anneFindings.push(`월 평균 매출액: ${read(input, FIELD.monthlySales)}`);
  if (has(input, FIELD.monthlyCustomers))
    anneFindings.push(`월 평균 방문 고객 수: ${read(input, FIELD.monthlyCustomers)}`);
  if (has(input, FIELD.avgTicket))
    anneFindings.push(`평균 객단가: ${read(input, FIELD.avgTicket)}`);
  if (has(input, FIELD.materialRatio))
    anneFindings.push(`원재료비 점유율: ${read(input, FIELD.materialRatio)}`);
  if (topMenus) anneFindings.push(`판매량 TOP 3: ${topMenus}`);

  const anneFieldIds: number[] = [
    FIELD.monthlySales,
    FIELD.monthlyCustomers,
    FIELD.avgTicket,
    FIELD.rent,
    FIELD.materialRatio,
  ];
  const anneMissing = neededChecks
    .filter((c) => anneFieldIds.includes(c.id) && !has(input, c.id))
    .map((c) => c.label);

  const anneDiagnosis: TeamSophiaReport["anneDiagnosis"] = {
    coachId: "anne-data",
    findings: anneFindings,
    diagnosis:
      anneFindings.length > 0
        ? "입력해주신 숫자 기준으로만 정리했어요. 추정값은 넣지 않았습니다."
        : "아직 숫자 데이터가 없어 매출 진단을 시작하지 못했어요. 아래 항목부터 채워주세요.",
    missingData: anneMissing,
  };

  // --- 3. 클레어: 고객/리뷰 진단 (§7-3) -----------------------------------
  const claireDiagnosis: TeamSophiaReport["claireDiagnosis"] = {
    coachId: "claire-cs",
    customerIssues: claims ? [claims] : [],
    replyDrafts: claims
      ? [
          "고객님, 불편을 드려 진심으로 죄송합니다. 말씀해주신 부분은 바로 점검해 개선하겠습니다. 다시 방문해주시면 더 나아진 모습 보여드릴게요.",
        ]
      : [],
    preventiveActions: claims
      ? ["반복된 클레임 1건을 체크리스트로 만들어 마감 전 점검 항목에 추가하기"]
      : ["최근 1개월 리뷰/클레임을 5건만 모아 클레어에게 전달하기"],
  };

  // --- 4. 제인: 마케팅 실행안 (§7-4, 저비용 우선) -------------------------
  const janePlan: TeamSophiaReport["janePlan"] = {
    coachId: "jane-marketer",
    actions: [
      {
        idea: naver
          ? "네이버 플레이스 대표 사진 3장 교체 + 최신 메뉴/영업시간 갱신"
          : "네이버 플레이스 정보(사진·영업시간·메뉴) 최신화부터 시작",
        cost: "무료",
        expectedEffect: "검색 노출 시 신규 고객의 첫인상 개선",
      },
      {
        idea: positive
          ? `단골이 좋아한 포인트(${positive})를 한 줄 후킹 문구로 만들어 단골 대상 재방문 쿠폰 발송`
          : "단골 대상 '이번 주만' 소규모 재방문 혜택 1가지 운영",
        cost: "저비용",
        expectedEffect: "재방문 주기 단축",
      },
    ],
  };

  // --- 5. 켈리: 콘텐츠 아이디어 (§7-5, 얼굴 노출 없음) --------------------
  const kellyIdeas: TeamSophiaReport["kellyIdeas"] = {
    coachId: "kelly-creator",
    ideas: [
      {
        format: "릴스",
        concept: topMenus
          ? `시그니처 메뉴(${topMenus}) 조리·플레이팅 클로즈업 15초`
          : "대표 메뉴 1개의 조리 과정 클로즈업 15초",
        caption: "오늘도 정성껏 준비했습니다 🔥 #동네맛집",
        faceless: true,
      },
      {
        format: "카드뉴스",
        concept: "메뉴 추천 TOP 3 + 방문 꿀팁 한 장 요약",
        caption: "처음 오셨다면 이것부터! 👀",
        faceless: true,
      },
    ],
  };

  // --- 6. 오늘 바로 할 일 3개 (§7-6, 각 10~30분) -------------------------
  const todayActions: TeamSophiaReport["todayActions"] = [
    {
      task: naver
        ? "네이버 플레이스 대표 사진 3장 점검·교체"
        : "네이버 플레이스에 최신 메뉴 사진 3장 등록",
      estimatedMinutes: 20,
      owner: "owner",
    },
    {
      task: claims
        ? "반복 클레임 1건에 대한 점검 항목을 마감 체크리스트에 추가"
        : "최근 리뷰/클레임 5건을 모아 정리",
      estimatedMinutes: 15,
      owner: "owner",
    },
    {
      task:
        anneMissing.length > 0
          ? `매출 진단용 숫자(${anneMissing.slice(0, 2).join(", ")}) 입력하기`
          : "단골 재방문 혜택 문구 1줄 확정하기",
      estimatedMinutes: 10,
      owner: "owner",
    },
  ];

  // --- 7. 이번 주 실행 플랜 (§7-7) ---------------------------------------
  const weeklyPlan: TeamSophiaReport["weeklyPlan"] = [
    { when: "월", task: "네이버 플레이스 정보·사진 최신화", owner: "owner" },
    { when: "수", task: "단골 대상 저비용 재방문 혜택 1가지 시작", owner: "jane-marketer" },
    { when: "금", task: "릴스/카드뉴스 콘텐츠 1건 게시", owner: "kelly-creator" },
    { when: "일", task: "한 주 매출·반응 숫자 점검", owner: "anne-data" },
  ];

  // --- 9. 팀소피아 업무 배정 (§7-9, 코치/사장님 구분 §5-4) ----------------
  const assignments: TeamSophiaReport["assignments"] = [
    { owner: "owner", task: "오늘 바로 할 일 3개 실행 및 숫자 데이터 입력" },
    { owner: "anne-data", task: "입력된 숫자 기반 매출·메뉴 진단 정밀화", note: "추정값 금지" },
    { owner: "claire-cs", task: "클레임 답글 초안·재발 방지 액션 정리" },
    { owner: "jane-marketer", task: "저비용 마케팅 실행안 구체화" },
    { owner: "kelly-creator", task: "얼굴 노출 없는 콘텐츠 2건 기획" },
  ];

  const report: TeamSophiaReport = {
    sophiaSummary,
    anneDiagnosis,
    claireDiagnosis,
    janePlan,
    kellyIdeas,
    todayActions,
    weeklyPlan,
    neededData,
    assignments,
  };

  // --- Slack 페이로드 (§6: 요약 / 검수 필요 케이스 / 운영 로그만) ----------
  // §6 페이로드는 공유 헬퍼로 리포트에서 파생한다. (LLM 엔진과 동일 로직)
  const slack = buildSlackBundle(report, {
    storeName,
    generatedAt,
    engine: "dummy",
    headline: urgent
      ? `[${storeName}] 시급 과제: ${urgent}`
      : `[${storeName}] 데이터 보강 우선 — 진단 시작`,
  });

  return {
    report,
    slack,
    meta: {
      engine: "dummy",
      generatedAt,
      contextDoc: CONTEXT_DOC,
    },
  };
};
