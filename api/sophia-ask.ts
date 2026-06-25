// Vercel 서버리스: 팀소피아(Hermes)에게 검토 요청 게시 (POST /api/sophia-ask)
//
// 장사비서 → Jangbi Bridge 봇으로 #team-sophia-daily에 요청 게시 → 스레드 ts 반환.
// 실제 응답 수거는 /api/sophia-poll 에서 비동기로 폴링한다.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendCoachPromptSequence, resolveChannelId, resolveHermesUserId } from "../src/services/teamSophia/slackBridge.js";
import { buildTeamSophiaCoachPrompts } from "../src/services/teamSophia/hermesPrompt.js";
import { DiagnosisData } from "../src/types.js";

const CHANNEL = process.env.SLACK_TEAM_SOPHIA_CHANNEL || "#team-sophia-daily";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "POST만 허용됩니다." });
  }

  const token = process.env.SLACK_BRIDGE_BOT_TOKEN;
  if (!token) return res.status(500).json({ ok: false, error: "SLACK_BRIDGE_BOT_TOKEN이 설정되지 않았습니다." });

  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ ok: false, error: "본문 JSON 파싱 실패" }); }
  }
  const diagnosis = body?.diagnosis as DiagnosisData | undefined;
  if (!diagnosis || typeof diagnosis !== "object") {
    return res.status(400).json({ ok: false, error: "유효한 진단 데이터(diagnosis)가 필요합니다." });
  }

  try {
    const channelId = await resolveChannelId(token, CHANNEL);
    if (!channelId) return res.status(500).json({ ok: false, error: `채널을 찾지 못했습니다(${CHANNEL}). 봇이 초대됐는지 확인하세요.` });

    const hermesId = await resolveHermesUserId(token, channelId);
    const mention = hermesId ? `<@${hermesId}>` : "@Hermes Agent";
    const basicSummary = typeof body?.basicSummary === "string" ? body.basicSummary : "";
    const coachPrompts = buildTeamSophiaCoachPrompts(diagnosis, mention, basicSummary);

    const result = await sendCoachPromptSequence(token, channelId, coachPrompts);
    if (!result.ts) return res.status(502).json({ ok: false, error: `게시 실패: ${result.failures.map((f) => `${f.coach}(${f.error})`).join(", ")}` });
    if (result.failures.length > 0) {
      console.error("[api/sophia-ask] 일부 코치 요청 전송 실패:", result.failures);
    }

    return res.status(200).json({
      ok: true,
      channel: result.channel,
      ts: result.ts,
      hermesResolved: Boolean(hermesId),
      failures: result.failures,
    });
  } catch (e: any) {
    console.error("[api/sophia-ask] 오류:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}
