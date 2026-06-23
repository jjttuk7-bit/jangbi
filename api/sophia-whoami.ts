// Vercel 서버리스: Jangbi Bridge 봇의 Slack 신원 확인 (GET /api/sophia-whoami)
//
// Hermes의 SLACK_ALLOWED_USERS에 추가할 봇 user id를 알아내기 위한 진단용 엔드포인트.

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const token = process.env.SLACK_BRIDGE_BOT_TOKEN;
  if (!token) return res.status(500).json({ ok: false, error: "SLACK_BRIDGE_BOT_TOKEN 미설정" });
  try {
    const r = await fetch("https://slack.com/api/auth.test", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await r.json()) as any;
    return res.status(200).json({
      ok: data.ok,
      user_id: data.user_id,
      user: data.user,
      bot_id: data.bot_id,
      team: data.team,
      error: data.error,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}
