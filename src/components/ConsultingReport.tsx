// 팀소피아 통합 컨설팅 리포트 (고객용 결과 화면)
//
// 기준 문서: docs/TEAM_SOPHIA_SLACK_CONTEXT.md §7
// 한 편의 "팀소피아 컨설팅 리포트"로, 소피아가 종합 진단으로 열고
// 앤·클레어·제인·켈리가 각자 영역의 정밀 데이터를 소유하며 팀 실행 플랜으로 닫는다.
//
// 데이터: /api/diagnosis(정밀 숫자=DiagnosisReport) + /api/team-sophia(코치 내러티브=TeamSophiaReport)

import { ReactNode, useState } from "react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Crown,
  BarChart3,
  MessageSquareQuote,
  Megaphone,
  Clapperboard,
  Users2,
  CheckCircle2,
  Target,
  ChevronRight,
  Info,
  Activity,
  Zap,
  AlertCircle,
  TrendingUp,
  Star,
  FileText,
  HelpCircle,
  CalendarDays,
  Quote,
  ChevronDown,
} from "lucide-react";
import { DiagnosisReport, DiagnosisData } from "../types";
import { COACHES, CoachId, TaskOwner, TeamSophiaEngineResult } from "../services/teamSophia/types";
import { HermesLivePanel } from "./HermesLivePanel";

// ===========================================================================
// 정밀 데이터 차트 헬퍼 (기존 장사비서 리포트에서 이동 — 이제 소유 코치 섹션 안에서 렌더)
// ===========================================================================

