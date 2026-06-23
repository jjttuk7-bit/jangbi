// 팀소피아 Slack 전송 코어 (서버 측 공용)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md §6
// 로컬 Express 서버(server/index.ts)와 Vercel 서버리스 함수(api/slack.ts)가
// 동일한 전송 로직을 쓰도록 추출한 모듈. SLACK_BOT_TOKEN 으로 chat.postMessage 만 호출한다.
//
// 주의: 이 모듈은 봇 토큰을 받으므로 절대 브라우저에서 import 하지 않는다. (정의서 §5-6)

import { buildSlackMessages } from "./slackAdapter";
import { TeamSophiaSlackBundle } from "./types";

export interface SlackPostResult {
  channel: string;
  ok: boolean;
  error?: string;
}

export interface SlackPostSummary {
  allOk: boolean;
  results: SlackPostResult[];
}

async function postMessage(
  token: string,
  channel: string,
  text: string,
  blocks?: unknown[]
): Promise<SlackPostResult> {
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text, blocks }),
  });
  const data = (await res.json()) as { ok: boolean; error?: string };
  return { channel, ok: data.ok, error: data.error };
}

/**
 * 번들을 Slack 메시지로 변환해 순차 전송한다. (레이트리밋 회피)
 * 토큰이 없으면 에러를 던지지 않고 allOk:false 로 알려준다.
 */
export async function postBundleToSlack(
  bundle: TeamSophiaSlackBundle,
  token: string | undefined
): Promise<SlackPostSummary> {
  if (!token) {
    return { allOk: false, results: [{ channel: "-", ok: false, error: "SLACK_BOT_TOKEN이 설정되지 않았습니다." }] };
  }
  const messages = buildSlackMessages(bundle);
  const results: SlackPostResult[] = [];
  for (const m of messages) {
    results.push(await postMessage(token, m.channel, m.text, m.blocks));
  }
  return { allOk: results.every((r) => r.ok), results };
}
