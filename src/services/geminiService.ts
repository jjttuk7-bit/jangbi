// 장사비서 진단 클라이언트 (브라우저 측)
//
// OpenAI를 브라우저에서 직접 호출하지 않는다. 서버리스 함수(/api/diagnosis)로 요청해
// OpenAI 키가 클라이언트 번들에 노출되지 않도록 한다.
// 실제 OpenAI 호출/프롬프트 로직은 src/services/diagnosisCore.ts(서버 전용)에 있다.

import { DiagnosisData, DiagnosisReport } from "../types";

export async function generateDiagnosis(data: DiagnosisData): Promise<DiagnosisReport> {
  const res = await fetch("/api/diagnosis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!res.ok) {
    let message = `진단 리포트 생성에 실패했습니다. (HTTP ${res.status})`;
    try {
      const err = await res.json();
      if (err?.error) message = err.error;
    } catch {
      /* 본문 파싱 실패 시 기본 메시지 사용 */
    }
    throw new Error(message);
  }

  return (await res.json()) as DiagnosisReport;
}
