// Hermes 요청 프롬프트 빌더
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md
// 장사비서 폼 입력값 + 사장님이 정의한 운영 규칙을 Hermes가 이해하는 형식으로 조립한다.
// Hermes는 /opt/data/team-sophia/ 파일을 읽고 팀소피아 코치로 응답한다.

import { DIAGNOSIS_ITEMS } from "../../constants";
import { DiagnosisData } from "../../types";

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
- 오늘 바로 할 일 3개는 사장님이 직접 할 일로만 작성해줘.
- 코치들이 맡을 일은 [팀소피아 업무 배정]에 따로 정리해줘.
- 데이터가 없으면 숫자를 지어내지 말고, 최소 데이터 양식을 안내해줘.`;
}
