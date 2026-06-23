// Team Sophia LLM 코어 (서버 전용)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md (이하 "정의서")
// 실제 OpenAI 호출로 팀소피아 리포트(§7)를 생성한다. Slack 번들(§6)·meta는
// 호출부(api/team-sophia.ts)에서 조립한다.
//
// OpenAI를 직접 호출하므로 서버리스 함수에서만 import 한다. 브라우저는
// src/services/teamSophia/llmEngine.ts(얇은 클라이언트)를 통해 /api/team-sophia 로 요청한다.
//
// 공통 규칙(정의서 §5)을 시스템 프롬프트로 강제한다:
//   - 입력에 없는 숫자/메뉴/고객 반응/매장 정보는 지어내지 않는다. (§5-2)
//   - 오늘 바로 할 일은 10~30분 내 작은 행동. (§5-3)
//   - 코치/사장님 일을 구분한다. (§5-4)
//   - 등록부에 없는 코치는 만들지 않는다. (§5-5)

import OpenAI from "openai";
import { DIAGNOSIS_ITEMS } from "../../constants";
import {
  COACHES,
  CoachId,
  TaskOwner,
  TeamSophiaEngineInput,
  TeamSophiaReport,
} from "./types";

function getAI(apiKey: string | undefined) {
  if (!apiKey) {
    throw new Error("팀소피아 LLM 엔진을 가동하기 위한 OPENAI_API_KEY가 설정되지 않았습니다.");
  }
  return new OpenAI({ apiKey });
}

// --- 정규화 헬퍼 (LLM 출력의 타입 안전성 확보) ---------------------------------
function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}
function arr<T = unknown>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [];
  return [v] as T[];
}
function strArr(v: unknown): string[] {
  return arr(v).map(str).filter((s) => s.trim() !== "");
}
function clampMinutes(v: unknown): number {
  const n = Number(v);
  if (isNaN(n)) return 15;
  return Math.min(30, Math.max(5, Math.round(n)));
}

const VALID_OWNERS = new Set<TaskOwner>(["owner", ...(Object.keys(COACHES) as CoachId[])]);
function normOwner(v: unknown): TaskOwner {
  const s = str(v).trim();
  if (VALID_OWNERS.has(s as TaskOwner)) return s as TaskOwner;
  if (s.includes("사장")) return "owner";
  return "owner";
}

function normCost(v: unknown): "무료" | "저비용" | "유료" {
  const s = str(v);
  if (s.includes("무료") || s === "free") return "무료";
  if (s.includes("유료") || s === "paid") return "유료";
  return "저비용";
}

function normFormat(v: unknown): "릴스" | "쇼츠" | "카드뉴스" | "게시물" {
  const s = str(v);
  if (s.includes("릴스") || /reels/i.test(s)) return "릴스";
  if (s.includes("쇼츠") || /shorts/i.test(s)) return "쇼츠";
  if (s.includes("카드")) return "카드뉴스";
  return "게시물";
}

/** LLM이 반환한 JSON을 TeamSophiaReport로 정규화한다. coachId는 등록부 기준으로 강제. */
function normalizeReport(p: any): TeamSophiaReport {
  const s = p?.sophiaSummary ?? {};
  const anne = p?.anneDiagnosis ?? {};
  const claire = p?.claireDiagnosis ?? {};
  const jane = p?.janePlan ?? {};
  const kelly = p?.kellyIdeas ?? {};

  return {
    sophiaSummary: {
      coachId: "sophia",
      emotionalNote: str(s.emotionalNote),
      problemBreakdown: strArr(s.problemBreakdown),
      overview: str(s.overview),
    },
    anneDiagnosis: {
      coachId: "anne-data",
      findings: strArr(anne.findings),
      diagnosis: str(anne.diagnosis),
      missingData: strArr(anne.missingData),
    },
    claireDiagnosis: {
      coachId: "claire-cs",
      customerIssues: strArr(claire.customerIssues),
      replyDrafts: strArr(claire.replyDrafts),
      preventiveActions: strArr(claire.preventiveActions),
    },
    janePlan: {
      coachId: "jane-marketer",
      actions: arr<any>(jane.actions).map((a) => ({
        idea: str(a?.idea),
        cost: normCost(a?.cost),
        expectedEffect: str(a?.expectedEffect),
      })),
    },
    kellyIdeas: {
      coachId: "kelly-creator",
      ideas: arr<any>(kelly.ideas).map((i) => ({
        format: normFormat(i?.format),
        concept: str(i?.concept),
        caption: str(i?.caption),
        faceless: i?.faceless !== false, // 기본 true (얼굴 노출 없음, §3)
      })),
    },
    todayActions: arr<any>(p?.todayActions)
      .slice(0, 3) // 오늘 바로 할 일 3개 (§7-6)
      .map((a) => ({
        task: str(a?.task),
        estimatedMinutes: clampMinutes(a?.estimatedMinutes),
        owner: normOwner(a?.owner),
      })),
    weeklyPlan: arr<any>(p?.weeklyPlan).map((w) => ({
      when: str(w?.when),
      task: str(w?.task),
      owner: normOwner(w?.owner),
    })),
    neededData: strArr(p?.neededData),
    assignments: arr<any>(p?.assignments).map((a) => ({
      owner: normOwner(a?.owner),
      task: str(a?.task),
      note: a?.note ? str(a.note) : undefined,
    })),
  };
}

