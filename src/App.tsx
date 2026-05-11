import { useState, useMemo } from "react";
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
    } catch (error) {
      alert("분석 보고서 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
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
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expert Analysis System v2.0</p>
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
                        <><Loader2 className="w-4 h-4 animate-spin" /> 데이터 심층 분석 중...</>
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
            SYSTEM STATUS: READY FOR ANALYSIS
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
            className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white px-8"
          >
            <div className="relative mb-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-24 h-24 border-4 border-slate-700 border-t-brand-accent rounded-full"
              />
              <Activity className="absolute inset-0 m-auto w-10 h-10 text-brand-accent animate-pulse" />
            </div>
            
            <h3 className="text-3xl font-black mb-8 tracking-tight text-center">심층 데이터 엔진 가동 중</h3>
            
            <div className="space-y-4 max-w-lg w-full">
              {[
                "상권 인구 통계 및 경쟁사 밀집도 분석 중...",
                "재무제표 기반 구조적 손익 불균형 감지 중...",
                "운영 방식에 따른 잠재적 리스크 모델링...",
                "베테랑 전문가 로직 기반 맞춤형 처방전 생성..."
              ].map((text, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 1.2 }}
                  className="flex items-center gap-4 text-slate-400 text-[13px] py-4 border-b border-white/5"
                >
                  <div className="w-5 h-5 rounded bg-brand-accent/20 text-brand-accent flex items-center justify-center text-[10px] font-black shrink-0">0{idx+1}</div>
                  <span className="font-medium">{text}</span>
                </motion.div>
              ))}
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
      className="min-h-screen bg-slate-50 flex flex-col pb-20"
    >
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-brand-success" />
            <h1 className="text-xl font-black text-slate-900 tracking-tight">최종 정밀 분석 보고서</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> PDF 출력
            </button>
            <button 
              onClick={onReset}
              className="btn-primary !py-2"
            >
              새 분석 시작
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 mt-12 space-y-8">
        {/* Top Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0" />
          
          <div className="relative z-10 shrink-0 flex flex-col items-center gap-6">
             <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80" cy="80" r="74"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-100"
                />
                <motion.circle
                  cx="80" cy="80" r="74"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="464.95"
                  initial={{ strokeDashoffset: 464.95 }}
                  animate={{ strokeDashoffset: 464.95 - (464.95 * report.overallScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                  className="text-brand-accent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{report.overallScore}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Health Score</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 w-full">
              <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                <ShieldCheck className={`w-5 h-5 ${report.dataFidelity > 80 ? 'text-brand-success' : 'text-orange-500'}`} />
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">진단 신뢰도</div>
                <div className="text-sm font-black text-slate-800">{report.dataFidelity}%</div>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full lg:w-[350px] relative z-10 hidden sm:block">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={report.analysisVectors}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="매장 상태"
                  dataKey="score"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.15}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="relative z-10 flex-1 space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-brand-accent rounded-full text-[11px] font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" /> AI Diagnosis Summary
              </div>
              <div className="relative">
                <Quote className="absolute -top-3 -left-4 w-8 h-8 text-slate-100 -z-10" />
                <p className="text-lg font-black text-brand-accent italic leading-tight mb-2 pl-2">
                  "{report.veteranPunchline}"
                </p>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {report.summary}
            </h2>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <div className="space-y-1">
                <span className="meta-label">핵심 강점</span>
                <div className="flex flex-wrap gap-2">
                  {report.strengths.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-brand-success text-[12px] font-bold rounded-lg border border-green-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <span className="meta-label">경고 리스크</span>
                <div className="flex flex-wrap gap-2">
                  {report.weaknesses.map((w, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-600 text-[12px] font-bold rounded-lg border border-orange-100">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mid-level Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3-Layer Insight */}
          <div className="card h-full">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-accent" /> 3단계 심층 인과 관계 분석
              </h3>
            </div>
            <div className="p-8 space-y-8 relative">
              <div className="absolute left-10 top-12 bottom-12 w-[1px] bg-slate-100" />
              
              <div className="flex gap-6 relative">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Layer 1. 표면적 현상</h4>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{report.threeLayerAnalysis.surface}</p>
                </div>
              </div>

              <div className="flex gap-6 relative">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Layer 2. 직접적인 원인</h4>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{report.threeLayerAnalysis.direct}</p>
                </div>
              </div>

              <div className="flex gap-6 relative">
                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center shrink-0 z-10 shadow-lg shadow-brand-primary/20">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Layer 3. 구조적·근본적 원인</h4>
                  <div className="bg-slate-900 text-white p-4 rounded-xl text-sm leading-relaxed font-medium shadow-xl">
                    {report.threeLayerAnalysis.structural}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vicious Cycle Explanation */}
          <div className="card h-full flex flex-col">
            <div className="bg-red-50/50 px-6 py-4 border-b border-red-100">
              <h3 className="font-bold text-red-900 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" /> 운영상 악순환의 고리
              </h3>
            </div>
            <div className="p-10 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <TrendingDown className="w-10 h-10 text-red-600" />
              </div>
              <div className="max-w-md">
                <p className="text-lg font-bold text-slate-900 mb-4 leading-snug">
                  "{report.viciousCycle}"
                </p>
                <div className="h-px w-20 bg-red-200 mx-auto" />
                <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                  한 문제가 다음 문제를 연鎖적으로 발생시켜 매장 경쟁력을 저하시키고 있습니다. <br/>근본 원인 제거를 통한 선순환 구조로의 전환이 시급합니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BEP Analysis & Menu Strategy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BEP Analysis */}
          <div className="card h-full">
            <div className="bg-slate-100/50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-accent" /> 손익분기점(BEP) 시뮬레이션
              </h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">고정비 비중</span>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-slate-900">{report.bepAnalysis.fixedCostRatio}%</span>
                    <span className="text-[10px] text-slate-400 mb-1.5">(임대료/인건비 등)</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">변동비 비중</span>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-black text-slate-900">{report.bepAnalysis.variableCostRatio}%</span>
                    <span className="text-[10px] text-slate-400 mb-1.5">(식자재/수수료 등)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative pt-6">
                  <div className="absolute top-0 left-0 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Financial Status</div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border-l-4 border-brand-accent">
                    {report.bepAnalysis.currentStatus}
                  </p>
                </div>
                <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-xl shadow-blue-900/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className="w-20 h-20" />
                  </div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] block mb-2">권장 목표 매출 (월)</span>
                    <p className="text-2xl font-black">{report.bepAnalysis.targetSales}</p>
                    <p className="text-[11px] text-blue-300 mt-2 opacity-80">* 이 지점에 도달해야 안정적인 순수익 구조가 형성됩니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Strategy Matrix */}
          <div className="card h-full">
            <div className="bg-slate-100/50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-brand-accent" /> 메뉴 전략 매트릭스 (BCG)
              </h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4">
                {/* Star */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span className="text-[11px] font-black text-emerald-800 uppercase tracking-tighter">STAR: 수익성+회전율</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.menuEngineering.star.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-[11px] font-bold text-emerald-700 rounded border border-emerald-100">{m}</span>
                    ))}
                  </div>
                </div>
                {/* Plowhorse */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px] font-black text-blue-800 uppercase tracking-tighter">Plow: 잘 팔리나 이익 낮음</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.menuEngineering.plowhorse.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-[11px] font-bold text-blue-700 rounded border border-blue-100">{m}</span>
                    ))}
                  </div>
                </div>
                {/* Puzzle */}
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="w-4 h-4 text-purple-600" />
                    <span className="text-[11px] font-black text-purple-800 uppercase tracking-tighter">Puzzle: 이익 높으나 안 팔림</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.menuEngineering.puzzle.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-[11px] font-bold text-purple-700 rounded border border-purple-100">{m}</span>
                    ))}
                  </div>
                </div>
                {/* Dog */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">Dog: 전략적 제외/개편</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.menuEngineering.dog.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-[11px] font-bold text-slate-500 rounded border border-slate-100">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-6 text-[11px] text-slate-400 italic leading-relaxed">
                전문가 TIP: 'Star' 메뉴를 전방 배치하고, 'Plowhorse'는 원가 절감을, 'Puzzle'은 마케팅을 강화하며, 'Dog'는 과감히 리뉴얼하거나 제거해야 합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Action Checklist */}
        <div className="card">
          <div className="bg-slate-900 px-8 py-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-brand-accent" /> 전문가 처방: 단계별 실행 체크리스트
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority Action Items</span>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {report.actionChecklist.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200">
                  <div className="w-6 h-6 rounded border-2 border-slate-200 shrink-0 mt-0.5 group-hover:border-brand-accent transition-colors flex items-center justify-center text-[10px] font-black text-slate-300 group-hover:text-brand-accent">
                    {i+1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-slate-900">{item.task}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                      <Calendar className="w-3 h-3" /> 권장 기한: {item.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Solutions Tab-like Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Marketing Solution */}
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-extrabold text-slate-900">맞춤형 마케팅 솔루션</h4>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{report.marketingStrategy}</p>
            </div>
          </div>

          {/* Operational Efficiency */}
          <div className="card">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Settings2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-extrabold text-slate-900">운영 효율화 처방</h4>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {report.operationTips.map((tip, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i+1}</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Owner Feedback */}
          <div className="card bg-brand-primary text-white">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Users2 className="w-5 h-5 text-brand-accent" />
              </div>
              <h4 className="font-extrabold">전문가 조언</h4>
            </div>
            <div className="p-10 text-center flex flex-col items-center">
              <MessageSquareQuote className="w-8 h-8 text-brand-accent/40 mb-6" />
              <p className="text-base font-medium italic leading-relaxed opacity-90">
                "{report.ownerMindsetFeedback}"
              </p>
            </div>
          </div>
        </div>

        {/* Success Roadmap / 6 Month Goal */}
        <div className="bg-brand-accent rounded-2xl p-10 text-white shadow-2xl shadow-blue-600/20">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="shrink-0 w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-md">
              <Target className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/70">6-Month Strategic Roadmap</span>
              <h4 className="text-2xl font-black leading-tight italic">
                {report.sixMonthGoalAction}
              </h4>
            </div>
          </div>
        </div>

        <div className="text-center py-12 border-t border-slate-200">
          <p className="text-[11px] text-slate-400 font-mono uppercase tracking-widest leading-relaxed">
            이 리포트는 55가지 고유 지표를 기반으로 한 AI 전문가 시스템의 분석 결과입니다. <br/>
            모든 분석 자료는 실제 현장 상황에 맞춰 유동적으로 적용하시기 바랍니다.
          </p>
        </div>
      </main>
    </motion.div>
  );
}
