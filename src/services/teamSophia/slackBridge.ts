// 팀소피아 슬랙 브릿지 (서버 전용)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md
// Hermes Agent(Nous)는 공개 HTTP API가 없고 슬랙 Socket Mode로만 동작하므로,
// 장사비서는 #team-sophia-daily 채널에 '요청'을 게시(@Hermes 멘션)하고,
// Hermes가 스레드에 단 답을 Slack Web API로 수거한다. (패턴 B · 비동기)
//
// 사용 토큰: SLACK_BRIDGE_BOT_TOKEN (장사비서 전용 봇 = "Jangbi Bridge")
//   - Hermes 봇 토큰과 분리해야 함: 같은 봇으로 멘션하면 Hermes가 자기 메시지로 보고 무시.

import { COACHES, CoachId } from "./types.js";

const SLACK_API = "https://slack.com/api";

async function slackGet(token: string, method: string, params: Record<string, string>): Promise<any> {
  const url = `${SLACK_API}/${method}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

async function slackPost(token: string, method: string, body: unknown): Promise<any> {
  const res = await fetch(`${SLACK_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return res.json();
}

/** 채널명(#team-sophia-daily) → 채널 ID(Cxxxx). 이미 ID면 그대로 반환. */
export async function resolveChannelId(token: string, channel: string): Promise<string | undefined> {
  if (/^C[A-Z0-9]+$/.test(channel)) return channel;
  const name = channel.replace(/^#/, "");
  let cursor = "";
  for (let i = 0; i < 10; i++) {
    const data = await slackGet(token, "conversations.list", {
      types: "public_channel",
      exclude_archived: "true",
      limit: "1000",
      ...(cursor ? { cursor } : {}),
    });
    if (!data.ok) return undefined;
    const found = (data.channels ?? []).find((c: any) => c.name === name);
    if (found) return found.id;
    cursor = data.response_metadata?.next_cursor || "";
    if (!cursor) break;
  }
  return undefined;
}

/** 채널 최근 기록에서 Hermes 봇의 user id를 찾는다(@멘션용). 못 찾으면 undefined. */
export async function resolveHermesUserId(
  token: string,
  channelId: string,
  botName = "Hermes Agent"
): Promise<string | undefined> {
  const data = await slackGet(token, "conversations.history", { channel: channelId, limit: "100" });
  if (!data.ok) return undefined;
  for (const m of data.messages ?? []) {
    const name = m.bot_profile?.name || m.username;
    if (name === botName && m.user) return m.user;
  }
  return undefined;
}

/** 채널 최근 기록에서 '브릿지 봇이 아닌' 봇(=코치 에이전트)의 user id를 찾는다. */
export async function resolveOtherBotId(
  token: string,
  channelId: string,
  excludeUserId: string
): Promise<string | undefined> {
  const data = await slackGet(token, "conversations.history", { channel: channelId, limit: "100" });
  if (!data.ok) return undefined;
  for (const m of data.messages ?? []) {
    const isBot = Boolean(m.bot_id) || m.subtype === "bot_message";
    if (isBot && m.user && m.user !== excludeUserId) return m.user;
  }
  return undefined;
}

export interface PostResult {
  ok: boolean;
  channel?: string;
  ts?: string;
  error?: string;
}

/** 채널에 요청 메시지를 게시. 반환된 ts가 스레드 루트가 된다. */
export async function postRequest(token: string, channelId: string, text: string): Promise<PostResult> {
  const data = await slackPost(token, "chat.postMessage", { channel: channelId, text });
  return { ok: data.ok, channel: data.channel, ts: data.ts, error: data.error };
}

/** 코치 앱(agent) 멘션 env var 이름. 예: "anne-data" → "SLACK_AGENT_ANNE_DATA" */
export function coachAgentEnvVar(coachId: CoachId): string {
  return "SLACK_AGENT_" + coachId.toUpperCase().replace(/-/g, "_");
}

export interface CoachChannelMention {
  channelId?: string;
  agentId?: string;
  /** 채널/멘션 해석 결과. agentId가 있으면 "<@U...>", 없으면 표시 이름("@Anne" 등)으로 폴백. */
  mention: string;
}

/**
 * 코치 전용 채널(COACHES[coachId].channel)을 찾고, 그 채널에 있는 코치 앱의 멘션을 해석한다.
 * 해석 우선순위: agentIdOverride > 환경변수(SLACK_AGENT_*) > 채널 기록에서 자동 탐색.
 * api/coach-ask.ts와 api/sophia-ask.ts가 동일한 로직을 공유하기 위한 단일 기준.
 */
export async function resolveCoachChannelMention(
  token: string,
  coachId: CoachId,
  bridgeBotId: string,
  agentIdOverride?: string
): Promise<CoachChannelMention> {
  const coach = COACHES[coachId];
  const channelId = await resolveChannelId(token, coach.channel);
  if (!channelId) return { mention: `@${coach.shortName}` };

  const agentId = agentIdOverride || process.env[coachAgentEnvVar(coachId)] || (await resolveOtherBotId(token, channelId, bridgeBotId));
  return { channelId, agentId, mention: agentId ? `<@${agentId}>` : `@${coach.shortName}` };
}

export interface CoachSendItem {
  coach: string;
  title: string;
  prompt: string;
}

export interface CoachSendOutcome {
  coach: string;
  ok: boolean;
  channel?: string;
  ts?: string;
  error?: string;
}

export interface CoachSendResult {
  ok: boolean;
  outcomes: CoachSendOutcome[];
  /** 전송 실패한 코치 요청 목록(코치명 + 에러). */
  failures: { coach: string; error: string }[];
}

/**
 * 코치별 프롬프트를 각자의 채널에 독립적으로 게시한다(코치마다 채널이 다르므로 스레드로
 * 묶지 않는다). 일부 전송이 실패해도 나머지는 계속 시도하고, 실패한 코치는 failures에 기록한다.
 */
export async function sendPromptsToChannels(
  items: { coach: string; channelId?: string; prompt: string }[],
  token: string
): Promise<CoachSendResult> {
  const outcomes: CoachSendOutcome[] = [];
  const failures: { coach: string; error: string }[] = [];

  for (const item of items) {
    if (!item.channelId) {
      const error = "채널을 찾지 못했습니다.";
      outcomes.push({ coach: item.coach, ok: false, error });
      failures.push({ coach: item.coach, error });
      continue;
    }
    const result = await postRequest(token, item.channelId, item.prompt);
    if (!result.ok) {
      console.error(`[sendPromptsToChannels] ${item.coach} 전송 실패:`, result.error);
      failures.push({ coach: item.coach, error: result.error || "알 수 없는 오류" });
    }
    outcomes.push({ coach: item.coach, ok: result.ok, channel: result.channel, ts: result.ts, error: result.error });
  }

  return { ok: failures.length === 0, outcomes, failures };
}

export interface ThreadReply {
  user?: string;
  username?: string;
  text: string;
  ts: string;
}

/** 스레드(ts)의 답글을 수거. 루트(요청 메시지)는 제외. */
export async function getThreadReplies(token: string, channelId: string, ts: string): Promise<ThreadReply[]> {
  const data = await slackGet(token, "conversations.replies", { channel: channelId, ts });
  if (!data.ok) return [];
  return (data.messages ?? [])
    .filter((m: any) => m.ts !== ts)
    .map((m: any) => ({
      user: m.user,
      username: m.bot_profile?.name || m.username,
      text: m.text ?? "",
      ts: m.ts,
    }));
}
