// Team Sophia Slack 전송 백엔드
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md §6
// 역할: 브라우저(장사비서)가 보낸 TeamSophiaSlackBundle 을 받아
//       SLACK_BOT_TOKEN 으로 Slack chat.postMessage 호출만 수행한다.
//
// 토큰은 서버 환경변수에만 두고 절대 프론트 번들에 노출하지 않는다. (정의서 §5-6)
// 실행: npm run server  (tsx server/index.ts)

import "dotenv/config";
import express from "express";
import { postBundleToSlack } from "../src/services/teamSophia/slackPost";
import { TeamSophiaSlackBundle, TeamSophiaEngineInput, CONTEXT_DOC } from "../src/services/teamSophia/types";
import { generateDiagnosisReport } from "../src/services/diagnosisCore";
import { deriveStoreName, generateTeamSophiaReport } from "../src/services/teamSophia/llmCore";
import { buildSlackBundle } from "../src/services/teamSophia/slackBundle";

const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.SERVER_PORT) || 8787;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.get("/api/slack/health", (_req, res) => {
  res.json({ ok: true, tokenConfigured: Boolean(SLACK_BOT_TOKEN), openaiConfigured: Boolean(OPENAI_API_KEY) });
});

// 로컬 dev에서 Vercel 서버리스 함수(api/diagnosis.ts)와 동일한 OpenAI 호출을 제공.
app.post("/api/diagnosis", async (req, res) => {
  const data = req.body?.data;
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "유효한 진단 데이터(data)가 필요합니다." });
  }
  try {
    const report = await generateDiagnosisReport(data, OPENAI_API_KEY);
    return res.status(200).json(report);
  } catch (e: any) {
    console.error("[slack-server] 진단 오류:", e);
    return res.status(e?.status ?? 500).json({ error: e?.message ?? "진단 생성 오류" });
  }
});

// 로컬 dev에서 Vercel 서버리스 함수(api/team-sophia.ts)와 동일한 팀소피아 LLM 호출을 제공.
app.post("/api/team-sophia", async (req, res) => {
  const diagnosis = req.body?.diagnosis;
  if (!diagnosis || typeof diagnosis !== "object") {
    return res.status(400).json({ error: "유효한 진단 데이터(diagnosis)가 필요합니다." });
  }
  const input: TeamSophiaEngineInput = { diagnosis, storeName: req.body?.storeName };
  try {
    const generatedAt = new Date().toISOString();
    const storeName = deriveStoreName(input);
    const report = await generateTeamSophiaReport(input, OPENAI_API_KEY);
    const slack = buildSlackBundle(report, { storeName, generatedAt, engine: "llm" });
    return res.status(200).json({ report, slack, meta: { engine: "llm", generatedAt, contextDoc: CONTEXT_DOC } });
  } catch (e: any) {
    console.error("[slack-server] 팀소피아 오류:", e);
    return res.status(e?.status ?? 500).json({ error: e?.message ?? "팀소피아 생성 오류" });
  }
});

app.post("/api/slack", async (req, res) => {
  if (!SLACK_BOT_TOKEN) {
    return res.status(500).json({ ok: false, error: "SLACK_BOT_TOKEN이 설정되지 않았습니다." });
  }

  const bundle = req.body?.bundle as TeamSophiaSlackBundle | undefined;
  if (!bundle?.summary) {
    return res.status(400).json({ ok: false, error: "유효한 bundle이 필요합니다." });
  }

  try {
    // 로컬 Express 서버와 Vercel 함수가 동일한 전송 코어(postBundleToSlack)를 공유한다.
    const { allOk, results } = await postBundleToSlack(bundle, SLACK_BOT_TOKEN);
    return res.status(allOk ? 200 : 207).json({ ok: allOk, results });
  } catch (e: any) {
    console.error("[slack-server] 전송 오류:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`[slack-server] listening on :${PORT} (token ${SLACK_BOT_TOKEN ? "OK" : "MISSING"})`);
});
