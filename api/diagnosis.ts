// Vercel 서버리스 함수: 장사비서 진단 생성 (POST /api/diagnosis)
//
// OpenAI 호출을 서버에서 수행해 OPENAI_API_KEY가 브라우저에 노출되지 않도록 한다.
// OPENAI_API_KEY 는 Vercel 프로젝트 환경변수에 설정한다.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateDiagnosisReport } from "../src/services/diagnosisCore.js";
import { DiagnosisData } from "../src/types.js";

// 진단 리포트 생성은 OpenAI 응답이 길어 수십 초가 걸릴 수 있다.
// Vercel 함수 기본 제한(10초)을 넘기지 않도록 실행 시간을 늘린다. (플랜 상한까지 적용)
export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST만 허용됩니다." });
  }

  let body: any = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "본문 JSON 파싱 실패" });
    }
  }

  const data = body?.data as DiagnosisData | undefined;
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "유효한 진단 데이터(data)가 필요합니다." });
  }

  try {
    const report = await generateDiagnosisReport(data, process.env.OPENAI_API_KEY);
    return res.status(200).json(report);
  } catch (e: any) {
    console.error("[api/diagnosis] 생성 오류:", e);
    const status = e?.status ?? 500;
    return res.status(status).json({ error: e?.message ?? "진단 리포트 생성 중 오류가 발생했습니다." });
  }
}
