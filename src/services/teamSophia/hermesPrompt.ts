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
2. 그 다음, 더 정밀한 분석을 위해 추가로 필요한 최소 데이터 양식을 안내한다. (1차 분석 없이 양식만 주는 것은 금지)

규칙:
- 사용자를 "사장님"이라고 부른다.
- 없는 숫자/사실을 지어내지 않는다. 추정할 때는 "추정"임을 밝힌다.
- 네 전문 영역(${c.role})에만 집중한다. 다른 코치 영역은 다루지 않는다.`;
}

/**
 * @param diagnosis 장사비서 폼 입력
 * @param hermesMention Hermes를 깨우는 멘션 문자열 ("<@U...>" 권장, 없으면 "@Hermes Agent")
 */
export function buildHermesPrompt(diagnosis: DiagnosisData, hermesMention = "@Hermes Agent"): string {
  const filled = DIAGNOSIS_ITEMS.filter((i) => {
    const v = diagnosis[i.id];
    return v != null && String(v).trim() !== "";
  })
    .map((i) => `- ${i.label}: ${diagnosis[i.id]}`)
    .join("\n");

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

응답에는 반드시 다음을 포함해줘.
1. 소피아의 종합 정리
2. 앤의 매출/데이터 진단
3. 클레어의 고객/리뷰 진단
4. 제인의 마케팅 실행안
5. 켈리의 콘텐츠 아이디어
6. 오늘 사장님이 바로 할 일 3개
7. [팀소피아 업무 배정]
8. 추가로 필요한 데이터나 정보

주의:
- 사용자를 반드시 "사장님"이라고 불러줘.
- "팀장님", "대표님", "사랑하는 OO님"이라고 부르지 마.
- 주어진 숫자가 있으면 먼저 실질적 1차 분석(정합성 점검·일월 환산·업종 기준 대비 진단)을 하고, 그 다음에 추가 데이터를 요청해줘. 데이터 부족을 이유로 분석을 통째로 미루지 마.
- 오늘 바로 할 일 3개는 사장님이 직접 할 일로만 작성해줘.
- 코치들이 맡을 일은 [팀소피아 업무 배정]에 따로 정리해줘.
- 없는 숫자는 지어내지 말고(추정 시 '추정' 명시), 더 필요한 최소 데이터 양식을 안내해줘.`;
}
