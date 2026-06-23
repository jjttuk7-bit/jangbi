// Hermes 요청 프롬프트 빌더
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md
// 장사비서 폼 입력값 + 사장님이 정의한 운영 규칙을 Hermes가 이해하는 형식으로 조립한다.
// Hermes는 /opt/data/team-sophia/ 파일을 읽고 팀소피아 코치로 응답한다.

import { DIAGNOSIS_ITEMS } from "../../constants.js";
import { DiagnosisData } from "../../types.js";
import { CoachId, COACHES } from "./types.js";

function filledFields(diagnosis: DiagnosisData): string {
  return DIAGNOSIS_ITEMS.filter((i) => {
    const v = diagnosis[i.id];
    return v != null && String(v).trim() !== "";
  })
    .map((i) => `- ${i.label}: ${diagnosis[i.id]}`)
    .join("\n");
}

// 코치별 '도구로 진짜 작업' 지침 — 추정·말이 아니라 실제 산출물을 내게 한다.
const TOOL_GUIDE: Record<CoachId, string> = {
  sophia:
    "코치들의 산출을 종합하고, 사장님의 우선순위를 정리한다.",
  "anne-data":
    "추정으로 때우지 말고 주어진 숫자를 직접 계산해 실제 수치를 산출하라. 필요하면 코드 실행(execute_code/파이썬) 도구로 정확히 계산하라. 예: 객수×객단가 vs 매출 정합성, 일/주/월 환산, 손익분기·공헌이익 시뮬레이션을 '계산 결과 표'로 제시.",
  "claire-cs":
    "일반론 금지. 바로 게시 가능한 실제 리뷰 답글 초안(상황별 2~3개)을 완성형 문장으로 써라.",
  "jane-marketer":
    "가능하면 웹검색 도구로 실제 경쟁사·지역 상권·최신 마케팅 트렌드를 조사해 근거를 붙여라. 산출물은 '요일별 1주 실행 캘린더'(무엇을/어디에/예상효과)로.",
  "kelly-creator":
    "아이디어 나열 금지. 바로 촬영/게시할 수 있는 실제 콘텐츠 시안(15초 구성·자막 문구·해시태그)을 완성형으로 써라.",
};

/**
 * 단일 코치 에이전트(독립 프로필)용 프롬프트. 해당 코치 채널에서 그 코치 역할로만 응답.
 * @param mention 코치 에이전트를 깨우는 멘션 ("<@U...>" 권장)
 */
export function buildCoachPrompt(coachId: CoachId, diagnosis: DiagnosisData, mention: string): string {
  const c = COACHES[coachId];
  return `${mention}

너는 팀소피아의 ${c.name}이야. /opt/data/team-sophia/coaches/${coachId}/ 의 정체성 문서를 읽고, ${c.role} 역할로만 응답해.

상황 (장사비서 폼 입력):
${filledFields(diagnosis) || "(아직 입력된 데이터가 거의 없음)"}

분석 지침 (중요):
1. 먼저 주어진 숫자로 실질적인 1차 분석을 한다. 데이터가 부족하다는 이유로 분석을 통째로 미루지 않는다.
   - 숫자 간 정합성 점검 (예: 방문 객수 × 객단가 vs 월매출이 맞는지)
   - 일/월 환산, 업종 일반 기준 대비 진단, 도출 가능한 인사이트·이상치
2. 도구로 진짜 작업하라(추정·말로 때우지 말 것): ${TOOL_GUIDE[coachId]}
3. 그 다음, 더 정밀한 분석을 위해 추가로 필요한 최소 데이터 양식을 안내한다. (1차 분석·산출물 없이 양식만 주는 것은 금지)

규칙:
- 사용자를 "사장님"이라고 부른다.
- 없는 숫자/사실을 지어내지 않는다. 추정할 때는 "추정"임을 밝힌다.
- 네 전문 영역(${c.role})에만 집중한다. 다른 코치 영역은 다루지 않는다.`;
}

