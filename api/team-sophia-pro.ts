// Vercel 서버리스 함수: Team Sophia Professional Diagnosis API 프록시 (POST /api/team-sophia-pro)
//
// jangbi.vercel.app(HTTPS)에서 VPS의 Team Sophia Pro API(HTTP)를 직접 호출하면
// Mixed Content로 막히므로, 이 서버리스 함수가 중계한다.
// 브라우저 → /api/team-sophia-pro → VPS(http://187.127.110.11:8092/api/pro-diagnosis) → 응답 반환

import type { VercelRequest, VercelResponse } from "@vercel/node";

const TEAM_SOPHIA_PRO_API_URL = "http://187.127.110.11:8092/api/pro-diagnosis";

// 팀소피아 정밀 진단 리포트 생성은 수십 초가 걸릴 수 있으므로 실행 시간을 늘린다.
export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "POST만 허용됩니다." });
  }

  let payload: any = req.body;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return res.status(400).json({ ok: false, error: "본문 JSON 파싱 실패" });
    }
  }

  try {
    const response = await fetch(TEAM_SOPHIA_PRO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("[api/team-sophia-pro] VPS 연결 오류:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message ?? "Team Sophia Pro API 연결 실패",
    });
  }
}