function WaterfallChart({ data, cashFlow }: { data: DiagnosisReport["financialDetail"]["profitWaterfall"]; cashFlow: string }) {
  return (
    <div className="space-y-3 mt-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">순이익 산출 Waterfall (추정)</span>
        <div className="flex items-center gap-1 text-brand-accent">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black">수익 흐름</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {data?.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5 group">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold ${item.type === "total" ? "text-brand-accent font-black" : "text-slate-600"}`}>{item.label}</span>
              <span className={`text-[11px] font-black font-mono ${item.type === "plus" ? "text-emerald-600" : item.type === "minus" ? "text-red-500" : "text-slate-900"}`}>{item.value}</span>
            </div>
            {item.type !== "total" && (
              <div className="h-1 w-full bg-slate-200/50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: item.type === "minus" ? "70%" : "100%" }} className={`h-full ${item.type === "plus" ? "bg-emerald-500" : "bg-red-400"}`} />
              </div>
            )}
            {item.type === "total" && <div className="h-0.5 w-full bg-brand-accent/20" />}
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-brand-accent">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="w-3.5 h-3.5 text-brand-accent" />
          <span className="text-[10px] font-black text-slate-900 uppercase">현금흐름 구조 진단</span>
        </div>
        <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic line-clamp-2">{cashFlow}</p>
      </div>
    </div>
  );
}

function EfficiencyGrid({ metrics, inventory }: { metrics: DiagnosisReport["efficiencyMetrics"]; inventory: DiagnosisReport["menuEngineering"]["inventoryMix"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {metrics?.map((m, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm group hover:border-brand-accent transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
            <Activity className="w-3.5 h-3.5 text-brand-accent opacity-30 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-xl font-black text-slate-900 mb-1">{m.value}</div>
          <p className="text-[10px] font-bold text-brand-accent leading-tight">{m.insight}</p>
        </div>
      ))}
      {inventory && inventory.length > 0 && (
        <div className="col-span-full bg-slate-900 p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">수수료 및 주류 매출 비중 분해</span>
              <TrendingUp className="w-4 h-4 text-brand-accent" />
            </div>
            <div className="flex items-center gap-8">
              {inventory?.map((item, i) => (
                <div key={i} className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{item.category}</span>
                    <span className="text-sm font-black text-white">{item.ratio}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.ratio}%` }} className="h-full bg-brand-accent" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 italic mt-1 leading-tight">{item.insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompetitorTable({ data }: { data: DiagnosisReport["competitorAnalysis"]["detailedComparison"] }) {
  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/20">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">비교 요소</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">우리 매장 (Me)</th>
            <th className="px-6 py-4 text-[10px] font-black text-brand-accent uppercase tracking-widest">핵심 경쟁사</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data?.map((row, i) => (
            <tr key={i} className="group hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4"><span className="text-[11px] font-black text-slate-400 uppercase">{row.factor}</span></td>
              <td className="px-6 py-4"><span className="text-[12px] font-bold text-slate-600">{row.myStore}</span></td>
              <td className="px-6 py-4"><span className="text-[12px] font-black text-brand-accent">{row.competitor}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LaborDetailTable({ data }: { data: DiagnosisReport["financialDetail"]["laborDetail"] }) {
  return (
    <div className="mt-4 bg-slate-50 rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Users2 className="w-4 h-4 text-slate-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">인건비 세부 내역 및 운영 구조</span>
      </div>
      <div className="space-y-3">
        {data?.map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-brand-accent uppercase tracking-tighter">{item.category}</span>
              <p className="text-[11px] font-bold text-slate-500 leading-tight">{item.description}</p>
            </div>
            <span className="text-sm font-black text-slate-900">{item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MysteryShoppingGrid({ data }: { data: DiagnosisReport["competitorAnalysis"]["mysteryShopping"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {data?.map((item, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg shadow-slate-200/20 hover:border-brand-accent transition-all group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">{item.storeName}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-brand-accent fill-brand-accent" />
              <span className="text-[10px] font-black text-slate-900">{item.priceLevel}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[9px] font-black text-emerald-600 uppercase block mb-1">핵심 강점</span>
              <p className="text-[11px] font-bold text-emerald-800">{item.strength}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
              <span className="text-[9px] font-black text-red-600 uppercase block mb-1">약점/기회</span>
              <p className="text-[11px] font-bold text-red-800">{item.weakness}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <span className="text-[9px] font-black text-slate-400 uppercase">피크타임 회전율</span>
              <span className="text-sm font-black text-slate-900">{item.rotationRate}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RevenueHeatmap({ data }: { data: DiagnosisReport["revenueHeatmap"] }) {
  return (
    <div className="mt-8 bg-slate-950 rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">요일별/시간대별 매출·인건비 교차 히트맵</span>
          <Activity className="w-4 h-4 text-brand-accent" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="text-[9px] font-black text-slate-500 uppercase p-2">시간대</th>
                <th className="text-[9px] font-black text-slate-500 uppercase p-2">평일 매출</th>
                <th className="text-[9px] font-black text-slate-500 uppercase p-2">주말 매출</th>
                <th className="text-[9px] font-black text-slate-500 uppercase p-2">인건비 비중</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((row, i) => (
                <tr key={i}>
                  <td className="text-[10px] font-black text-white bg-white/5 p-3 rounded-xl">{row.timeSlot}</td>
                  <td className="text-[11px] font-bold text-slate-300 p-3 bg-blue-500/10 rounded-xl">{row.weekdaySales}</td>
                  <td className="text-[11px] font-bold text-slate-300 p-3 bg-brand-accent/20 rounded-xl border border-brand-accent/30">{row.weekendSales}</td>
                  <td className={`text-[11px] font-black p-3 rounded-xl ${String(row.laborCost).includes("고효율") ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>{row.laborCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CostBreakdownTable({ data }: { data: DiagnosisReport["menuEngineering"]["costBreakdown"] }) {
  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/20">
      <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">주요 메뉴 실측 원가 분해표 (추정)</span>
        <TrendingUp className="w-4 h-4 text-emerald-500" />
      </div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">메뉴 명칭</th>
            <th className="px-6 py-4 text-[10px] font-black text-red-500 uppercase tracking-widest">식재료 원가율</th>
            <th className="px-6 py-4 text-[10px] font-black text-orange-500 uppercase tracking-widest">인건비 배분율</th>
            <th className="px-6 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest">실질 순익률</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data?.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4"><span className="text-[12px] font-black text-slate-900">{row.menuName}</span></td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-600">{row.rawMaterialRatio}%</span>
                  <div className="w-full h-1 bg-red-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${row.rawMaterialRatio}%` }} className="h-full bg-red-400" /></div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-600">{row.laborRatio}%</span>
                  <div className="w-full h-1 bg-orange-100 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${row.laborRatio}%` }} className="h-full bg-orange-400" /></div>
                </div>
              </td>
              <td className="px-6 py-4"><span className={`text-[12px] font-black ${row.netProfitRatio > 20 ? "text-emerald-600" : "text-slate-900"}`}>{row.netProfitRatio}%</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthlyTrendChart({ data }: { data: DiagnosisReport["financialDetail"]["monthlyTrend"] }) {
  return (
    <div className="h-[300px] w-full mt-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">월별 손익 퍼포먼스 추이</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-accent" /><span className="text-[9px] font-black text-slate-400 uppercase">매출 (Sales)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-black text-slate-400 uppercase">순익 (Profit)</span></div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data || []}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
          <YAxis hide />
          <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold" }} />
          <Area type="monotone" dataKey="sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
          <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProductivityMetrics({ data }: { data: DiagnosisReport["customerLogistics"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block mb-1">고객 재방문율</span>
          <div className="text-3xl font-black text-white mb-2">{data.retentionRate}</div>
          <p className="text-[11px] font-bold text-slate-400">{data.insight}</p>
        </div>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/30">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">직원 1인당 생산성</span>
        <div className="text-3xl font-black text-slate-900 mb-2">{data.tablesPerStaff}</div>
        <p className="text-[11px] font-bold text-slate-500">담당 테이블 수 기준 서비스 품질 유지 지수입니다.</p>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/30">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">평균 주문 처리 속도</span>
        <div className="text-3xl font-black text-slate-900 mb-2">{data.processingTime}</div>
        <p className="text-[11px] font-bold text-slate-500">최초 주문부터 서빙 완료까지의 소요 시간입니다.</p>
      </div>
    </div>
  );
}

function StrategicRisksGrid({ risks }: { risks: DiagnosisReport["strategicRisks"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {risks?.map((r, i) => (
        <div key={i} className="bg-red-50/30 border border-red-100 rounded-3xl p-6 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">전략적 역방향 리스크</span>
            </div>
            <h5 className="text-sm font-black text-slate-900 leading-tight">{r.risk}</h5>
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic border-l-2 border-red-200 pl-2"><span className="text-red-500 opacity-50 mr-1 uppercase text-[9px] font-black">영향:</span> {r.impact}</p>
              <p className="text-[11px] font-bold text-emerald-600 leading-relaxed italic border-l-2 border-emerald-200 pl-2"><span className="text-emerald-500 opacity-50 mr-1 uppercase text-[9px] font-black">대응:</span> {r.prevention}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// 코치 섹션 골격
// ===========================================================================

type CoachTheme = { name: string; role: string; initial: string; text: string; ring: string; barL: string; Icon: typeof Crown };

const COACH_THEME: Record<CoachId, CoachTheme> = {
  sophia: { name: "마스터 코치 소피아", role: "종합 진단 · 핵심 해법 · 팀 배정", initial: "소", text: "text-violet-600", ring: "border-violet-500", barL: "border-l-violet-500", Icon: Crown },
  "anne-data": { name: "데이터 분석가 앤", role: "매출 · 메뉴 · 재무 진단", initial: "앤", text: "text-blue-600", ring: "border-blue-500", barL: "border-l-blue-500", Icon: BarChart3 },
  "claire-cs": { name: "CS 코치 클레어", role: "고객 · 리뷰", initial: "클", text: "text-rose-600", ring: "border-rose-500", barL: "border-l-rose-500", Icon: MessageSquareQuote },
  "jane-marketer": { name: "마케터 제인", role: "마케팅 · 경쟁분석", initial: "제", text: "text-orange-600", ring: "border-orange-500", barL: "border-l-orange-500", Icon: Megaphone },
  "kelly-creator": { name: "크리에이터 켈리", role: "콘텐츠 아이디어 · 얼굴 노출 없음", initial: "켈", text: "text-teal-600", ring: "border-teal-500", barL: "border-l-teal-500", Icon: Clapperboard },
};

function ownerName(owner: TaskOwner): string {
  if (owner === "owner") return "사장님";
  return COACHES[owner].shortName;
}

function CoachSection({ coachId, score, intro, children }: { coachId: CoachId; score?: ReactNode; intro?: string; children: ReactNode }) {
  const t = COACH_THEME[coachId];
  const Icon = t.Icon;
  return (
    <section className={`bg-white border border-slate-200 border-l-4 ${t.barL} rounded-3xl p-7 md:p-10 shadow-sm`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-full border-2 ${t.ring} ${t.text} flex items-center justify-center font-black text-base shrink-0`}>{t.initial}</div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-black text-slate-900 leading-tight">{t.name}</div>
          <div className="text-xs font-bold text-slate-400">{t.role}</div>
        </div>
        {score}
        <Icon className={`w-5 h-5 ${t.text} shrink-0`} />
      </div>
      {intro && <p className="text-[15px] text-slate-600 leading-relaxed mb-6 border-l-2 border-slate-100 pl-4">{intro}</p>}
      {children}
    </section>
  );
}

function SubHead({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-8 mb-3">{children}</div>;
}

// ===========================================================================
// 통합 컨설팅 리포트
// ===========================================================================

export function ConsultingReport({ report, teamSophia, diagnosisData, onReset }: { report: DiagnosisReport; teamSophia: TeamSophiaEngineResult | null; diagnosisData?: DiagnosisData; onReset: () => void }) {
  const ts = teamSophia?.report;
  const storeName = teamSophia?.slack.summary.storeName ?? "사장님 매장";
  const dateStr = new Date(teamSophia?.meta.generatedAt ?? Date.now()).toLocaleDateString("ko-KR");
  const [showDraft, setShowDraft] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 flex flex-col pb-32">
      {/* 헤더 — 팀소피아 브랜드 */}
      <header className="bg-slate-900 border-b border-white/10 px-6 md:px-8 py-5 sticky top-0 z-50 backdrop-blur-md bg-slate-900/95 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 bg-brand-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-accent/30 ring-1 ring-white/20 shrink-0">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black text-white tracking-tight leading-none truncate">팀소피아 컨설팅 리포트</h1>
              </div>
              <p className="text-[10px] font-bold text-slate-400 tracking-wide mt-1.5 truncate">{storeName} · {dateStr}</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3 print:hidden shrink-0">
            <button onClick={() => { window.focus(); window.print(); }} className="px-4 py-2.5 text-xs font-black text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 transition-all flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" /> <span className="hidden md:inline">PDF 출력</span>
            </button>
            <button onClick={onReset} className="bg-brand-accent hover:bg-blue-500 text-white px-4 md:px-6 py-2.5 rounded-xl text-xs font-black shadow-2xl shadow-blue-900/40 transition-all active:scale-95 ring-1 ring-white/20">
              새 진단
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 md:px-8 mt-10 space-y-8">
        {/* 5인 코치 헤더 라인 */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {(Object.keys(COACH_THEME) as CoachId[]).map((cid) => {
            const t = COACH_THEME[cid];
            return (
              <div key={cid} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-1.5 pr-3 py-1 shadow-sm">
                <span className={`w-6 h-6 rounded-full border ${t.ring} ${t.text} flex items-center justify-center text-[10px] font-black`}>{t.initial}</span>
                <span className="text-[11px] font-bold text-slate-500">{t.name.split(" ").slice(-1)[0]}</span>
              </div>
            );
          })}
        </div>

        {/* 팀소피아(Hermes) 라이브 — 자기개선 코치 팀의 실제 응답 (메인) */}
        {diagnosisData && <HermesLivePanel diagnosisData={diagnosisData} />}

        {/* 아래는 AI 빠른 초안 · 정밀 데이터 (보조, 기본 접힘) */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-slate-200" />
          <button
            onClick={() => setShowDraft((v) => !v)}
            className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showDraft ? "rotate-180" : ""}`} />
            AI 빠른 초안 · 정밀 데이터 {showDraft ? "접기" : "보기"} (보조)
          </button>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {showDraft && (
          <>
        {/* ========================= 소피아 — 종합 진단 ========================= */}
        <CoachSection
          coachId="sophia"
          intro={ts?.sophiaSummary.overview}
          score={
            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-violet-600 leading-none">{report.overallScore}</div>
              <div className="text-[10px] font-bold text-slate-400">매장 건강지수</div>
            </div>
          }
        >
          {ts?.sophiaSummary.emotionalNote && (
            <p className="text-[13px] text-slate-500 leading-relaxed mb-5 -mt-2">{ts.sophiaSummary.emotionalNote}</p>
          )}

          {/* 핵심 해법 */}
          <div className="bg-slate-900 rounded-2xl p-6 mb-6 relative overflow-hidden">
            <Quote className="absolute top-3 right-4 w-10 h-10 text-white/5" />
            <span className="text-[10px] font-black text-violet-300 uppercase tracking-widest">핵심 해법 선언</span>
            <p className="text-xl md:text-2xl font-black text-white italic leading-snug mt-2">"{report.coreStrategy}"</p>
            <p className="text-[13px] text-slate-400 mt-3 leading-relaxed">{report.summary}</p>
          </div>

          {/* 점수 해석 + 레이더 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${report.overallScore >= 80 ? "bg-emerald-500" : report.overallScore >= 60 ? "bg-blue-500" : report.overallScore >= 40 ? "bg-orange-500" : "bg-red-500"} text-white`}>{report.scoreInterpretation?.label}</span>
                <span className="text-[10px] font-bold text-slate-400">데이터 정밀도 {report.dataFidelity}%</span>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed mb-3">{report.scoreInterpretation?.description}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{report.scoreInterpretation?.calculationLogic}</p>
            </div>
            {report.analysisVectors?.length > 0 && (
              <div className="h-[260px] bg-slate-50 rounded-2xl border border-slate-100 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={report.analysisVectors}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 3단 구조 분석 */}
          {report.threeLayerAnalysis && (
            <>
              <SubHead>3단 구조 분석</SubHead>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([["표면 증상", report.threeLayerAnalysis.surface], ["직접 원인", report.threeLayerAnalysis.direct], ["구조적 원인", report.threeLayerAnalysis.structural]] as const).map(([label, val], i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2">{label}</div>
                    <p className="text-[13px] text-slate-600 leading-relaxed">{val}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Top 3 우선순위 */}
          {report.topThreePriorities?.length > 0 && (
            <>
              <SubHead>당장 내일부터 — Top 3 우선순위</SubHead>
              <div className="space-y-2">
                {report.topThreePriorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-black flex items-center justify-center shrink-0">{p.rank}</span>
                    <div>
                      <div className="text-sm font-black text-slate-900">{p.task}</div>
                      <p className="text-[12px] text-slate-500 mt-0.5">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 강점 / 약점 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">핵심 경쟁력</div>
              <ul className="space-y-2">{report.strengths?.map((s, i) => <li key={i} className="text-[13px] text-slate-700 flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{s}</li>)}</ul>
            </div>
            <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
              <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">주요 병목 리스크</div>
              <ul className="space-y-2">{report.weaknesses?.map((w, i) => <li key={i} className="text-[13px] text-slate-700 flex gap-2"><AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />{w}</li>)}</ul>
            </div>
          </div>

          {report.ownerMindsetFeedback && (
            <div className="mt-6 bg-violet-50/50 border border-violet-100 rounded-2xl p-6">
              <div className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2">사장님께 드리는 한마디</div>
              <p className="text-[14px] text-slate-600 leading-relaxed italic font-serif">{report.ownerMindsetFeedback}</p>
            </div>
          )}
        </CoachSection>

        {/* ========================= 앤 — 데이터·재무 ========================= */}
        <CoachSection coachId="anne-data" intro={ts?.anneDiagnosis.diagnosis}>
          {ts?.anneDiagnosis.findings && ts.anneDiagnosis.findings.length > 0 && (
            <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5 mb-2">
              <ul className="space-y-1.5">{ts.anneDiagnosis.findings.map((f, i) => <li key={i} className="text-[13px] text-slate-700 flex gap-2"><span className="text-blue-500 font-black">·</span>{f}</li>)}</ul>
            </div>
          )}

          {/* 돈으로 번역되는 효과 */}
          {report.monetaryEffect?.length > 0 && (
            <>
              <SubHead>재무적 환산 — 돈으로 번역되는 효과</SubHead>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.monetaryEffect.map((m, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <span className="text-[13px] font-bold text-slate-700">{m.action}</span>
                    <span className="text-sm font-black text-emerald-600">{m.expectedGain}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* BEP */}
          {report.bepAnalysis && (
            <>
              <SubHead>손익분기점(BEP) 분석</SubHead>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100"><div className="text-[10px] font-bold text-slate-400">현재 상태</div><div className="text-sm font-black text-slate-900 mt-1">{report.bepAnalysis.currentStatus}</div></div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100"><div className="text-[10px] font-bold text-slate-400">목표 매출</div><div className="text-sm font-black text-slate-900 mt-1">{report.bepAnalysis.targetSales}</div></div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100"><div className="text-[10px] font-bold text-slate-400">고정비율</div><div className="text-sm font-black text-slate-900 mt-1">{report.bepAnalysis.fixedCostRatio}%</div></div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100"><div className="text-[10px] font-bold text-slate-400">공헌이익률</div><div className="text-sm font-black text-slate-900 mt-1">{report.bepAnalysis.contributionMarginRatio}%</div></div>
              </div>
            </>
          )}

          {report.efficiencyMetrics?.length > 0 && (
            <><SubHead>운영 효율 지표</SubHead><EfficiencyGrid metrics={report.efficiencyMetrics} inventory={report.menuEngineering?.inventoryMix} /></>
          )}

          {report.revenueHeatmap?.length > 0 && (<><SubHead>매출 히트맵</SubHead><RevenueHeatmap data={report.revenueHeatmap} /></>)}

          {/* 메뉴 엔지니어링 — BCG 4분면 */}
          {report.menuEngineering && (
            <>
              <SubHead>메뉴 엔지니어링</SubHead>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Star · 효자메뉴", items: report.menuEngineering.star, box: "bg-emerald-50/40 border-emerald-100", text: "text-emerald-600" },
                  { label: "Plowhorse · 인기·저마진", items: report.menuEngineering.plowhorse, box: "bg-blue-50/40 border-blue-100", text: "text-blue-600" },
                  { label: "Puzzle · 고마진·저인기", items: report.menuEngineering.puzzle, box: "bg-orange-50/40 border-orange-100", text: "text-orange-600" },
                  { label: "Dog · 정리 대상", items: report.menuEngineering.dog, box: "bg-red-50/40 border-red-100", text: "text-red-600" },
                ].map((q, i) => (
                  <div key={i} className={`${q.box} border rounded-2xl p-4`}>
                    <div className={`text-[10px] font-black ${q.text} uppercase tracking-widest mb-2`}>{q.label}</div>
                    <ul className="space-y-1">{q.items?.map((m, j) => <li key={j} className="text-[12px] font-bold text-slate-600">{m}</li>)}</ul>
                  </div>
                ))}
              </div>
              {report.menuEngineering.costBreakdown?.length > 0 && <CostBreakdownTable data={report.menuEngineering.costBreakdown} />}
            </>
          )}

          {/* 재무 상세 */}
          {report.financialDetail && (
            <>
              <SubHead>재무 상세</SubHead>
              {report.financialDetail.monthlyTrend?.length > 0 && <MonthlyTrendChart data={report.financialDetail.monthlyTrend} />}
              {report.financialDetail.profitWaterfall?.length > 0 && <WaterfallChart data={report.financialDetail.profitWaterfall} cashFlow={report.financialDetail.cashFlowInsight} />}
              {report.financialDetail.laborDetail?.length > 0 && <LaborDetailTable data={report.financialDetail.laborDetail} />}
            </>
          )}
        </CoachSection>

        {/* ========================= 클레어 — 고객·리뷰 ========================= */}
        <CoachSection coachId="claire-cs" intro={report.customerLogistics?.insight}>
          {report.customerLogistics && <ProductivityMetrics data={report.customerLogistics} />}

          {ts?.claireDiagnosis.customerIssues && ts.claireDiagnosis.customerIssues.length > 0 && (
            <><SubHead>주요 고객 이슈</SubHead>
              <ul className="space-y-2">{ts.claireDiagnosis.customerIssues.map((c, i) => <li key={i} className="text-[13px] text-slate-700 bg-rose-50/40 border border-rose-100 rounded-xl px-4 py-3 flex gap-2"><AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />{c}</li>)}</ul>
            </>
          )}

          {ts?.claireDiagnosis.replyDrafts && ts.claireDiagnosis.replyDrafts.length > 0 && (
            <><SubHead>답글 초안 (검수 후 발송)</SubHead>
              <div className="space-y-2">{ts.claireDiagnosis.replyDrafts.map((d, i) => <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-[13px] text-slate-600 leading-relaxed italic">"{d}"</div>)}</div>
            </>
          )}

          {ts?.claireDiagnosis.preventiveActions && ts.claireDiagnosis.preventiveActions.length > 0 && (
            <><SubHead>재발 방지 액션</SubHead>
              <ul className="space-y-2">{ts.claireDiagnosis.preventiveActions.map((a, i) => <li key={i} className="text-[13px] text-slate-700 flex gap-2"><CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />{a}</li>)}</ul>
            </>
          )}
        </CoachSection>

        {/* ========================= 제인 — 마케팅·경쟁 ========================= */}
        <CoachSection coachId="jane-marketer" intro={report.marketingStrategy}>
          {ts?.janePlan.actions && ts.janePlan.actions.length > 0 && (
            <div className="space-y-3">
              {ts.janePlan.actions.map((a, i) => (
                <div key={i} className="bg-orange-50/40 border border-orange-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">{a.cost}</span>
                    <span className="text-sm font-black text-slate-900">{a.idea}</span>
                  </div>
                  <p className="text-[12px] text-slate-500">→ {a.expectedEffect}</p>
                </div>
              ))}
            </div>
          )}

          {report.competitorAnalysis?.detailedComparison?.length > 0 && (<><SubHead>경쟁점 비교 분석</SubHead><CompetitorTable data={report.competitorAnalysis.detailedComparison} /></>)}
          {report.competitorAnalysis?.mysteryShopping?.length > 0 && (<><SubHead>미스터리 쇼핑</SubHead><MysteryShoppingGrid data={report.competitorAnalysis.mysteryShopping} /></>)}
        </CoachSection>

        {/* ========================= 켈리 — 콘텐츠 ========================= */}
        {ts?.kellyIdeas.ideas && ts.kellyIdeas.ideas.length > 0 && (
          <CoachSection coachId="kelly-creator">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ts.kellyIdeas.ideas.map((idea, i) => (
                <div key={i} className="bg-teal-50/40 border border-teal-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-teal-100 text-teal-700">{idea.format}</span>
                    {idea.faceless && <span className="text-[10px] font-bold text-slate-400">얼굴 노출 X</span>}
                  </div>
                  <div className="text-sm font-black text-slate-900 mb-1">{idea.concept}</div>
                  <p className="text-[12px] text-slate-500">{idea.caption}</p>
                </div>
              ))}
            </div>
          </CoachSection>
        )}

        {/* ========================= 팀 실행 플랜 ========================= */}
        <section className="bg-slate-900 rounded-3xl p-7 md:p-10 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-brand-accent flex items-center justify-center ring-1 ring-white/20"><CheckCircle2 className="w-6 h-6 text-white" /></div>
            <div><h3 className="text-lg font-black text-white">팀 실행 플랜</h3><p className="text-[11px] font-bold text-slate-400">팀소피아가 함께 실행합니다</p></div>
          </div>

          {/* 오늘 바로 할 일 */}
          {ts?.todayActions && ts.todayActions.length > 0 && (
            <div className="mb-6">
              <div className="text-[11px] font-black text-brand-accent uppercase tracking-widest mb-3">오늘 바로 할 일 (10~30분)</div>
              <div className="space-y-2">
                {ts.todayActions.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                    <span className="w-6 h-6 rounded-full bg-brand-accent text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-[13px] text-slate-200 flex-1">{a.task}</span>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{a.estimatedMinutes}분 · {ownerName(a.owner)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 이번 주 플랜 */}
            {ts?.weeklyPlan && ts.weeklyPlan.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3"><CalendarDays className="w-4 h-4 text-slate-400" /><span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">이번 주 플랜</span></div>
                <ul className="space-y-2">{ts.weeklyPlan.map((w, i) => <li key={i} className="text-[12px] text-slate-300 flex gap-2"><span className="font-black text-brand-accent w-8 shrink-0">{w.when}</span><span className="flex-1">{w.task}</span><span className="text-[10px] text-slate-500">{ownerName(w.owner)}</span></li>)}</ul>
              </div>
            )}

            {/* 업무 배정 */}
            {ts?.assignments && ts.assignments.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-slate-400" /><span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">업무 배정</span></div>
                <ul className="space-y-2">{ts.assignments.map((a, i) => <li key={i} className="text-[12px] text-slate-300"><span className="font-black text-brand-accent">{ownerName(a.owner)}</span><span className="text-slate-400"> — {a.task}</span></li>)}</ul>
              </div>
            )}
          </div>

          {/* 추가 필요 데이터 */}
          {ts?.neededData && ts.neededData.length > 0 && (
            <div className="mt-5 bg-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><HelpCircle className="w-4 h-4 text-slate-400" /><span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">추가로 필요한 데이터</span></div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">{ts.neededData.map((n, i) => <li key={i} className="text-[12px] text-slate-300 flex gap-2"><span className="text-orange-400">·</span>{n}</li>)}</ul>
            </div>
          )}
        </section>

        {/* 실행 체크리스트 (정밀) */}
        {report.actionChecklist?.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-3xl p-7 md:p-10 shadow-sm">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">실행 체크리스트</div>
            <div className="space-y-3">
              {report.actionChecklist.map((a, i) => (
                <div key={i} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                    <span className="text-sm font-black text-slate-900">{a.task}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${a.priority === "최우선" ? "bg-red-100 text-red-600" : a.priority === "우선" ? "bg-orange-100 text-orange-600" : "bg-slate-200 text-slate-500"}`}>{a.priority}</span>
                      <span className="text-[10px] font-bold text-slate-400">{a.deadline} · {a.owner}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <p className="text-slate-500"><span className="font-black text-brand-accent">KPI:</span> {a.kpi}</p>
                    <p className="text-slate-500"><span className="font-black text-orange-500">저항 대응:</span> {a.barrierResponse}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 전략 리스크 */}
        {report.strategicRisks?.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-3xl p-7 md:p-10 shadow-sm">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">전략적 리스크 관리</div>
            <StrategicRisksGrid risks={report.strategicRisks} />
          </section>
        )}

        {/* 6개월 비전 */}
        {report.sixMonthGoalAction && (
          <section className="bg-brand-accent rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="shrink-0 w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/25"><Target className="w-10 h-10 text-white" /></div>
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100">6개월(180일) 후 도달 목표</span>
                <h4 className="text-2xl md:text-3xl font-black leading-tight italic mt-2">{report.sixMonthGoalAction}</h4>
                {report.successMetrics?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                    {report.successMetrics.map((m, i) => (
                      <div key={i}>
                        <span className="text-[9px] font-black text-blue-200/70 uppercase tracking-widest block">{m.label}</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="text-[10px] text-blue-200/50 line-through font-bold">{m.before}</span>
                          <ChevronRight className="w-2.5 h-2.5 text-white" />
                          <span className="text-lg font-black text-white">{m.after}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 근거 */}
        {report.citations?.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-3xl p-7 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-5"><Info className="w-5 h-5 text-slate-400" /><h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">데이터 출처 및 산출 근거</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {report.citations.map((c, i) => (
                <div key={i}><div className="text-[10px] font-black text-brand-accent uppercase tracking-widest">{c.source}</div><p className="text-[11px] font-bold text-slate-500 leading-relaxed mt-1">{c.description}</p></div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center py-12 opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">팀소피아 · 소상공인 AI 컨설팅 팀<br />엔진 {teamSophia?.meta.engine ?? "—"} · 대외비 리포트</p>
        </div>
          </>
        )}
      </main>
    </motion.div>
  );
}
