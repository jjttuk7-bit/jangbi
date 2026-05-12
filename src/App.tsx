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
  Quote
} from "lucide-react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer 
} from "recharts";
import { DIAGNOSIS_ITEMS } from "./constants";
import { DiagnosisSection, DiagnosisData, DiagnosisReport } from "./types";
import { generateDiagnosis } from "./services/geminiService";

export default function App() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [data, setData] = useState<DiagnosisData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

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
    return DIAGNOSIS_ITEMS.filter(item => item.section === currentSection);
  }, [currentSection]);

  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  const handleInputChange = (id: number, value: string) => {
    setData(prev => ({ ...prev, [id]: value }));
  };

  const fillMockData = () => {
    const mockData: DiagnosisData = {
      1: "외식업 > 카페 > 스페셜티 커피 및 디저트",
      2: "2023-05-15",
      3: "오피스",
      4: "15평, 좌석 20석",
      5: "사장 외 알바 2명",
      7: "18000000",
      9: "2200",
      10: "8200",
      14: "3500000",
      15: "28",
      21: "시그니처 아인슈페너, 에그타르트, 아이스 아메리카노",
      29: "점심시간 인근 직장인 워크인 70%, 인스타그램 검색 20%",
      35: "매일 아침 직접 굽는 타르트와 자체 로스팅 원두",
      52: "점심 피크(12-14시)에 매출의 60%가 쏠리며, 오후 시간대 낮은 객단가와 긴 체류시간으로 인해 회전율 및 전체 수익성 저하",
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
          
          <div className="hidden md:flex flex-col items-end gap-1.5 w-64">
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
      </header>

      <main className="max-w-6xl mx-auto px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0 space-y-2 hidden lg:block">
            <div className="mb-6">
              <span className="meta-label">분석 단계</span>
            </div>
            {sections.map((section, idx) => (
              <button
                key={section}
                onClick={() => setCurrentSectionIndex(idx)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center justify-between group ${
                  idx === currentSectionIndex 
                    ? "bg-brand-primary text-white font-bold shadow-md" 
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className="truncate">{section.replace("SECTION ", "")}</span>
                {idx === currentSectionIndex && <ChevronRight className="w-4 h-4" />}
                {idx < currentSectionIndex && <CheckCircle2 className="w-4 h-4 text-brand-success" />}
              </button>
            ))}
          </aside>

          {/* Form Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="section-title mb-2">{currentSection}</h2>
                  <p className="text-slate-500 text-sm">해당 섹션의 질문에 답변하여 정밀한 분석 리포트를 받으세요.</p>
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
                  <h3 className="text-3xl font-black text-brand-accent italic leading-[1.1] mb-6 tracking-tight">
                    "{report.veteranPunchline}"
                  </h3>
                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-lg font-bold text-slate-700 leading-relaxed max-w-3xl">
                      {report.summary}
                    </p>
                  </div>
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
                    {report.strengths.map((s, i) => (
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
                    {report.weaknesses.map((w, i) => (
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
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">매장 건강 지수</span>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
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
                {report.analysisVectors.map((v, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-brand-accent transition-colors">{v.subject}</span>
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

        {/* Deep Dive Section: Layered Analysis & Vicious Cycle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Layered Analysis */}
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

          {/* Vicious Cycle (Critical Warning) */}
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
              <div className="h-0.5 w-16 bg-red-200 mx-auto mb-6" />
              <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-sm mx-auto">
                이 악순환의 고리를 끊지 못하면, 장기적으로 운영 효율이 하락하고 고정비 부담이 임계치를 넘게 됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Financials & Strategy Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* BEP Analysis */}
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
                  <div className="space-y-1.5">
                    {report.financialDetail.fixedCostBreakdown.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-slate-600">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">변동비 분석</span>
                    <div className="text-2xl font-black text-slate-900 mb-3">{report.bepAnalysis.variableCostRatio}%</div>
                  </div>
                  <div className="space-y-1.5">
                    {report.financialDetail.variableCostBreakdown.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-slate-600">{item.value}</span>
                      </div>
                    ))}
                  </div>
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
                    <p className="text-[10px] text-slate-500 mt-4 font-bold">* 영업이익 극대화를 위한 1차 안정권 매출액입니다.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* BCG Matrix (Strategy) */}
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
                      {report.menuEngineering.star.map((m, i) => (
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
                      {report.menuEngineering.puzzle.map((m, i) => (
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
                      {report.menuEngineering.plowhorse.map((m, i) => (
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
                      {report.menuEngineering.dog.map((m, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white text-[11px] font-black text-slate-400 rounded-xl border border-slate-100 shadow-sm group-hover:border-slate-200 transition-all hover:scale-105">{m}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-4">
                <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[12px] font-bold text-slate-500 leading-relaxed italic">
                  "Star 메뉴를 전방 배치하고, Plowhorse는 원가 절감을, Puzzle은 마케팅을 강화하며, Dog는 과감히 리뉴얼하거나 제거가 필요합니다."
                </p>
              </div>
            </div>
          </div>
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
              {report.actionChecklist.map((item, i) => (
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
                    {card.list.map((tip, idx) => (
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
                {report.successMetrics.map((m, i) => (
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