/**
 * @param diagnosis 장사비서 폼 입력
 * @param hermesMention Hermes를 깨우는 멘션 문자열 ("<@U...>" 권장, 없으면 "@Hermes Agent")
 * @param basicSummary gpt-4o가 만든 '기초 분석' 요약(있으면). 팀소피아는 이걸 검증·심화한다.
 */
export function buildHermesPrompt(diagnosis: DiagnosisData, hermesMention = "@Hermes Agent", basicSummary = ""): string {
  const filled = DIAGNOSIS_ITEMS.filter((i) => {
    const v = diagnosis[i.id];
    return v != null && String(v).trim() !== "";
  })
    .map((i) => `- ${i.label}: ${diagnosis[i.id]}`)
    .join("\n");

  const basicBlock = basicSummary.trim()
    ? `\n[이미 제공된 '기초 분석' (gpt-4o 자동 생성 · 참고용)]\n${basicSummary.trim()}\n\n→ 팀소피아는 이 기초 분석을 그대로 반복하지 마라. 반드시 한 단계 위로 올라서라:\n  (a) 검증·교정: 숫자 정합성(객수×객단가 vs 매출 등), 기초가 놓친 관점·오류를 짚는다.\n  (b) 심화: 표면 증상이 아니라 진짜 원인과 우선순위를 짚는다.\n  (c) 구체적 실행물 산출: 일반 조언이 아니라 바로 쓸 결과물을 낸다 — 클레어=실제 리뷰 답글 초안 문구, 제인=요일별 주간 실행 캘린더, 켈리=콘텐츠 문안/콘티, 앤=계산·진단표.\n`
    : "";

  return `${hermesMention}

/opt/data/team-sophia/sophia/ 문서,
/opt/data/team-sophia/coaches/anne-data/ 문서,
/opt/data/team-sophia/coaches/claire-cs/ 문서,
/opt/data/team-sophia/coaches/jane-marketer/ 문서,
/opt/data/team-sophia/coaches/kelly-creator/ 문서,
/opt/data/team-sophia/shared/coach_registry.md,
/opt/data/team-sophia/slack/operating_rules.md 를 읽고,
팀소피아 5인 코치로 응답해줘.

상황:
아래는 장사비서 폼에 입력된 사장님 매장 현황이야.
${filled || "(아직 입력된 데이터가 거의 없음)"}
${basicBlock}
응답에는 반드시 다음을 포함해줘. (각 코치는 기초 분석보다 더 깊고 구체적이어야 함)
1. 소피아의 종합 정리 (기초 대비 무엇이 더/다른지 핵심)
2. 앤의 매출/데이터 진단 (정합성 검증 + 계산·진단)
3. 클레어의 고객/리뷰 진단 (실제 답글 초안 포함)
4. 제인의 마케팅 실행안 (주간 실행 캘린더 등 구체물)
5. 켈리의 콘텐츠 아이디어 (실제 문안/콘티)
6. 오늘 사장님이 바로 할 일 3개
7. [팀소피아 업무 배정]
8. 추가로 필요한 데이터나 정보

주의:
- 사용자를 반드시 "사장님"이라고 불러줘.
- "팀장님", "대표님", "사랑하는 OO님"이라고 부르지 마.
- 주어진 숫자가 있으면 먼저 실질적 1차 분석(정합성 점검·일월 환산·업종 기준 대비 진단)을 하고, 그 다음에 추가 데이터를 요청해줘. 데이터 부족을 이유로 분석을 통째로 미루지 마.
- 추정·말로 때우지 말고 도구로 진짜 산출해줘: 앤=직접 계산(execute_code/파이썬으로 정합성·환산·시뮬레이션), 제인=웹검색으로 실제 경쟁사·상권 조사, 켈리=실제 콘텐츠 문안, 클레어=실제 답글 초안.
- 오늘 바로 할 일 3개는 사장님이 직접 할 일로만 작성해줘.
- 코치들이 맡을 일은 [팀소피아 업무 배정]에 따로 정리해줘.
- 없는 숫자는 지어내지 말고(추정 시 '추정' 명시), 더 필요한 최소 데이터 양식을 안내해줘.`;
}
