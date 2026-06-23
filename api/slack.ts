// Vercel 서버리스 함수: 팀소피아 Slack 전송 (POST /api/slack)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md §6
// 버셀 배포 시 이 함수가 브라우저의 /api/slack 요청을 처리한다.
// SLACK_BOT_TOKEN 은 Vercel 프로젝트 환경변수에 설정한다(서버에서만 사용).

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { postBundleToSlack } from "../src/services/teamSophia/slackPost.js";
import { TeamSophiaSlackBundle } from "../src/services/teamSophia/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "POST만 허용됩니다." });
  }

  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    return res.status(500).json({ ok: false, error: "SLACK_BOT_TOKEN이 설정되지 않았습니다." });
  }

  // Vercel은 application/json 본문을 자동 파싱하지만, 문자열로 올 경우 방어적으로 파싱한다.
  let body: any = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: "본문 JSON 파싱 실패" });
    }
  }

  const bundle = body?.bundle as TeamSophiaSlackBundle | undefined;
  if (!bundle?.summary) {
    return res.status(400).json({ ok: false, error: "유효한 bundle이 필요합니다." });
  }

  try {
    const { allOk, results } = await postBundleToSlack(bundle, token);
    return res.status(allOk ? 200 : 207).json({ ok: allOk, results });
  } catch (e: any) {
    console.error("[api/slack] 전송 오류:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}
