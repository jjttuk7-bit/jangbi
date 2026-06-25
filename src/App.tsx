import { useState, useMemo, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardCheck,
  Crown,
  Megaphone,
  Clapperboard,
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
import { runDummyEngine } from "./services/teamSophia/dummyEngine";
import { runLlmEngine } from "./services/teamSophia/llmEngine";
import { sendTeamSophiaToSlack } from "./services/teamSophia/slackClient";
import { TeamSophiaEngineResult } from "./services/teamSophia/types";
import { ConsultingReport } from "./components/ConsultingReport";

export default function App() {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [data, setData] = useState<DiagnosisData>(() => {
    const saved = localStorage.getItem("diagnosis_data");
    return saved ? JSON.parse(saved) : {};
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [teamSophia, setTeamSophia] = useState<TeamSophiaEngineResult | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);
  const [showMustFillOnly, setShowMustFillOnly] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportMarkdown, setReportMarkdown] = useState("");
  const [reportPath, setReportPath] = useState("");

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
      // SECTION 1. 매장 기본 정보
      1: "외식업 > 한식 > 고기구이 전문점",
      2: "2022-11-20",
      3: "주거지 밀집",
      4: "40평, 좌석 80석 (테이블 20개)",
      5: "사장 1명, 정직원 2명, 알바 4명",
      6: "매일 11:30~익일 01:00 영업 / 매주 월요일 정기 휴무 / 주말·공휴일 정상 영업",

      // SECTION 2. 매출 & 수익 현황
      7: "65000000",
      8: "카드 88% / 현금 7% / 네이버페이·간편결제 5%",
      9: "1800",
      10: "36000",
      11: "저녁 피크(18:00~22:00) 75% 집중 / 점심(11:30~14:00) 15% / 나머지 시간대 10%",
      12: "주말(금~일) 3일이 전체 매출의 약 62% 차지 / 평일 대비 주말 일매출 약 2.3배",
      13: "2.1",
      14: "5500000",
      15: "38",
      16: "13500000",
      17: "수도광열비 80만원 / 카드수수료 약 50만원 / 소모품·포장재 30만원 / 기타잡비 20만원 (총 약 180만원)",
      18: "4500000",

      // SECTION 3. 메뉴 & 판매 구성
      19: "숙성 통삼겹살 1인(200g) 18,000원 / 소생갈비 1인(200g) 22,000원 / 한우 육회 소 28,000원·대 48,000원 / 시골 된장찌개 5,000원 / 냉면 7,000원 / 소주 5,000원 / 맥주 5,000원 / 막걸리 6,000원 / 공깃밥 1,000원",
      20: "숙성 통삼겹살 (336시간 웻에이징 숙성, 매장 핵심 정체성 메뉴)",
      21: "1위 숙성 통삼겹살 / 2위 소생갈비 / 3위 한우 육회",
      22: "소생갈비 (추정 마진율 약 55~58%, 테이블당 1인분 이상 추가 주문율 높음)",
      23: "냉면, 된장찌개 (전체 주문의 5% 미만, 식재료 손실 및 주방 동선 혼란 유발)",
      24: "2023년 6월 한우 육회 신규 출시 / 2024년 2월 삼겹살 1,000원 인상 / 2024년 4월 저수익 메뉴 2종 폐기",
      25: "식재료 원가율 35~40% 유지를 목표로 설정 후, 인근 경쟁점 가격 비교하여 최종 확정",

      // SECTION 4. 고객 흐름 & 단골 현황
      26: "30~40대 남성 45% / 30~40대 여성 35% / 20대 커플·친구 모임 20%",
      27: "가족 외식·지인 모임 45% / 인근 아파트 단골 35% / 직장 회식 20%",
      28: "40",
      29: "네이버 플레이스 예약 40% / 인근 아파트 주민·로컬 단골 40% / 블로그·SNS 리뷰 유입 20%",
      30: "주차 공간 부족 불만 다수 / 피크타임 서비스 응대 속도 지연 / 가끔 고기 굽기 타이밍 안내 부족 지적",
      31: "고기 품질 및 숙성도 극찬 리뷰 집중 / 소생갈비 단독 목적 재방문 고객 존재 / 참숯 향 및 불 조절 서비스 호평",

      // SECTION 5. 주변 상권 & 경쟁 매장
      32: "반경 500m 내 대형 고기구이 전문점 2곳(좌석 120석 이상, 주차 10대) / 프랜차이즈 삼겹살 브랜드 1곳(배달 강세, 런치세트 운영) / 일반 한식당 4곳",
      33: "비슷함",
      34: "대형 경쟁점: 넓은 주차 공간과 단체석 보유로 회식 수요 흡수 / 프랜차이즈점: 점심 세트 메뉴와 배달 서비스로 평일 고객 선점",
      35: "336시간 웻에이징 숙성법과 최고급 참숯 직화 / 5년 숙성 천일염 사용 / 사장 직접 매일 고기 손질 (공장식 전처리 없음)",
      36: "최근 6개월 소규모 식당 3곳 폐업 / 인근 아파트 신규 입주 단지 600세대 2024년 하반기 예정으로 잠재 수요 증가 기대",

      // SECTION 6. 홍보 & 온라인 반응
      37: "네이버 플레이스 리뷰 386개·평점 4.6 / 사진 230장 등록 / 예약 시스템 연동 / 월 1~2회 사장 답글 작성 중",
      38: "구글 리뷰 52개·평점 4.4 / 인스타그램 팔로워 1,240명 / 블로그 체험단 연 4회 진행",
      39: "배달 플랫폼 미입점 (홀 영업 전문, 고기 품질 유지 어려움 판단으로 의도적 미운영)",
      40: "인스타그램 자체 운영(팔로워 1,240명) 주 1~2회 업로드 / 네이버 블로그 비정기 운영",
      41: "월 1회 블로그 체험단 운영(비용 약 15만원) / 인스타그램 유료 광고 미운영 / 네이버 플레이스 예약 프로모션 간헐적 진행",
      42: "150000",
      43: "네이버 플레이스 예약 고객 음료 쿠폰 제공 / 단골 고객 비공식 소주 서비스 / 별도 앱·포인트 제도 없음",

      // SECTION 7. 매장 운영 상태
      44: "12",
      45: "정직원 평균 근속 14개월 / 알바 연 이직률 약 200% (업계 평균 수준) / 채용 시 숙련도 편차 큼",
      46: "경험적 관리",
      47: "POS 시스템(이카운트) 사용 중 / 테이블오더 미도입 / 재고 관리 수기 장부 / 매출 데이터 분석은 주 1회 수작업",
      48: "육류 납품업체 2곳 주 2회 발주 / 채소류 재래시장 직매입 주 3회 / 단가 협상 여지 있으나 장기 계약 미체결",
      49: "별도 위생·서비스 매뉴얼 없음 / 구두 전달 방식 / 주방 위생 점검 비정기적 / 신규 알바 적응 기간 평균 2~3주 소요",
      50: "피크타임 주문 폭주로 인한 서비스 지연 / 주방-홀 소통 오류로 오주문 발생 주 1~2건 / 고기 재고 수요 예측 어려움",

      // SECTION 8. 사장님의 목표 & 운영 방향
      51: "20년 직장 생활 후 '재료에 타협 없는 진짜 고기집' 창업 / 경영 철학: 손님이 남기지 않는 고기, 오면 또 오고 싶은 집",
      52: "원재료값·인건비 상승으로 순이익률 정체 / 주말 편중 매출 구조로 평일 유휴 인력·고정비 비효율 발생 / 단골 유지 외 신규 고객 유입 채널 부재",
      53: "6개월 내 월 순이익 700만원 이상 달성 / 평일 매출 현재 대비 30% 증대 / 네이버 플레이스 리뷰 500개·평점 4.7 달성",
      54: "추가 투자 가능 금액 약 500만원 이내 / 대표 본인 시간 투자 가능 / 인력 추가 채용 여력 없음",
      55: "주 2~3시간 (영업 마감 후 새벽 시간 활용 가능)",
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

  /** 장사비서 폼 입력값(data) 전체를 Team Sophia Pro API가 기대하는 한글 key의 JSON으로 변환한다. */
  const buildTeamSophiaProPayload = () => {
    const payload: Record<string, string | number> = {};
    DIAGNOSIS_ITEMS.forEach((item) => {
      const raw = data[item.id];
      if (item.type === "number" || item.type === "percentage") {
        payload[item.label] = raw == null || raw === "" ? 0 : Number(raw);
      } else {
        payload[item.label] = raw ?? "";
      }
    });
    payload["매장명"] = (data[1] ? String(data[1]) : "") || "사장님 매장";
    payload["기초 분석"] = report?.summary ?? "";
    return payload;
  };

  const handleSubmit = async () => {
    // Check must-fill items
    const missingMustFill = DIAGNOSIS_ITEMS.filter(item => item.isMustFill && !data[item.id]);
    if (missingMustFill.length > 0) {
      alert(`필수 항목을 입력해주세요: ${missingMustFill.map(i => i.label).join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setReportMarkdown("");
    setReportPath("");
    try {
      const payload = buildTeamSophiaProPayload();
      const response = await fetch("/api/team-sophia-pro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || "Team Sophia 정밀 진단 생성 실패");
      }

      setReportMarkdown(result.report_markdown || "");
      setReportPath(result.report_path || "");
    } catch (error: any) {
      console.error("Team Sophia Pro API Error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "진단 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
      );

      // 기존 로컬 분석(폴백): Pro API 연결이 안 될 때만 보조적으로 시도한다.
      try {
        const localResult = await generateDiagnosis(data);
        setReport(localResult);
        try {
          let ts;
          try {
            ts = await runLlmEngine({ diagnosis: data });
          } catch (llmError) {
            console.warn("팀소피아 LLM 엔진 실패, 더미 엔진으로 폴백:", llmError);
            ts = await runDummyEngine({ diagnosis: data });
          }
          setTeamSophia(ts);
          sendTeamSophiaToSlack(ts.slack)
            .then((r) => {
              if (!r.ok) console.warn("Slack 전송 실패:", r.error ?? r.results);
            })
            .catch((e) => console.warn("Slack 전송 예외:", e));
        } catch (tsError) {
          console.error("Team Sophia Engine Error:", tsError);
          setTeamSophia(null);
        }
      } catch (localError) {
        console.error("로컬 분석 폴백도 실패:", localError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setReport(null);
    setTeamSophia(null);
    setReportMarkdown("");
    setReportPath("");
    setErrorMessage("");
    setCurrentSectionIndex(0);
    setData({});
    localStorage.removeItem("diagnosis_data");
  };

  if (reportMarkdown) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-slate-50">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-10 space-y-6">
          <div className="flex items-center gap-3 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-xl font-black text-slate-900">Team Sophia 정밀 진단이 완료되었습니다.</h2>
          </div>
          {reportPath && (
            <p className="text-xs font-mono text-slate-400 break-all">저장 경로: {reportPath}</p>
          )}
          <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-6 border border-slate-100 max-h-[70vh] overflow-y-auto">
            {reportMarkdown}
          </pre>
          <button onClick={reset} className="btn-primary">처음으로</button>
        </div>
      </div>
    );
  }

  if (report) {
    return <ConsultingReport report={report} teamSophia={teamSophia} diagnosisData={data} onReset={reset} />;
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
                {showMustFillOnly ? "현황 파악을 위한 빠른 진단 모드" : "정밀 컨설팅을 위한 전체 진단 모드"}
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
        {errorMessage && (
          <div className="mb-8 flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-5 py-4 text-sm font-bold">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>진단 생성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요. ({errorMessage})</span>
          </div>
        )}
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
                <p className="text-brand-accent text-xs font-black uppercase tracking-widest">
                  Team Sophia가 정밀 진단 리포트를 생성 중입니다...
                </p>
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