function buildDataSummary(input: TeamSophiaEngineInput): string {
  return DIAGNOSIS_ITEMS.map((item) => {
    const value = input.diagnosis?.[item.id];
    const v = value == null || String(value).trim() === "" ? "데이터 없음" : String(value);
    return `${item.id}. ${item.label}: ${v}`;
  }).join("\n");
}

const COACH_BRIEF = (Object.values(COACHES) as (typeof COACHES)[CoachId][])
  .map((c) => `- ${c.name} (${c.id}, ${c.channel}): ${c.role}`)
  .join("\n");

const SYSTEM_INSTRUCTION = `당신은 소상공인(사장님)을 돕는 AI 컨설팅 팀 '팀소피아'입니다. 5인 코치가 한 팀으로 움직입니다.

[등록부 — 이 외의 코치는 절대 만들지 마세요]
${COACH_BRIEF}

[공통 규칙]
1. 사용자는 "사장님"이라고 부릅니다.
2. 입력에 없는 숫자/메뉴/고객 반응/매장 정보를 절대 지어내지 마세요. 모르면 추정하지 말고 '추가로 필요한 데이터(neededData)'와 앤의 missingData로 요청하세요.
3. '오늘 바로 할 일'은 각 10~30분 안에 가능한 아주 작은 행동으로 제안하세요.
4. 코치가 맡을 일과 사장님이 직접 할 일을 구분하세요(owner 필드: "owner"=사장님, 그 외는 코치 id).
5. 켈리의 콘텐츠는 기본적으로 얼굴 노출이 없습니다(faceless=true).
6. 제인의 마케팅은 저비용/무료 실행을 우선합니다.

[출력 형식 — 반드시 유효한 JSON, 아래 구조를 정확히 따르세요]
{
  "sophiaSummary": { "emotionalNote": string, "problemBreakdown": string[], "overview": string },
  "anneDiagnosis": { "findings": string[], "diagnosis": string, "missingData": string[] },
  "claireDiagnosis": { "customerIssues": string[], "replyDrafts": string[], "preventiveActions": string[] },
  "janePlan": { "actions": [ { "idea": string, "cost": "무료"|"저비용"|"유료", "expectedEffect": string } ] },
  "kellyIdeas": { "ideas": [ { "format": "릴스"|"쇼츠"|"카드뉴스"|"게시물", "concept": string, "caption": string, "faceless": boolean } ] },
  "todayActions": [ { "task": string, "estimatedMinutes": number, "owner": "owner"|코치id } ],
  "weeklyPlan": [ { "when": string, "task": string, "owner": "owner"|코치id } ],
  "neededData": string[],
  "assignments": [ { "owner": "owner"|코치id, "task": string, "note"?: string } ]
}
todayActions는 정확히 3개를 제안하세요. findings에는 입력에 실제로 존재하는 값만 인용하세요.`;

/** 입력값에서 매장명을 도출한다(없으면 기본값). Slack 요약·meta 조립에 사용. */
export function deriveStoreName(input: TeamSophiaEngineInput): string {
  return (
    input.storeName?.trim() ||
    (input.diagnosis?.[1] ? String(input.diagnosis[1]) : "") ||
    "사장님 매장"
  );
}

/** OpenAI를 호출해 팀소피아 리포트(§7)만 생성한다. Slack 번들·meta는 호출부에서 조립. */
export async function generateTeamSophiaReport(
  input: TeamSophiaEngineInput,
  apiKey: string | undefined
): Promise<TeamSophiaReport> {
  const ai = getAI(apiKey);

  const prompt = `다음은 장사비서 폼에 입력된 매장 진단 데이터입니다:
${buildDataSummary(input)}

위 데이터만을 근거로 팀소피아 5인 코치 리포트를 작성하세요. 없는 정보는 지어내지 말고 neededData로 요청하세요.`;

  const response = await ai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4096,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("팀소피아 LLM 응답을 생성하지 못했습니다.");
  }

  return normalizeReport(JSON.parse(text));
}
