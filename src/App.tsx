import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ClipboardCheck, 
  BarChart3, 
  Settings2, 
  Users2, 
  Zap, 
  Globe, 
  Activity, 
  Target, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle,
  TrendingDown,
  CheckCircle2,
  FileText,
  Search,
  MessageSquareQuote,
  Loader2,
  Info,
  TrendingUp,
  LayoutGrid,
  Star,
  Calendar,
  Trash2,
  ShieldCheck,
  Quote,
  Coins
} from "lucide-react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { DIAGNOSIS_ITEMS } from "./constants";
import { DiagnosisSection, DiagnosisData, DiagnosisReport } from "./types";
import { generateDiagnosis } from "./services/geminiService";

export default function App() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [data, setData] = useState<DiagnosisData>(() => {
    const saved = localStorage.getItem("diagnosis_data");
    return saved ? JSON.parse(saved) : {};
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [showMustFillOnly, setShowMustFillOnly] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("diagnosis_data", JSON.stringify(data));
    if (Object.keys(data).length > 0) {
      setLastSaved(new Date().toLocaleTimeString());
    }
  }, [data]);

  const loadingStages = [
    { title: "매장 지표 구조 파악", desc: "사용자가 입력한 55가지 분석 항목의 정합성을 검토하고 있습니다." },
    { title: "손익분기 분석", desc: "임대료, 인건비, 원가율을 바탕으로 매장의 생존선을 계산합니다." },
    { title: "메뉴 공학 설계", desc: "BCG Matrix 로직을 가동하여 주력 메뉴의 수익성을 재배치합니다." },
    { title: "시장 점유 전략", desc: "상권 정보와 유입 경로를 결합하여 공격적인 마케팅 포인트를 찾습니다." },
    { title: "현실적 처방전 생성", desc: "사장님의 여건에 맞는 6개월 단위 액션 플랜을 구성하고 있습니다." },
    { title: "베테랑 조언 요약", desc: "마지막으로 가장 뼈아픈 핵심 약점을 찾아 촌철살인 한마디를 준비합니다." }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitting) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < loadingStages.length - 1 ? prev + 1 : prev));
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isSubmitting, loadingStages.length]);

  const sections = useMemo(() => {
    return Object.values(DiagnosisSection);
  }, []);

  const currentSection = sections[currentSectionIndex];
  
  const currentItems = useMemo(() => {
    const items = DIAGNOSIS_ITEMS.filter(item => item.section === currentSection);
    return showMustFillOnly ? items.filter(i => i.isMustFill) : items;
  }, [currentSection, showMustFillOnly]);

  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  const handleInputChange = (id: number, value: string) => {
    setData(prev => ({ ...prev, [id]: value }));
  };

  const fillMockData = () => {
    const mockData: DiagnosisData = {
      1: "외식업 > 한식 > 고기구이 전문점",
      2: "2022-11-20",
      3: "주거지 밀집",
      4: "40평, 좌석 80석 (테이블 20개)",
      5: "사장 1명, 정직원 2명, 알바 4명",
      7: "65000000",
      9: "1800",
      10: "36000",
      14: "5500000",
      15: "38",
      21: "숙성 통삼겹살, 소생갈비, 한우 육회, 시골 된장찌개",
      29: "네이버 플레이스 예약 40%, 인근 아파트 주민 및 로컬 단골 40%, 블로그/SNS 리뷰 20%",
      35: "336시간 웻에이징 숙성법과 최고급 참숯 직화, 5년 숙성 천일염 사용",
      52: "원재료값 및 인건비 상승으로 인한 순이익률 정체, 주말에 편중된 매출 구조로 인한 평일 유휴 인력 및 고정비 비효율 발생",
    };
    setData(mockData);
  };

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    // Check must-fill items
    const missingMustFill = DIAGNOSIS_ITEMS.filter(item => item.isMustFill && !data[item.id]);
    if (missingMustFill.length > 0) {
      alert(`필수 항목을 입력해주세요: ${missingMustFill.map(i => i.label).join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await generateDiagnosis(data);
      setReport(result);
    } catch (error: any) {
      console.error("Diagnosis Error:", error);
      alert(error.message || "분석 리포트 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setReport(null);
    setCurrentSectionIndex(0);
    setData({});
    localStorage.removeItem("diagnosis_data");
  };

  if (report) {
    return <ReportView report={report} onReset={reset} />;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-brand-primary rounded-lg text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">장사 비서 프로페셔널</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">전문가 분석 시스템 v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => setShowMustFillOnly(!showMustFillOnly)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black transition-all border ${
                  showMustFillOnly 
                    ? "bg-brand-accent text-white border-brand-accent shadow-lg shadow-blue-200" 
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 shadow-sm shadow-slate-100"
                }`}
              >
                <Zap className={`w-3 h-3 ${showMustFillOnly ? "fill-white" : ""}`} />
                {showMustFillOnly ? "필수 질문만 표시 중" : "전체 질문 보기"}
              </button>
              <span className={`text-[9px] font-black tracking-tighter transition-colors ${showMustFillOnly ? "text-brand-accent" : "text-slate-400"}`}>
                {showMustFillOnly ? "현황 파악을 위한 퀵(Quick) 모드" : "정밀 컨설팅을 위한 풀(Full) 모드"}
              </span>
            </div>

            <div className="hidden md:flex flex-col items-end gap-1.5 w-48">
            <div className="flex justify-between w-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>진행률</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>

      <main className="max-w-6xl mx-auto px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0 space-y-2 hidden lg:block">
            <div className="mb-6">
              <span className="meta-label">분석 단계</span>
            </div>
            {sections.map((section, idx) => {
              const sectionItems = DIAGNOSIS_ITEMS.filter(i => i.section === section);
              const filledCount = sectionItems.filter(i => !!data[i.id]).length;
              const totalInSelection = showMustFillOnly 
                ? sectionItems.filter(i => i.isMustFill).length 
                : sectionItems.length;

              return (
                <button
                  key={section}
                  onClick={() => setCurrentSectionIndex(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex flex-col group ${
                    idx === currentSectionIndex 
                      ? "bg-slate-900 text-white font-bold shadow-xl shadow-slate-200" 
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="truncate text-[12px] uppercase tracking-tighter">
                      {idx + 1}. {section.replace("SECTION ", "")}
                    </span>
                    {idx < currentSectionIndex || (filledCount > 0 && filledCount === totalInSelection) ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${idx === currentSectionIndex ? 'bg-brand-accent' : 'bg-slate-200'}`} />
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="h-1 bg-slate-200 rounded-full flex-1 mr-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${idx === currentSectionIndex ? 'bg-brand-accent' : 'bg-slate-300'}`}
                        style={{ width: `${(filledCount / totalInSelection) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-black opacity-60">{filledCount}/{totalInSelection}</span>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Form Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Section Nav */}
            <div className="lg:hidden mb-6 overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {sections.map((section, idx) => (
                  <button
                    key={section}
                    onClick={() => setCurrentSectionIndex(idx)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      idx === currentSectionIndex 
                        ? "bg-slate-900 text-white" 
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {idx + 1}. {section.replace("SECTION ", "")}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="section-title mb-2">{currentSection}</h2>
                    <p className="text-slate-500 text-sm">
                      {showMustFillOnly 
                        ? "핵심 지표 산출을 위한 '필수' 항목들입니다. 빠르게 분석을 받으실 수 있습니다." 
                        : "해당 섹션의 질문에 답변하여 정밀한 분석 리포트를 받으세요."}
                    </p>
                  </div>
                  {showMustFillOnly && currentItems.length === 0 && (
                    <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-500">본 섹션에는 필수 항목이 없습니다. <button onClick={handleNext} className="text-brand-accent underline">다음 단계로 이동</button></span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {currentItems.map((item) => (
                    <div key={item.id} className={`${item.type === "textarea" ? "col-span-full" : ""} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                          {item.label}
                          {item.isMustFill && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-black border border-red-100 uppercase tracking-tighter">
                              필수
                            </span>
                          )}
                        </label>
                        <span className="text-[10px] font-mono text-slate-300">ID-{item.id}</span>
                      </div>
                      
                      <div className="relative group">
                        {item.type === "textarea" ? (
                          <textarea
                            placeholder={item.placeholder || "상세 내용을 입력하세요..."}
                            className="input-field min-h-[120px] resize-none"
                            value={data[item.id] || ""}
                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                          />
                        ) : item.type === "select" ? (
                          <select
                            className="input-field appearance-none"
                            value={data[item.id] || ""}
                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                          >
                            <option value="">옵션 선택</option>
                            {item.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={item.type === "percentage" ? "number" : item.type}
                            placeholder={item.placeholder || "내용 입력"}
                            className="input-field"
                            value={data[item.id] || ""}
                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                          />
                        )}
                        {item.description && (
                          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-400 italic">
                            <Info className="w-3 h-3 shrink-0 mt-0.5" />
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12 py-8 border-t border-slate-200">
                  <div className="flex gap-4">
                    <button
                      onClick={handlePrev}
                      disabled={currentSectionIndex === 0}
                      className="btn-primary"
                    >
                      <ChevronLeft className="w-4 h-4" /> 이전 단계
                    </button>
                    {currentSectionIndex === 0 && (
                      <button
                        onClick={fillMockData}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest px-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-all"
                      >
                        샘플 데이터 로드
                      </button>
                    )}
                  </div>

                  {currentSectionIndex === sections.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="btn-accent"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> 매장 현황 심층 분석 중...</>
                      ) : (
                        <><BarChart3 className="w-4 h-4" /> 장사 비서 리포트 생성</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="btn-primary"
                    >
                      다음 단계 <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Professional Value Promise Block */}
            <div className="mt-12 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6 group transition-all hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/20">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-50 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 text-slate-300 group-hover:text-brand-accent transition-colors" />
              </div>
              <div className="space-y-1.5 text-center md:text-left">
                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">철저한 보안과 전문 컨설팅의 약속</h4>
                <p className="text-[12px] font-bold text-slate-500 leading-relaxed max-w-2xl">
                  "매장의 현황을 알려주시는 순간, <span className="text-brand-accent">보이지 않던 병목과 놓치고 있던 기회</span>가 선명해집니다.
                  현장의 흐름과 숫자를 함께 읽어, 사장님 매장에 꼭 맞는 정확한 진단을 내립니다."
                </p>
              </div>
              <div className="hidden lg:block ml-auto px-6 py-3 border-l border-slate-200">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">분석 정밀도</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => <div key={n} className="w-1 h-3 bg-brand-accent/20 rounded-full" />)}
                  <span className="text-[9px] font-black text-brand-accent ml-2">HIGH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Must-Fill Reminder */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[11px] font-bold">
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
              <span>절대 필수 항목</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>미입력 필수 항목: <span className="text-red-500 font-black">{DIAGNOSIS_ITEMS.filter(i => i.isMustFill && !data[i.id]).length}</span>개</span>
            </div>
            {lastSaved && (
              <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                <span>임시 저장됨 ({lastSaved})</span>
              </div>
            )}
          </div>
          <div className="hidden sm:block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
            시스템 상태: 분석 준비 완료
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center text-white px-8 overflow-hidden"
          >
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-[120px]" />
            
            <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
              <div className="relative mb-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-32 h-32 border-2 border-slate-800 border-t-brand-accent rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full backdrop-blur-sm flex items-center justify-center border border-white/5">
                    <Activity className="w-8 h-8 text-brand-accent animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-4 mb-12">
                <motion.div
                  key={loadingStage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-2"
                >
                  <div className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em]">분석 {loadingStage + 1}단계 / 총 {loadingStages.length}단계</div>
                  <h3 className="text-4xl font-black tracking-tighter">{loadingStages[loadingStage].title}</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                    {loadingStages[loadingStage].desc}
                  </p>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">분석 진행률</span>
                  <span className="text-xs font-black text-brand-accent">{Math.round(((loadingStage + 1) / loadingStages.length) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${((loadingStage + 1) / loadingStages.length) * 100}%` }}
                    className="h-full bg-brand-accent transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WaterfallChart({ data, cashFlow }: { data: DiagnosisReport["financialDetail"]["profitWaterfall"], cashFlow: string }) {
  return (
    <div className="space-y-3 mt-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">순이익 산출 Waterfall (추정)</span>
        <div className="flex items-center gap-1 text-brand-accent">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black">PROFIT LOGIC</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {data?.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5 group">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold ${item.type === 'total' ? 'text-brand-accent font-black' : 'text-slate-600'}`}>
                {item.label}
              </span>
              <span className={`text-[11px] font-black font-mono ${
                item.type === 'plus' ? 'text-emerald-600' : 
                item.type === 'minus' ? 'text-red-500' : 'text-slate-900'
              }`}>
                {item.value}
              </span>
            </div>
            {item.type !== 'total' && (
              <div className="h-1 w-full bg-slate-200/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: item.type === 'minus' ? '70%' : '100%' }}
                  className={`h-full ${
                    item.type === 'plus' ? 'bg-emerald-500' : 'bg-red-400'
                  }`}
                />
              </div>
            )}
            {item.type === 'total' && <div className="h-0.5 w-full bg-brand-accent/20" />}
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-brand-accent">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="w-3.5 h-3.5 text-brand-accent" />
          <span className="text-[10px] font-black text-slate-900 uppercase">현금흐름(Cash Flow) 구조 진단</span>
        </div>
        <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic line-clamp-2">
          {cashFlow}
        </p>
      </div>
    </div>
  );
}

function EfficiencyGrid({ metrics, inventory }: { metrics: DiagnosisReport["efficiencyMetrics"], inventory: DiagnosisReport["menuEngineering"]["inventoryMix"] }) {
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
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.ratio}%` }}
                    className="h-full bg-brand-accent"
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-500 italic mt-1 leading-tight">{item.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
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
            <th className="px-6 py-4 text-[10px] font-black text-brand-accent uppercase tracking-widest">핵심 경쟁사 (Competitor)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data?.map((row, i) => (
            <tr key={i} className="group hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <span className="text-[11px] font-black text-slate-400 uppercase">{row.factor}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-[12px] font-bold text-slate-600">{row.myStore}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-[12px] font-black text-brand-accent">{row.competitor}</span>
              </td>
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
      <p className="text-[9px] text-slate-400 font-bold mt-4 italic uppercase tracking-tight">* 인건비 효율화 제안의 기초가 되는 현황 데이터입니다.</p>
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
                <th className="text-[9px] font-black text-slate-500 uppercase p-2">Time Slot</th>
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
                  <td className={`text-[11px] font-black p-3 rounded-xl ${
                    row.laborCost.includes('고효율') ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                  }`}>{row.laborCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] text-slate-600 font-bold mt-4 italic uppercase tracking-tight">* 매출액과 투입 인건비의 상관관계를 시각화한 구조입니다. 적색은 인력 효율 개선이 필요한 지점입니다.</p>
      </div>
    </div>
  );
}

function CostBreakdownTable({ data }: { data: DiagnosisReport["menuEngineering"]["costBreakdown"] }) {
  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/20">
      <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">주요 메뉴 실측 원가 분해표 (Estimated)</span>
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
              <td className="px-6 py-4">
                <span className="text-[12px] font-black text-slate-900">{row.menuName}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-600">{row.rawMaterialRatio}%</span>
                  <div className="w-full h-1 bg-red-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${row.rawMaterialRatio}%` }} className="h-full bg-red-400" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-slate-600">{row.laborRatio}%</span>
                  <div className="w-full h-1 bg-orange-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${row.laborRatio}%` }} className="h-full bg-orange-400" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`text-[12px] font-black ${row.netProfitRatio > 20 ? 'text-emerald-600' : 'text-slate-900'}`}>{row.netProfitRatio}%</span>
              </td>
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
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-brand-accent" />
            <span className="text-[9px] font-black text-slate-400 uppercase">매출 (Sales)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase">순익 (Profit)</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data || []}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }} 
          />
          <Area type="monotone" dataKey="sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
          <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProductivityMetrics({ data }: { data: DiagnosisReport["customerLogistics"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
          <Users2 className="w-16 h-16 text-brand-accent" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block mb-1">고객 재방문율 (Verification)</span>
          <div className="text-3xl font-black text-white mb-2">{data.retentionRate}</div>
          <p className="text-[11px] font-bold text-slate-400">{data.insight}</p>
        </div>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/30 group">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">직원 1인당 생산성 (Productivity)</span>
        <div className="text-3xl font-black text-slate-900 mb-2">{data.tablesPerStaff}</div>
        <p className="text-[11px] font-bold text-slate-500">테이블 20개 기준 적정 서비스 품질 유지 지수입니다.</p>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/30 group">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">평균 주문 처리 속도 (Velocity)</span>
        <div className="text-3xl font-black text-slate-900 mb-2">{data.processingTime}</div>
        <p className="text-[11px] font-bold text-slate-500">최초 주문부터 서빙 완료까지의 소요 시간입니다.</p>
      </div>
    </div>
  );
}

function StrategicRisksGrid({ risks }: { risks: DiagnosisReport["strategicRisks"] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {risks?.map((r, i) => (
        <div key={i} className="bg-red-50/30 border border-red-100 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-100/50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">전략적 역방향 리스크</span>
            </div>
            <h5 className="text-sm font-black text-slate-900 leading-tight">{r.risk}</h5>
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic border-l-2 border-red-200 pl-2">
                <span className="text-red-500 opacity-50 mr-1 uppercase text-[9px] font-black">Impact:</span> {r.impact}
              </p>
              <p className="text-[11px] font-bold text-emerald-600 leading-relaxed italic border-l-2 border-emerald-200 pl-2">
                <span className="text-emerald-500 opacity-50 mr-1 uppercase text-[9px] font-black">Strategy:</span> {r.prevention}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportView({ report, onReset }: { report: DiagnosisReport; onReset: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 flex flex-col pb-32"
    >
      {/* Header */}
      <header className="bg-slate-900 border-b border-white/10 px-8 py-5 sticky top-0 z-50 backdrop-blur-md bg-slate-900/95 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 bg-brand-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-accent/30 ring-1 ring-white/20">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-tighter leading-none">장사비서 AI 컨설팅 리포트</h1>
                <span className="px-2 py-0.5 bg-brand-accent/20 text-brand-accent rounded text-[9px] font-black uppercase tracking-tighter border border-brand-accent/30">대외비</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <Activity className="w-3 h-3" /> 정밀 분석 엔진 v2.4.0
              </p>
            </div>
          </div>
          <div className="flex gap-4 print:hidden">
            <button 
              onClick={() => {
                window.focus();
                window.print();
              }}
              className="px-5 py-2.5 text-xs font-black text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 transition-all flex items-center gap-2.5 group"
            >
              <FileText className="w-4 h-4 text-slate-500 group-hover:text-brand-accent transition-colors" /> PDF 리포트 출력
            </button>
            <button 
              onClick={onReset}
              className="bg-brand-accent hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-2xl shadow-blue-900/40 transition-all active:scale-95 ring-1 ring-white/20"
            >
              새로운 진단 시작
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 mt-12 space-y-12">
        {/* Upper Hero Section: Overview & Core Logic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Summary Hero */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-10 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Zap className="w-64 h-64 text-brand-accent" />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-blue-50 text-brand-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                    <Zap className="w-3.5 h-3.5" /> 핵심 인사이트 & 요약 전문
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 font-mono tracking-widest uppercase">리포트 식별 코드: BA-2024-X49</span>
                </div>
                
                <div className="relative pl-8 border-l-[6px] border-brand-accent">
                  <Quote className="absolute -top-6 -left-8 w-14 h-14 text-slate-100/80 -z-10" />
                  <h3 className="text-3xl font-black text-brand-accent italic leading-[1.2] tracking-tight">
                    "{report.summary}"
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">핵심 경쟁력</span>
                  </div>
                  <ul className="space-y-3">
                    {report.strengths?.map((s, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[13px] font-bold text-slate-700">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <TrendingDown className="w-3 h-3 text-orange-600" />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">주요 병목 리스크</span>
                  </div>
                  <ul className="space-y-3">
                    {report.weaknesses?.map((w, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span className="text-[13px] font-bold text-slate-700">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Health Score & Fidelity Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Score Card */}
            <div className="bg-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent to-blue-400" />
              <div className="relative w-44 h-44 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88" cy="88" r="82"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="88" cy="88" r="82"
                    stroke="#2563eb"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="515.22"
                    initial={{ strokeDashoffset: 515.22 }}
                    animate={{ strokeDashoffset: 515.22 - (515.22 * report.overallScore) / 100 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(37,99,235,0.5))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black text-white">{report.overallScore}</span>
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">매장 건강 지수</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      report.overallScore >= 80 ? 'bg-emerald-500 text-white' :
                      report.overallScore >= 60 ? 'bg-blue-500 text-white' :
                      report.overallScore >= 40 ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {report.scoreInterpretation.label}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-2xl p-5 border border-white/10">
                <p className="text-[11px] font-bold text-slate-400 italic leading-relaxed text-center">
                  "{report.scoreInterpretation.description}"
                </p>
              </div>
              <div className="w-full mt-4 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <Info className="w-3 h-3 text-blue-400" />
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">지수 산출 공식</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-tight">
                  {report.scoreInterpretation.calculationLogic}
                </p>
              </div>
              <div className="w-full mt-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">세부 산출 성적</span>
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                  {report.scoreInterpretation.calculationDetail}
                </p>
              </div>
              <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between mt-4">
                <div>
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">분석 데이터 신뢰도</div>
                  <div className="text-sm font-black text-white">{report.dataFidelity}% 데이터 정밀도</div>
                </div>
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${report.dataFidelity}%` }}
                    className={`h-full ${report.dataFidelity > 80 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                  />
                </div>
              </div>
            </div>

            {/* Radar Analysis */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <div className="text-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">5대 핵심 지표 분석</span>
              </div>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={report.analysisVectors}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                    />
                    <Radar
                      name="매장 지표"
                      dataKey="score"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.15}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2 border-t border-slate-50 pt-4">
                {report.analysisVectors?.map((v, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-brand-accent transition-colors">{v.subject}</span>
                      <span className="text-[8px] font-black text-slate-300 font-mono">WT: {v.weight}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-bold text-slate-600 italic">"{v.insight}"</span>
                       <span className="text-[11px] font-black text-slate-900 w-6 text-right">{v.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Strategic Blueprint Section - "압축된 의사결정 설계" */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 1. 핵심 해법 선언 */}
          <div className="lg:col-span-12 bg-slate-900 rounded-[2rem] p-1 shadow-2xl">
            <div className="bg-slate-800 rounded-[1.8rem] px-10 py-8 border border-white/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <ShieldCheck className="w-48 h-48 text-white" />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="px-3 py-1 bg-brand-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg">핵심 전략 선언</div>
                   <div className="h-px bg-white/10 flex-1" />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black text-white italic leading-tight max-w-4xl tracking-tight">
                   "{report.coreStrategy}"
                 </h2>
                 <p className="mt-6 text-slate-400 text-sm font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-accent" /> 
                    본 매장의 현주소를 돌파할 단 하나의 핵심 해결책(One-Point Solution)입니다.
                 </p>
               </div>
            </div>
          </div>

          {/* 2. 돈으로 번역되는 효과 */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">돈으로 번역되는 효과</span>
              <Coins className="w-4 h-4 text-brand-accent" />
            </div>
            <div className="p-8 space-y-6 flex-1">
              {report.monetaryEffect?.map((effect, i) => (
                <div key={i} className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                    <span className="text-[11px] font-black text-slate-400 uppercase">{effect.action}</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    {effect.expectedGain}
                  </div>
                  {i < report.monetaryEffect.length - 1 && <div className="mt-6 h-px bg-slate-50" />}
                </div>
              ))}
              <div className="mt-auto p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                  * 위 수치는 현재 상권 데이터와 예상 객단가를 기반으로 한 시뮬레이션 결과입니다.
                </p>
              </div>
            </div>
          </div>

          {/* 3. 실행 순서 3단 압축 */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">실행 순서 3단 압축</span>
              <LayoutGrid className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="p-8 space-y-5 flex-1 mt-1">
              {report.topThreePriorities?.map((p, i) => (
                <div key={i} className={`p-5 rounded-2xl border transition-all ${i === 0 ? 'bg-slate-900 border-slate-800 text-white shadow-xl scale-[1.02]' : 'bg-slate-50 border-slate-100 text-slate-900 opacity-80'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xl font-black italic ${i === 0 ? 'text-brand-accent' : 'text-slate-300'}`}>{p.rank}.</span>
                    <h5 className="text-[13px] font-black uppercase tracking-tight">{p.task}</h5>
                  </div>
                  <p className={`text-[12px] font-bold leading-relaxed ${i === 0 ? 'text-slate-400' : 'text-slate-500'}`}>{p.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 사장 행동 예측 및 대응 */}
          <div className="lg:col-span-4 bg-white border border-orange-200 rounded-[2rem] shadow-xl shadow-orange-200/20 overflow-hidden flex flex-col border-dashed">
            <div className="bg-orange-50 px-8 py-5 border-b border-orange-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">사장 행동 예측 & 대응 방안</span>
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
            <div className="p-8 space-y-6 flex-1 bg-gradient-to-b from-orange-50/20 to-transparent">
              {report.ownerResistancePrediction && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] font-black uppercase">미룰 가능성 ↑</div>
                    </div>
                    <p className="text-sm font-black text-slate-900 leading-relaxed">
                      "{report.ownerResistancePrediction.prediction}"
                    </p>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                      <span className="text-orange-500 mr-1">●</span> {report.ownerResistancePrediction.reason}
                    </p>
                  </div>
                  <div className="h-px bg-slate-100 w-full" />
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">컨설턴트의 제언</span>
                    <div className="p-5 bg-slate-900 rounded-2xl text-white shadow-lg shadow-blue-900/20 group hover:scale-[1.03] transition-transform">
                       <p className="text-[13px] font-bold italic leading-relaxed">
                         "{report.ownerResistancePrediction.countermeasure}"
                       </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NEW: Persona & AI Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {report.ownerPersona && report.storePersona && (
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/30 flex flex-col">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">사장님 & 매장 페르소나</span>
              </div>
              <div className="p-8 space-y-6 flex-1">
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                     <h4 className="text-[11px] font-black text-slate-400 uppercase">사장님 유형 : <span className="text-slate-900">{report.ownerPersona.type}</span></h4>
                   </div>
                   <p className="text-xs font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                     {report.ownerPersona.description}
                   </p>
                   <div className="text-[10px] font-bold text-brand-accent flex items-start gap-1">
                     <Zap className="w-3 h-3 shrink-0 mt-0.5" />
                     <span>{report.ownerPersona.advice}</span>
                   </div>
                </div>
                <div className="h-px bg-slate-100 w-full" />
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                     <h4 className="text-[11px] font-black text-slate-400 uppercase">매장 정체성 : <span className="text-slate-900">{report.storePersona.type}</span></h4>
                   </div>
                   <p className="text-xs font-bold text-slate-600 leading-relaxed">
                     {report.storePersona.description}
                   </p>
                </div>
              </div>
            </div>
          )}

          {report.aiManagerPoints && (
            <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-10 relative overflow-hidden shadow-2xl flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <MessageSquareQuote className="w-48 h-48 text-white" />
              </div>
              <div className="mb-6">
                <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em]">베테랑 점장의 성장 비밀 노트</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {report.aiManagerPoints.map((point, i) => (
                  <div key={i} className="space-y-3">
                    <h5 className="text-white font-black text-lg flex items-center gap-2">
                      <span className="text-brand-accent italic font-mono text-2xl">#</span> {point.title}
                    </h5>
                    <p className="text-slate-400 text-sm font-bold leading-relaxed whitespace-pre-wrap">
                      "{point.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deep Dive Section: Layered Analysis & Vicious Cycle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Layered Analysis */}
          {report.threeLayerAnalysis && (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/30">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-tight">
                  <Search className="w-4 h-4 text-brand-accent" /> 3단계 심층 인과 관계 분석
                </h3>
                <div className="flex gap-1">
                  {[1, 2, 3].map(n => <div key={n} className={`w-1.5 h-1.5 rounded-full ${n === 3 ? 'bg-brand-accent' : 'bg-slate-200'}`} />)}
                </div>
              </div>
              <div className="p-10 space-y-10 relative">
                <div className="absolute left-[3.25rem] top-12 bottom-12 w-[2px] bg-slate-100" />
                
                {[
                  { title: "Layer 1. 표면적 현상", desc: report.threeLayerAnalysis.surface, color: "slate", icon: Activity },
                  { title: "Layer 2. 직접적인 원인", desc: report.threeLayerAnalysis.direct, color: "blue", icon: Target },
                  { title: "Layer 3. 구조적·근본적 원인", desc: report.threeLayerAnalysis.structural, color: "accent", icon: ShieldCheck }
                ].map((layer, idx) => (
                  <div key={idx} className="flex gap-8 relative group">
                    <div className={`w-10 h-10 rounded-xl ${
                      layer.color === 'slate' ? 'bg-slate-100 text-slate-400' : 
                      layer.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-slate-900 text-brand-accent'
                    } flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110 shadow-sm shadow-black/5`}>
                      <layer.icon className="w-5 h-5" />
                    </div>
                    <div className={idx === 2 ? "bg-slate-900 p-6 rounded-2xl text-white shadow-2xl flex-1 border border-white/5" : "flex-1 pt-1"}>
                      <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${idx === 2 ? 'text-brand-accent' : 'text-slate-400'}`}>{layer.title}</h4>
                      <p className={`text-[15px] leading-relaxed ${idx === 2 ? 'font-bold opacity-95' : 'font-medium text-slate-600'}`}>{layer.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vicious Cycle (Critical Warning) & Hourly Analysis */}
          <div className="space-y-8">
            <div className="bg-red-50/20 border border-red-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-red-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-lg shadow-red-200 relative">
                <TrendingDown className="w-10 h-10 text-red-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-ping" />
              </div>
              <div className="max-w-md relative z-10">
                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">구조적 결함 및 병목 경고</h3>
                <p className="text-2xl font-black text-slate-900 mb-6 leading-tight tracking-tight italic">
                  "{report.viciousCycle}"
                </p>
              </div>
            </div>

            {report.competitorAnalysis && (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/30 overflow-hidden">
                 <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">상권 및 경쟁 분석</span>
                   <Globe className="w-4 h-4 text-blue-500" />
                 </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase mb-1 block">경쟁 강도</span>
                      <div className="text-sm font-black text-slate-900">{report.competitorAnalysis.competitionLevel}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase mb-1 block">시장 포지셔닝</span>
                      <div className="text-sm font-black text-slate-900">{report.competitorAnalysis.marketPosition}</div>
                    </div>
                  </div>
                  <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                    <span className="text-[9px] font-black text-blue-400 uppercase mb-2 block">주변 경쟁점 및 차별화 현황</span>
                    <p className="text-[12px] font-bold text-slate-600 leading-relaxed italic">
                      {report.competitorAnalysis.neighborStatus}
                    </p>
                  </div>
                  
                  {report.competitorAnalysis.detailedComparison && (
                    <CompetitorTable data={report.competitorAnalysis.detailedComparison} />
                  )}
  
                  {report.competitorAnalysis.mysteryShopping && (
                     <MysteryShoppingGrid data={report.competitorAnalysis.mysteryShopping} />
                  )}
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/30 overflow-hidden">
               <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">시간대별 수익 활성화 전략</span>
                 <BarChart3 className="w-4 h-4 text-brand-accent" />
               </div>
               <div className="p-8 space-y-4">
                 {report.hourlyRevenueAnalysis?.map((item, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
                     <div className="w-20 shrink-0">
                       <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{item.timeSlot}</span>
                     </div>
                     <div className="space-y-1.5 flex-1">
                       <div className="text-xs font-black text-slate-800">
                         {item.flow} • <span className="text-brand-accent italic">"{item.consumptionPsychology}"</span>
                       </div>
                       <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                         <span className="text-brand-accent">💡 전략:</span> {item.strategy}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EfficiencyGrid metrics={report.efficiencyMetrics} inventory={report.menuEngineering?.inventoryMix} />
          {report.revenueHeatmap && <RevenueHeatmap data={report.revenueHeatmap} />}
        </div>

        {report.customerLogistics && (
          <ProductivityMetrics data={report.customerLogistics} />
        )}

        {report.strategicRisks && (
          <div>
            <div className="flex items-center gap-3 mb-6">
               <ShieldCheck className="w-4 h-4 text-red-500" />
               <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">전략적 트레이드오프 & 예방책</h3>
            </div>
            <StrategicRisksGrid risks={report.strategicRisks} />
          </div>
        )}

        {/* Financials & Strategy Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* BEP Analysis */}
          {report.bepAnalysis && (
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/30">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-accent" />
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">손익분기점(BEP) 분석</h3>
              </div>
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">고정비 분석</span>
                      <div className="text-2xl font-black text-slate-900 mb-3">{report.bepAnalysis.fixedCostRatio}%</div>
                    </div>
                    {report.financialDetail?.fixedCostBreakdown && (
                      <div className="space-y-1.5">
                        {report.financialDetail.fixedCostBreakdown?.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-slate-400">{item.label}</span>
                            <span className="text-slate-600">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">공헌이익률 (CM Ratio)</span>
                      <div className="text-2xl font-black text-brand-accent mb-3">{report.bepAnalysis.contributionMarginRatio}%</div>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 leading-tight">매출액 대비 고정비를 제외한 실질 이익 기여율입니다. {report.bepAnalysis.contributionMarginRatio > 40 ? '매우 고무적입니다.' : '개선이 필요합니다.'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <h4 className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-2">재무 건전성 진단</h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{report.bepAnalysis.currentStatus}</p>
                  </div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
                      <TrendingUp className="w-24 h-24 text-brand-accent" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.25em] block mb-2">월별 안정권 목표 매출액</span>
                      <p className="text-4xl font-black text-white tracking-tighter">{report.bepAnalysis.targetSales}</p>
                      <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-tight">* 영업이익 극대화를 위한 1차 안정권 매출액입니다.</p>
                    </div>
                  </motion.div>
                  
                  {report.financialDetail?.monthlyTrend && (
                     <MonthlyTrendChart data={report.financialDetail.monthlyTrend} />
                  )}
                  
                  {report.financialDetail?.profitWaterfall && (
                     <WaterfallChart data={report.financialDetail.profitWaterfall} cashFlow={report.financialDetail.cashFlowInsight} />
                  )}

                  {report.financialDetail?.laborDetail && (
                    <LaborDetailTable data={report.financialDetail.laborDetail} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BCG Matrix (Strategy) */}
          {report.menuEngineering && (
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/30">
              <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-brand-accent" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">메뉴 엔지니어링 매트릭스 (BCG)</h3>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth vs Profit Matrix</span>
              </div>
              <div className="p-10">
                <div className="relative">
                  {/* Axis Labels */}
                  <div className="absolute -left-8 top-1/2 -rotate-90 origin-center text-[8px] font-black text-slate-400 uppercase tracking-widest">분석 지표 : 수익성</div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-400 uppercase tracking-widest">분석 지표 : 판매량 및 대중성</div>
                  
                  <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                    {/* Star */}
                    <div className="bg-white p-7 group hover:bg-emerald-50 transition-colors border-b border-r border-slate-100">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shadow-sm">
                          <Star className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-emerald-900 uppercase tracking-tight">인기 메뉴 (STAR)</h5>
                          <span className="text-[10px] text-emerald-600 font-bold tracking-tight">고수익·고판매 메뉴</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {report.menuEngineering.star?.map((m, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white text-[11px] font-black text-emerald-700 rounded-xl border border-emerald-100 shadow-sm group-hover:border-emerald-200 transition-all hover:scale-105">{m}</span>
                        ))}
                      </div>
                    </div>
                    {/* Puzzle */}
                    <div className="bg-white p-7 group hover:bg-purple-50 transition-colors border-b border-slate-100">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm">
                          <Search className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-purple-900 uppercase tracking-tight">잠재 수익 메뉴 (PUZZLE)</h5>
                          <span className="text-[10px] text-purple-600 font-bold tracking-tight">고수익·저판매 메뉴</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {report.menuEngineering.puzzle?.map((m, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white text-[11px] font-black text-purple-700 rounded-xl border border-purple-100 shadow-sm group-hover:border-purple-200 transition-all hover:scale-105">{m}</span>
                        ))}
                      </div>
                    </div>
                    {/* Plowhorse */}
                    <div className="bg-white p-7 group hover:bg-blue-50 transition-colors border-r border-slate-100">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-blue-900 uppercase tracking-tight">박리다매 메뉴 (PLOWHORSE)</h5>
                          <span className="text-[10px] text-blue-600 font-bold tracking-tight">저수익·고판매 메뉴</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {report.menuEngineering.plowhorse?.map((m, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white text-[11px] font-black text-blue-700 rounded-xl border border-blue-100 shadow-sm group-hover:border-blue-200 transition-all hover:scale-105">{m}</span>
                        ))}
                      </div>
                    </div>
                    {/* Dog */}
                    <div className="bg-white p-7 group hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shadow-sm">
                          <Trash2 className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 uppercase tracking-tight">정체 메뉴 (DOG)</h5>
                          <span className="text-[10px] text-slate-500 font-bold tracking-tight">저수익·저판매 메뉴</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {report.menuEngineering.dog?.map((m, i) => (
                          <span key={i} className="px-3 py-1.5 bg-white text-[11px] font-black text-slate-400 rounded-xl border border-slate-100 shadow-sm group-hover:border-slate-200 transition-all hover:scale-105">{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {report.menuEngineering.costBreakdown && (
                    <CostBreakdownTable data={report.menuEngineering.costBreakdown} />
                  )}
                </div>
                <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-4">
                  <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-[12px] font-bold text-slate-500 leading-relaxed italic">
                      "Star 메뉴를 전방 배치하고, Plowhorse는 원가 절감을, Puzzle은 마케팅을 강화하며, Dog는 과감히 리뉴얼하거나 제거가 필요합니다."
                    </p>
                    <div className="p-3 bg-white/50 rounded-lg border border-slate-200/50">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">분류 기준 및 데이터 근거</span>
                      <p className="text-[11px] font-bold text-slate-600 mb-1">{report.menuEngineering.categorizationLogic}</p>
                      <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 font-mono text-[9px] font-black text-brand-accent">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        {report.menuEngineering.dataQualityContext}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Timeline Section */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/30">
          <div className="bg-slate-900 px-10 py-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-black text-white flex items-center gap-3">
              <ClipboardCheck className="w-6 h-6 text-brand-accent" />
              <span>전략적 실행 로드맵 : 24주 프로젝트</span>
            </h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-brand-accent" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">최우선 실행 과제</span>
              </div>
            </div>
          </div>
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              {report.actionChecklist?.map((item, i) => (
                <div key={i} className="flex gap-6 group relative">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-sm font-black text-slate-300 group-hover:border-brand-accent group-hover:text-brand-accent transition-all group-hover:rotate-6 shadow-sm">
                      {i+1}
                    </div>
                    {i % 2 === 0 && <div className="flex-1 w-px bg-slate-100 my-2" />}
                  </div>
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{i+1}단계</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tight ${
                          item.priority === '최우선' ? 'bg-red-500 text-white' : 
                          item.priority === '우선' ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase">
                        <Calendar className="w-3 h-3" /> {item.deadline}
                      </div>
                    </div>
                    <p className="text-[15px] font-black text-slate-800 leading-tight group-hover:text-brand-accent transition-colors">
                      {item.task}
                    </p>
                    <div className="flex gap-4 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Users2 className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase">담당: {item.owner}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3 text-brand-accent" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">KPI: {item.kpi}</span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="text-[11px] font-bold bg-orange-50 text-orange-700 px-3 py-2 rounded-lg border border-orange-100/50 flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 opacity-60" />
                        <span><span className="font-black italic text-[9px] uppercase tracking-tighter mr-1 border-r pr-1">Barrier</span> {item.barrierResponse}</span>
                      </div>
                      <div className="text-[11px] font-bold bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-100/50 flex items-start gap-2">
                        <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5 opacity-60" />
                        <span><span className="font-black italic text-[9px] uppercase tracking-tighter mr-1 border-r pr-1">Risk</span> {item.riskScenario}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Prescription Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
          {/* Solution Cards */}
          {[
            { title: "마케팅 침투 전략", icon: Globe, color: "purple", content: report.marketingStrategy },
            { title: "운영 최적화 설계", icon: Settings2, color: "emerald", list: report.operationTips },
            { title: "베테랑의 마지막 조언", icon: Users2, color: "blue", quote: report.ownerMindsetFeedback }
          ].map((card, i) => (
            <div key={i} className={`bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/30 flex flex-col h-full ${card.quote ? 'bg-slate-900 text-white border-none' : ''}`}>
              <div className={`p-8 border-b ${card.quote ? 'border-white/10' : 'border-slate-100'} flex items-center gap-4`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  card.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  card.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-accent/20 text-brand-accent'
                }`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h4 className="font-black tracking-tight">{card.title}</h4>
              </div>
              <div className="p-8 flex-1">
                {card.content && <p className="text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">{card.content}</p>}
                {card.list && (
                  <ul className="space-y-4">
                    {card.list?.map((tip, idx) => (
                      <li key={idx} className="flex gap-4 items-start group">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 border border-emerald-100 group-hover:scale-110 transition-transform">{idx+1}</div>
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">{tip}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {card.quote && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6">
                    <MessageSquareQuote className="w-12 h-12 text-brand-accent/30 mb-8" />
                    <p className="text-lg font-bold italic leading-relaxed opacity-95">
                      "{card.quote}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final Vision Board */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-brand-accent rounded-[32px] p-12 text-white shadow-2xl shadow-blue-500/40 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 transition-all group-hover:scale-150 duration-1000" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="shrink-0 w-24 h-24 bg-white/10 rounded-[28px] flex items-center justify-center border border-white/25 backdrop-blur-xl shadow-2xl group-hover:rotate-12 transition-transform duration-500">
              <Target className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-6 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-white/10 rounded-full border border-white/20">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-100">미래 달성 지표 : 6개월(180일) 후</span>
              </div>
              <h4 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter italic">
                {report.sixMonthGoalAction}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
                {report.successMetrics?.map((m, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-[9px] font-black text-blue-200/60 uppercase tracking-widest block">{m.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] text-blue-300/50 line-through font-bold">{m.before}</span>
                      <ChevronRight className="w-2.5 h-2.5 text-brand-accent" />
                      <span className="text-xl font-black text-white">{m.after}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-blue-100/70 font-bold max-w-2xl mt-6">이 리포트의 처방을 완수했을 때 맞이하게 될 매장의 모습입니다. 변화는 이미 시작되었습니다.</p>
            </div>
          </div>
        </motion.div>

        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-xl shadow-slate-200/30">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">데이터 출처 및 산출 근거</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {report.citations?.map((cite, i) => (
              <div key={i} className="space-y-1">
                <div className="text-[10px] font-black text-brand-accent uppercase tracking-widest">{cite.source}</div>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{cite.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-16 opacity-40">
          <p className="text-[10px] font-black font-mono uppercase tracking-[0.4em] leading-relaxed">
            AI 장사 비서 • 정밀 진단 시스템 • 대외비 리포트 <br/>
            © 2024 PRECISION DATA LAB. 모든 권리 보유.
          </p>
        </div>
      </main>
    </motion.div>
  );
}
