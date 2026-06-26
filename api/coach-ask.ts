// Vercel 서버리스: 특정 코치 채널의 독립 에이전트에게 일 보내기 (POST /api/coach-ask)
//
// 멀티에이전트 스테이징용. 예) coachId="anne-data" → #anne-data 의 앤 에이전트에게 게시.
// 앤 에이전트가 자기 채널에서 실제로 작업(가시적) → /api/sophia-poll 로 응답 수거.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { postRequest, resolveCoachChannelMention } from "../src/services/teamSophia/slackBridge.js";
import { buildCoachPrompt } from "../src/services/teamSophia/hermesPrompt.js";
import { COACHES, CoachId } from "../src/services/teamSophia/types.js";
import { DiagnosisData } from "../src/types.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "POST만 허용됩니다." });
  }
  const token = process.env.SLACK_BRIDGE_BOT_TOKEN;
  if (!token) return res.status(500).json({ ok: false, error: "SLACK_BRIDGE_BOT_TOKEN 미설정" });

  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ ok: false, error: "본문 JSON 파싱 실패" }); }
  }
  const coachId = body?.coachId as CoachId | undefined;
  const diagnosis = body?.diagnosis as DiagnosisData | undefined;
  if (!coachId || !COACHES[coachId]) return res.status(400).json({ ok: false, error: "유효한 coachId가 필요합니다." });
  if (!diagnosis || typeof diagnosis !== "object") return res.status(400).json({ ok: false, error: "diagnosis가 필요합니다." });

  try {
    const bridgeBotId = process.env.SLACK_BRIDGE_BOT_USER_ID || "U0BCDG94430";
    const agentIdFromBody = typeof body?.agentId === "string" && body.agentId ? body.agentId : undefined;
    const { channelId, mention, agentId } = await resolveCoachChannelMention(token, coachId, bridgeBotId, agentIdFromBody);
    if (!channelId) return res.status(500).json({ ok: false, error: `채널을 찾지 못했습니다(${COACHES[coachId].channel}). 봇 초대 확인.` });

    const prompt = buildCoachPrompt(coachId, diagnosis, mention);
    const result = await postRequest(token, channelId, prompt);
    if (!result.ok) return res.status(502).json({ ok: false, error: `게시 실패: ${result.error}` });

    return res.status(200).json({ ok: true, coachId, channel: result.channel, ts: result.ts, agentResolved: Boolean(agentId) });
  } catch (e: any) {
    console.error("[api/coach-ask] 오류:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}
