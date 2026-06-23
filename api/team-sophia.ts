// Vercel 서버리스 함수: 팀소피아 LLM 리포트 생성 (POST /api/team-sophia)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md
// OpenAI 호출을 서버에서 수행해 OPENAI_API_KEY가 브라우저에 노출되지 않도록 한다.
// 리포트(§7)는 llmCore가 생성하고, Slack 번들(§6)·meta는 여기서 조립한다.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { deriveStoreName, generateTeamSophiaReport } from "../src/services/teamSophia/llmCore";
import { buildSlackBundle } from "../src/services/teamSophia/slackBundle";
import {
  CONTEXT_DOC,
  TeamSophiaEngineInput,
  TeamSophiaEngineResult,
} from "../src/services/teamSophia/types";
import { DiagnosisData } from "../src/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST만 허용됩니다." });
  }

  let body: any = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "본문 JSON 파싱 실패" });
    }
  }

  const diagnosis = body?.diagnosis as DiagnosisData | undefined;
  if (!diagnosis || typeof diagnosis !== "object") {
    return res.status(400).json({ error: "유효한 진단 데이터(diagnosis)가 필요합니다." });
  }

  const input: TeamSophiaEngineInput = { diagnosis, storeName: body?.storeName };

  try {
    const generatedAt = new Date().toISOString();
    const storeName = deriveStoreName(input);
    const report = await generateTeamSophiaReport(input, process.env.OPENAI_API_KEY);
    const slack = buildSlackBundle(report, { storeName, generatedAt, engine: "llm" });

    const result: TeamSophiaEngineResult = {
      report,
      slack,
      meta: { engine: "llm", generatedAt, contextDoc: CONTEXT_DOC },
    };
    return res.status(200).json(result);
  } catch (e: any) {
    console.error("[api/team-sophia] 생성 오류:", e);
    const status = e?.status ?? 500;
    return res.status(status).json({ error: e?.message ?? "팀소피아 리포트 생성 중 오류가 발생했습니다." });
  }
}
