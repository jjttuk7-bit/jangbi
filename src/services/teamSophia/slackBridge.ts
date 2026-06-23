// 팀소피아 슬랙 브릿지 (서버 전용)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md
// Hermes Agent(Nous)는 공개 HTTP API가 없고 슬랙 Socket Mode로만 동작하므로,
// 장사비서는 #team-sophia-daily 채널에 '요청'을 게시(@Hermes 멘션)하고,
// Hermes가 스레드에 단 답을 Slack Web API로 수거한다. (패턴 B · 비동기)
//
// 사용 토큰: SLACK_BRIDGE_BOT_TOKEN (장사비서 전용 봇 = "Jangbi Bridge")
//   - Hermes 봇 토큰과 분리해야 함: 같은 봇으로 멘션하면 Hermes가 자기 메시지로 보고 무시.

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
