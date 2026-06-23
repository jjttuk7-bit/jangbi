// Team Sophia Dummy Engine - 타입 및 결과 구조 정의
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md (이하 "정의서")
// 이 파일은 정의서 §3~§7을 코드 타입으로 옮긴 것이며, 정의서를 단일 기준으로 삼는다.
// 정의가 바뀌면 코드보다 정의서를 먼저 갱신한다. (정의서 §8)
//
// 주의: 아직 실제 LLM은 호출하지 않는다. 여기서는 타입/결과 구조만 정의한다.

import { DiagnosisData } from "../../types.js";

export const CONTEXT_DOC = "docs/TEAM_SOPHIA_SLACK_CONTEXT.md";

// ---------------------------------------------------------------------------
// §4 정식 코치 ID와 채널명 (등록부)
// ---------------------------------------------------------------------------

/** 등록부(정의서 §4)에 등록된 정식 코치 ID. 이 외의 코치는 생성하지 않는다. (정의서 §5-5) */
export type CoachId =
  | "sophia"
  | "anne-data"
  | "claire-cs"
  | "jane-marketer"
  | "kelly-creator";

export interface CoachProfile {
  id: CoachId;
  /** 표시 이름 (예: "마스터 코치 소피아") */
  name: string;
  /** 짧은 호칭 (예: "소피아") */
  shortName: string;
  /** Slack 채널명 (예: "#sophia") */
  channel: string;
  /** 담당 역할 (정의서 §3) */
  role: string;
}

/** 정의서 §3·§4를 그대로 옮긴 코치 등록부. 엔진/리포트의 단일 기준. */
export const COACHES: Record<CoachId, CoachProfile> = {
  sophia: {
    id: "sophia",
    name: "마스터 코치 소피아",
    shortName: "소피아",
    channel: "#sophia",
    role: "사장님의 감정 정리, 문제 분해, 팀 업무 배정",
  },
  "anne-data": {
    id: "anne-data",
    name: "데이터 분석가 앤",
    shortName: "앤",
    channel: "#anne-data",
    role: "매출·메뉴·데이터 분석, 최소 데이터 양식 안내",
  },
  "claire-cs": {
    id: "claire-cs",
    name: "CS 코치 클레어",
    shortName: "클레어",
    channel: "#claire-cs",
    role: "리뷰, 고객 불만, 답글 초안, 재발 방지 액션",
  },
  "jane-marketer": {
    id: "jane-marketer",
    name: "마케터 제인",
    shortName: "제인",
    channel: "#jane-marketer",
    role: "SNS 마케팅, 이벤트, 신규 고객 확보, 저비용 실행 플랜",
  },
  "kelly-creator": {
    id: "kelly-creator",
    name: "크리에이터 켈리",
    shortName: "켈리",
    channel: "#kelly-creator",
    role: "릴스, 쇼츠, 카드뉴스, 게시물 문안, 얼굴 노출 없는 콘텐츠 아이디어",
  },
};

/** 전체 팀/PM/종합 상담 채널 (정의서 §2) */
export const CHANNEL_TEAM_DAILY = "#team-sophia-daily";
/** 문서 생성·수정·테스트 기록 채널 (정의서 §2) */
export const CHANNEL_BUILD_LOG = "#build-log";

// ---------------------------------------------------------------------------
// §5 공통 규칙을 표현하는 공용 타입
// ---------------------------------------------------------------------------

/** 일을 누가 하는가. 코치가 맡을 일과 사장님이 직접 할 일을 구분한다. (정의서 §5-4) */
export type TaskOwner = CoachId | "owner"; // "owner" = 사장님 본인

/**
 * 오늘 바로 할 일 한 건.
 * 정의서 §5-3: 10~30분 안에 가능한 작은 행동으로 제안한다.
 */
export interface QuickAction {
  task: string;
  /** 예상 소요 시간(분). 권장 범위 10~30. (정의서 §5-3) */
  estimatedMinutes: number;
  /** 누가 하는가 (정의서 §5-4) */
  owner: TaskOwner;
}

/** 이번 주 실행 플랜 항목 (정의서 §7-7) */
export interface WeeklyPlanItem {
  /** 예: "월", "1일차" 등 */
  when: string;
  task: string;
  owner: TaskOwner;
}

