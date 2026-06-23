// Team Sophia Slack 클라이언트 (브라우저 측)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md §6
// 브라우저에서 직접 Slack을 호출하지 않는다(CORS·토큰 노출). 백엔드(/api/slack)로만 보낸다.

import { TeamSophiaSlackBundle } from "./types";

export interface SlackSendResult {
  ok: boolean;
  results?: { channel: string; ok: boolean; error?: string }[];
  error?: string;
}

/**
 * 팀소피아 Slack 번들을 백엔드로 전송한다.
 * 백엔드가 꺼져 있거나 토큰이 없으면 ok:false 를 반환하되 throw 하지 않는다.
 * (장사비서 고객 화면 흐름을 막지 않기 위함)
 */
export async function sendTeamSophiaToSlack(
  bundle: TeamSophiaSlackBundle
): Promise<SlackSendResult> {
  try {
    const res = await fetch("/api/slack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bundle }),
    });
    const data = (await res.json()) as SlackSendResult;
    return data;
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Slack 전송 백엔드에 연결하지 못했습니다." };
  }
}
