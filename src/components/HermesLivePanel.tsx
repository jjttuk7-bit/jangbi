// 팀소피아(Hermes) 실시간 응답 패널
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md
// 장사비서 결과 화면에서 "팀소피아(Hermes) 팀에게 검토 요청"을 보내고,
// 슬랙 브릿지(/api/sophia-ask → /api/sophia-poll)로 Hermes의 실제 응답을 비동기로 받아 표시한다.
// Hermes = 자기개선하는 진짜 두뇌(오케스트레이터+코치 분업), gpt-4o 리포트는 즉시 보조.

import { ReactNode, useState } from "react";
import { Users2, Send, Loader2, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { DiagnosisData } from "../types";

type Phase = "idle" | "working" | "done" | "error";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 도구/상태 메시지(코치 문서 읽기·서브에이전트 띄우기 등)는 본문이 아니므로 제외.
const TOOL_HINTS = [":book:", "read_file", "delegate_task", "patch:", "terminal", ":jigsaw:", ":hourglass"];
function isStatusMessage(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.startsWith(":")) return true; // 슬랙 이모지 단축코드로 시작 = 도구 상태줄
  return TOOL_HINTS.some((p) => t.startsWith(p));
}

// 슬랙 mrkdwn의 *굵게* 만 가볍게 변환 (불릿 `*   ` 는 닫는 * 가 없어 그대로 통과)
function formatLine(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*([^*\n]+)\*/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    parts.push(<strong key={i++}>{m[1]}</strong>);
    last = re.lastIndex;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts.length ? parts : [line];
}

export function HermesLivePanel({ diagnosisData }: { diagnosisData: DiagnosisData }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  async function run() {
    setPhase("working");
    setError("");
    setAnswer("");
    setStatus("팀소피아에 요청 전송 중…");
    try {
      const askRes = await fetch("/api/sophia-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosis: diagnosisData }),
      });
      const ask = await askRes.json();
      if (!ask?.ok || !ask?.ts) throw new Error(ask?.error || "요청 게시에 실패했습니다.");

      const channel: string = ask.channel;
      const ts: string = ask.ts;
      setStatus("팀소피아가 검토 중… (코치 분업 시 수 분 걸릴 수 있어요)");

      let stable = 0;
      let prevCount = -1;
      let latestAnswer = "";
      for (let i = 0; i < 50; i++) {
        await sleep(6000);
        let p: any;
        try {
          const pRes = await fetch(`/api/sophia-poll?channel=${encodeURIComponent(channel)}&ts=${encodeURIComponent(ts)}`);
          p = await pRes.json();
        } catch {
          continue;
        }
        if (!p?.ok) continue;

        const replies: { text: string }[] = p.replies || [];
        const substantive = replies.filter((r) => !isStatusMessage(r.text));
        const statusReply = replies.find((r) => isStatusMessage(r.text));

        if (substantive.length > 0) {
          latestAnswer = substantive.map((r) => r.text).join("\n\n");
          setAnswer(latestAnswer);
        } else if (statusReply) {
          setStatus(
            statusReply.text.includes("delegate")
              ? "코치들을 띄워 분업 중… (앤·클레어·제인·켈리)"
              : "코치 문서를 읽고 분석 중…"
          );
        }

        if (p.count === prevCount) stable++;
        else stable = 0;
        prevCount = p.count;

        // 본문이 있고 스레드가 안정(약 18초 변화 없음)되면 완료로 본다
        if (latestAnswer && stable >= 3) {
          setPhase("done");
          return;
        }
      }

      if (latestAnswer) setPhase("done");
      else {
        setPhase("error");
        setError("아직 팀소피아 응답이 도착하지 않았어요. 잠시 후 다시 시도해 주세요.");
      }
    } catch (e: any) {
      setPhase("error");
      setError(e?.message || "알 수 없는 오류가 발생했습니다.");
    }
  }

  return (
    <section className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-7 md:p-9 shadow-xl text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/25">
          <Users2 className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-black tracking-tight">팀소피아 정밀 분석</h3>
          <p className="text-[11px] font-bold text-white/70">자기개선하는 5인 코치 팀의 실제 전문 분석 · 위 기초 분석과 별개로 진짜 컨설팅을 받습니다</p>
        </div>
        <Sparkles className="w-5 h-5 text-white/80" />
      </div>

      {phase === "idle" && (
        <div className="space-y-4">
          <p className="text-[13px] text-white/80 leading-relaxed">
            이 진단 내용을 팀소피아 팀에게 보내 <strong className="text-white">소피아가 코치들에게 직접 분업</strong>한 실제 컨설팅을 받아보세요. 응답이 오면 아래에 표시됩니다.
          </p>
          <button
            onClick={run}
            className="inline-flex items-center gap-2 bg-white text-violet-700 px-5 py-3 rounded-xl text-sm font-black shadow-lg hover:bg-violet-50 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" /> 팀소피아 정밀 분석 받기
          </button>
        </div>
      )}

      {phase === "working" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-[13px] font-bold">{status}</span>
          </div>
          {answer && (
            <div className="bg-white text-slate-700 rounded-2xl p-5 text-[13px] leading-relaxed max-h-[400px] overflow-y-auto">
              {answer.split("\n").map((line, i) => (
                <div key={i} className={line.trim() === "" ? "h-2" : ""}>{formatLine(line)}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[12px] font-bold text-white/80">
            <Sparkles className="w-4 h-4" /> 팀소피아 응답 도착
          </div>
          <div className="bg-white text-slate-700 rounded-2xl p-6 text-[14px] leading-relaxed">
            {answer.split("\n").map((line, i) => (
              <div key={i} className={line.trim() === "" ? "h-2.5" : ""}>{formatLine(line)}</div>
            ))}
          </div>
          <button
            onClick={run}
            className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/25 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 다시 요청
          </button>
        </div>
      )}

      {phase === "error" && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 bg-white/10 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 text-amber-200 shrink-0 mt-0.5" />
            <span className="text-[13px] font-bold text-white/90">{error}</span>
          </div>
          <button
            onClick={run}
            className="inline-flex items-center gap-2 bg-white text-violet-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-violet-50 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 다시 시도
          </button>
        </div>
      )}
    </section>
  );
}
