// Vercel 서버리스: 팀소피아(Hermes) 응답 스레드 수거 (GET /api/sophia-poll?channel=&ts=)
//
// 프런트가 주기적으로 호출해 Hermes가 스레드에 단 답글을 가져온다. (각 호출은 짧음 → 서버리스 적합)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getThreadReplies } from "../src/services/teamSophia/slackBridge.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.SLACK_BRIDGE_BOT_TOKEN;
  if (!token) return res.status(500).json({ ok: false, error: "SLACK_BRIDGE_BOT_TOKEN이 설정되지 않았습니다." });

  const channel = String(req.query.channel || "");
  const ts = String(req.query.ts || "");
  if (!channel || !ts) return res.status(400).json({ ok: false, error: "channel, ts 쿼리가 필요합니다." });

  try {
    const replies = await getThreadReplies(token, channel, ts);
    return res.status(200).json({ ok: true, count: replies.length, replies });
  } catch (e: any) {
    console.error("[api/sophia-poll] 오류:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}
