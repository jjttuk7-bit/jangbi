// 팀소피아 리포트 섹션 (장사비서 결과 화면용)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md §7 (리포트 9블록)
// 데이터는 Team Sophia Dummy Engine(runDummyEngine)의 결과를 그대로 받는다.
// Slack 페이로드(§6)는 여기서 렌더링하지 않는다 — 고객 화면이므로 리포트만 표시.

import { ReactNode } from "react";
import {
  Users,
  BarChart3,
  MessageSquareWarning,
  Megaphone,
  Clapperboard,
  CheckCircle2,
  CalendarRange,
  ClipboardList,
  HelpCircle,
} from "lucide-react";
import { COACHES, CoachId, TaskOwner, TeamSophiaEngineResult } from "../services/teamSophia/types";

/** TaskOwner를 사람이 읽는 라벨로. ("owner" = 사장님, 그 외는 코치 짧은 이름) */
function ownerLabel(owner: TaskOwner): string {
  if (owner === "owner") return "사장님";
  return COACHES[owner as CoachId].shortName;
}

function CoachCard({
  coachId,
  icon,
  children,
}: {
  coachId: CoachId;
  icon: ReactNode;
  children: ReactNode;
}) {
  const coach = COACHES[coachId];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-sm font-black text-slate-900">{coach.name}</div>
          <div className="text-[10px] font-bold text-slate-400 font-mono">{coach.channel}</div>
        </div>
      </div>
      <div className="space-y-2 text-[13px] text-slate-600 leading-relaxed">{children}</div>
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0)
    return <p className="text-slate-400 italic">입력된 내용이 없어 추가 데이터가 필요합니다.</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-brand-accent font-black">·</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function TeamSophiaReport({ result }: { result: TeamSophiaEngineResult }) {
  const { report } = result;

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 shadow-xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-accent flex items-center justify-center ring-1 ring-white/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">팀소피아 5인 코치 리포트</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              엔진: {result.meta.engine} · {new Date(result.meta.generatedAt).toLocaleString("ko-KR")}
            </p>
          </div>
        </div>
      </div>

      {/* 1. 소피아 종합 정리 */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-black text-brand-accent uppercase tracking-widest">
            마스터 코치 소피아 · 종합 정리
          </span>
        </div>
        <p className="text-slate-200 text-[15px] leading-relaxed mb-4">{report.sophiaSummary.emotionalNote}</p>
        <ul className="space-y-1.5 mb-4">
          {report.sophiaSummary.problemBreakdown.map((p, i) => (
            <li key={i} className="text-slate-300 text-[13px] flex gap-2">
              <span className="text-brand-accent">▸</span>
              {p}
            </li>
          ))}
        </ul>
        <p className="text-slate-400 text-[13px] italic border-l-2 border-brand-accent pl-3">
          {report.sophiaSummary.overview}
        </p>
      </div>

      {/* 2~5. 코치별 진단/실행안 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <CoachCard coachId="anne-data" icon={<BarChart3 className="w-4 h-4" />}>
          <Bullets items={report.anneDiagnosis.findings} />
          <p className="text-slate-500 italic mt-2">{report.anneDiagnosis.diagnosis}</p>
          {report.anneDiagnosis.missingData.length > 0 && (
            <p className="text-[11px] text-orange-500 font-bold mt-2">
              필요 데이터: {report.anneDiagnosis.missingData.join(", ")}
            </p>
          )}
        </CoachCard>

        <CoachCard coachId="claire-cs" icon={<MessageSquareWarning className="w-4 h-4" />}>
          <Bullets items={report.claireDiagnosis.customerIssues} />
          {report.claireDiagnosis.replyDrafts.length > 0 && (
            <div className="mt-2 bg-slate-50 rounded-lg p-3 text-[12px] text-slate-600">
              <div className="text-[10px] font-black text-slate-400 mb-1">답글 초안 (검수 후 발송)</div>
              {report.claireDiagnosis.replyDrafts[0]}
            </div>
          )}
          <Bullets items={report.claireDiagnosis.preventiveActions} />
        </CoachCard>

        <CoachCard coachId="jane-marketer" icon={<Megaphone className="w-4 h-4" />}>
          <ul className="space-y-2">
            {report.janePlan.actions.map((a, i) => (
              <li key={i}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                    {a.cost}
                  </span>
                  <span className="font-bold text-slate-700">{a.idea}</span>
                </div>
                <p className="text-[11px] text-slate-400 ml-1">→ {a.expectedEffect}</p>
              </li>
            ))}
          </ul>
        </CoachCard>

        <CoachCard coachId="kelly-creator" icon={<Clapperboard className="w-4 h-4" />}>
          <ul className="space-y-2">
            {report.kellyIdeas.ideas.map((idea, i) => (
              <li key={i}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                    {idea.format}
                  </span>
                  {idea.faceless && (
                    <span className="text-[10px] font-bold text-slate-400">얼굴 노출 X</span>
                  )}
                </div>
                <p className="font-bold text-slate-700">{idea.concept}</p>
                <p className="text-[11px] text-slate-400">{idea.caption}</p>
              </li>
            ))}
          </ul>
        </CoachCard>
      </div>

      {/* 6. 오늘 바로 할 일 3개 */}
      <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-brand-accent" />
          <span className="text-sm font-black text-white">오늘 바로 할 일 3개</span>
        </div>
        <div className="space-y-2">
          {report.todayActions.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2.5">
              <span className="w-6 h-6 rounded-full bg-brand-accent text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-slate-200 text-[13px] flex-1">{a.task}</span>
              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                {a.estimatedMinutes}분 · {ownerLabel(a.owner)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 7~9. 주간 플랜 / 필요 데이터 / 업무 배정 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarRange className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">이번 주 플랜</span>
          </div>
          <ul className="space-y-2">
            {report.weeklyPlan.map((w, i) => (
              <li key={i} className="text-[12px] text-slate-300 flex gap-2">
                <span className="font-black text-brand-accent w-8 flex-shrink-0">{w.when}</span>
                <span className="flex-1">{w.task}</span>
                <span className="text-[10px] text-slate-500">{ownerLabel(w.owner)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">추가 필요 데이터</span>
          </div>
          {report.neededData.length === 0 ? (
            <p className="text-[12px] text-emerald-400">필요한 데이터가 모두 채워졌어요.</p>
          ) : (
            <ul className="space-y-1.5">
              {report.neededData.map((n, i) => (
                <li key={i} className="text-[12px] text-slate-300 flex gap-2">
                  <span className="text-orange-400">·</span>
                  {n}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">업무 배정</span>
          </div>
          <ul className="space-y-2">
            {report.assignments.map((a, i) => (
              <li key={i} className="text-[12px] text-slate-300">
                <span className="font-black text-brand-accent">{ownerLabel(a.owner)}</span>
                <span className="text-slate-400"> — {a.task}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