/** 팀소피아 업무 배정 한 건 (정의서 §7-9, §5-4) */
export interface TaskAssignment {
  owner: TaskOwner;
  task: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// §3·§7 코치별 결과 블록
// ---------------------------------------------------------------------------

/** 1. 소피아의 종합 정리 (정의서 §7-1, 역할 §3) */
export interface SophiaSummaryBlock {
  coachId: "sophia";
  /** 사장님의 감정 정리 */
  emotionalNote: string;
  /** 문제 분해 */
  problemBreakdown: string[];
  /** 종합 정리 한 단락 */
  overview: string;
}

/** 2. 앤의 매출/데이터 진단 (정의서 §7-2, 역할 §3) */
export interface AnneDataBlock {
  coachId: "anne-data";
  /** 입력 데이터에서 실제로 읽어낸 사실만. 없는 숫자는 만들지 않는다. (정의서 §5-2) */
  findings: string[];
  diagnosis: string;
  /** 진단을 위해 부족한 데이터(=정의서 §7-8 후보). 추정 대신 요청한다. */
  missingData: string[];
}

/** 3. 클레어의 고객/리뷰 진단 (정의서 §7-3, 역할 §3) */
export interface ClaireCsBlock {
  coachId: "claire-cs";
  customerIssues: string[];
  /** 답글 초안 */
  replyDrafts: string[];
  /** 재발 방지 액션 */
  preventiveActions: string[];
}

/** 4. 제인의 마케팅 실행안 (정의서 §7-4, 역할 §3) */
export interface JaneMarketingBlock {
  coachId: "jane-marketer";
  actions: {
    idea: string;
    /** 저비용 실행 원칙 반영 (정의서 §3) */
    cost: "무료" | "저비용" | "유료";
    expectedEffect: string;
  }[];
}

/** 5. 켈리의 콘텐츠 아이디어 (정의서 §7-5, 역할 §3) */
export interface KellyContentBlock {
  coachId: "kelly-creator";
  ideas: {
    format: "릴스" | "쇼츠" | "카드뉴스" | "게시물";
    concept: string;
    /** 게시물 문안 */
    caption: string;
    /** 얼굴 노출 없는 콘텐츠 여부 (정의서 §3) */
    faceless: boolean;
  }[];
}

// ---------------------------------------------------------------------------
// §7 장사비서 결과에 포함될 팀소피아 리포트 구조 (9블록)
// ---------------------------------------------------------------------------

export interface TeamSophiaReport {
  /** 1. 소피아의 종합 정리 */
  sophiaSummary: SophiaSummaryBlock;
  /** 2. 앤의 매출/데이터 진단 */
  anneDiagnosis: AnneDataBlock;
  /** 3. 클레어의 고객/리뷰 진단 */
  claireDiagnosis: ClaireCsBlock;
  /** 4. 제인의 마케팅 실행안 */
  janePlan: JaneMarketingBlock;
  /** 5. 켈리의 콘텐츠 아이디어 */
  kellyIdeas: KellyContentBlock;
  /** 6. 오늘 바로 할 일 3개 (각 10~30분 내, 정의서 §5-3·§7-6) */
  todayActions: QuickAction[];
  /** 7. 이번 주 실행 플랜 */
  weeklyPlan: WeeklyPlanItem[];
  /** 8. 추가로 필요한 데이터 */
  neededData: string[];
  /** 9. 팀소피아 업무 배정 (코치/사장님 구분, 정의서 §5-4·§7-9) */
  assignments: TaskAssignment[];
}

// ---------------------------------------------------------------------------
// §6 Slack(내부 운영실)로 보낼 페이로드
//   - Slack에는 고객 상담 전체가 아니라 요약 / 검수 필요 케이스 / 운영 로그만 보낸다.
// ---------------------------------------------------------------------------

/** 요약: 보통 #team-sophia-daily 로 보낸다. (정의서 §6) */
export interface SlackSummaryPayload {
  channel: string;
  /** 입력값 기반 매장 식별. 날조 금지. (정의서 §5-2) */
  storeName: string;
  /** 한 줄 요약 */
  headline: string;
  /** 오늘 바로 할 일 요약 */
  todayActions: string[];
  /** 이번 케이스에 관여한 코치 */
  coachesInvolved: CoachId[];
}

/** 검수 필요 케이스: 사람이 확인해야 하는 출력. 해당 코치 채널로 보낸다. (정의서 §6) */
export interface SlackReviewCasePayload {
  channel: string;
  coachId: CoachId;
  /** 왜 검수가 필요한가 (예: 데이터 부족, 민감 답글, 비용 발생) */
  reason: string;
  /** 검수 대상 내용 일부 */
  excerpt: string;
  severity: "low" | "medium" | "high";
}

/** 운영 로그: #build-log 로 보낸다. (정의서 §2·§6) */
export interface SlackOpsLogPayload {
  channel: typeof CHANNEL_BUILD_LOG;
  /** 예: "report.generated", "review.flagged" */
  event: string;
  detail: string;
  /** ISO 8601 timestamp */
  timestamp: string;
}

/** Slack으로 전송될 묶음 (정의서 §6의 3종류만 포함) */
export interface TeamSophiaSlackBundle {
  summary: SlackSummaryPayload;
  reviewCases: SlackReviewCasePayload[];
  opsLog: SlackOpsLogPayload[];
}

// ---------------------------------------------------------------------------
// 엔진 입출력
// ---------------------------------------------------------------------------

/** 엔진 입력: 장사비서 폼 입력값이 곧 컨설팅 입력이다. (정의서 §6) */
export interface TeamSophiaEngineInput {
  /** 장사비서 진단 폼 입력값 */
  diagnosis: DiagnosisData;
  /** 매장명 (입력값에서 확보 가능 시) */
  storeName?: string;
}

/**
 * 엔진 출력.
 * - report: 장사비서 결과 화면용 (정의서 §7)
 * - slack : Slack 내부 운영실용 (정의서 §6)
 */
export interface TeamSophiaEngineResult {
  report: TeamSophiaReport;
  slack: TeamSophiaSlackBundle;
  meta: {
    /** 결과를 생성한 엔진. "dummy" = 규칙 기반, "llm" = 실제 LLM 호출. */
    engine: "dummy" | "llm";
    /** ISO 8601 timestamp */
    generatedAt: string;
    /** 기준 문서 추적용 */
    contextDoc: typeof CONTEXT_DOC;
  };
}

/**
 * Team Sophia 엔진 함수 시그니처.
 * Dummy 단계에서는 실제 LLM 호출 없이 이 시그니처를 만족하는 고정/규칙 기반 결과를 반환한다.
 * (구현은 다음 단계: src/services/teamSophia/dummyEngine.ts)
 */
export type TeamSophiaEngine = (
  input: TeamSophiaEngineInput
) => Promise<TeamSophiaEngineResult>;
