// Vercel 서버리스: 팀소피아 코치별 요청 게시 (POST /api/sophia-ask)
//
// 코치별 프롬프트(Anne/Claire/Jane/Kelly)는 각자의 코치 채널에 그 코치 앱을 멘션해 게시한다
// (api/coach-ask.ts와 동일한 채널/멘션 해석 로직을 공유). Sophia는 아직 전용 앱이 없으므로
// 기존처럼 #team-sophia-daily에 Hermes Agent를 멘션해 총괄 요청을 보낸다.
// 실제 응답 수거는 /api/sophia-poll 에서 비동기로 폴링한다(Sophia 채널/ts 기준).

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { postRequest, resolveChannelId, resolveHermesUserId, resolveCoachChannelMention, sendPromptsToChannels } from "../src/services/teamSophia/slackBridge.js";
import { buildTeamSophiaCoachPrompts, TeamSophiaCoachMentions } from "../src/services/teamSophia/hermesPrompt.js";
import { CoachId } from "../src/services/teamSophia/types.js";
import { DiagnosisData } from "../src/types.js";

const TEAM_DAILY_CHANNEL = process.env.SLACK_TEAM_SOPHIA_CHANNEL || "#team-sophia-daily";

// buildTeamSophiaCoachPrompts()의 coach 표기("Anne" 등) → COACHES 레지스트리 coachId.
const COACH_ID_BY_NAME: Record<"Anne" | "Claire" | "Jane" | "Kelly", CoachId> = {
  Anne: "anne-data",
  Claire: "claire-cs",
  Jane: "jane-marketer",
  Kelly: "kelly-creator",
};

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
    const bridgeBotId = process.env.SLACK_BRIDGE_BOT_USER_ID || "U0BCDG94430";

    // Sophia: 전용 앱이 아직 없으므로 #team-sophia-daily에서 Hermes를 멘션한다.
    const sophiaChannelId = await resolveChannelId(token, TEAM_DAILY_CHANNEL);
    const hermesId = sophiaChannelId ? await resolveHermesUserId(token, sophiaChannelId) : undefined;
    const sophiaMention = hermesId ? `<@${hermesId}>` : "@Hermes Agent";

    // Anne/Claire/Jane/Kelly: 각자의 코치 채널 + 코치 앱 멘션(env SLACK_AGENT_* > 채널 자동 탐색).
    const [anne, claire, jane, kelly] = await Promise.all(
      (Object.keys(COACH_ID_BY_NAME) as (keyof typeof COACH_ID_BY_NAME)[]).map((name) =>
        resolveCoachChannelMention(token, COACH_ID_BY_NAME[name], bridgeBotId)
      )
    );

    const mentions: TeamSophiaCoachMentions = {
      Sophia: sophiaMention,
      Anne: anne.mention,
      Claire: claire.mention,
      Jane: jane.mention,
      Kelly: kelly.mention,
    };

    const basicSummary = typeof body?.basicSummary === "string" ? body.basicSummary : "";
    const coachPrompts = buildTeamSophiaCoachPrompts(diagnosis, mentions, basicSummary);
    const channelByCoach: Record<string, { channelId?: string }> = { Anne: anne, Claire: claire, Jane: jane, Kelly: kelly };

    // Sophia는 #team-sophia-daily에 별도로 먼저 게시(폴링 기준 스레드).
    const sophiaPrompt = coachPrompts.find((p) => p.coach === "Sophia");
    let sophiaResult: { ok: boolean; channel?: string; ts?: string; error?: string } = { ok: false, error: "Sophia 채널을 찾지 못했습니다." };
    if (sophiaChannelId && sophiaPrompt) {
      sophiaResult = await postRequest(token, sophiaChannelId, sophiaPrompt.prompt);
    }

    // Anne/Claire/Jane/Kelly는 각자의 채널로 독립 게시.
    const coachOnlyItems = coachPrompts
      .filter((p) => p.coach !== "Sophia")
      .map((p) => ({ coach: p.coach, channelId: channelByCoach[p.coach]?.channelId, prompt: p.prompt }));
    const coachSendResult = await sendPromptsToChannels(coachOnlyItems, token);

    const failures = [...coachSendResult.failures];
    if (!sophiaResult.ok) failures.unshift({ coach: "Sophia", error: sophiaResult.error || "게시 실패" });
    if (failures.length > 0) {
      console.error("[api/sophia-ask] 일부 코치 요청 전송 실패:", failures);
    }

    if (!sophiaResult.ts) {
      return res.status(502).json({ ok: false, error: `게시 실패: ${failures.map((f) => `${f.coach}(${f.error})`).join(", ")}` });
    }

    return res.status(200).json({
      ok: failures.length === 0,
      channel: sophiaResult.channel,
      ts: sophiaResult.ts,
      hermesResolved: Boolean(hermesId),
      coachResults: coachSendResult.outcomes,
      failures,
    });
  } catch (e: any) {
    console.error("[api/sophia-ask] 오류:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
}
