export enum DiagnosisSection {
  BASIC_INFO = "SECTION 1. 매장 기본 정보",
  SALES_PROFIT = "SECTION 2. 매출 & 수익 현황",
  MENU_PRODUCT = "SECTION 3. 메뉴 & 판매 구성",
  CUSTOMER_DATA = "SECTION 4. 고객 흐름 & 단골 현황",
  COMPETITION = "SECTION 5. 주변 상권 & 경쟁 매장",
  MARKETING = "SECTION 6. 홍보 & 온라인 반응",
  OPERATIONS = "SECTION 7. 매장 운영 상태",
  OWNER_MINDSET = "SECTION 8. 사장님의 목표 & 운영 방향",
}

export interface DiagnosisItem {
  id: number;
  section: DiagnosisSection;
  label: string;
  description?: string;
  isMustFill?: boolean;
  type: "text" | "number" | "select" | "percentage" | "date" | "textarea";
  options?: string[];
  placeholder?: string;
}

export interface DiagnosisData {
  [key: number]: string;
}

export interface DiagnosisReport {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  threeLayerAnalysis: {
    surface: string; // 표면 증상
    direct: string; // 직접 원인
    structural: string; // 구조적 원인
  };
  viciousCycle: string; // 악순환 고리 설명
  riskPriorities: {
    priority: "High" | "Medium" | "Low";
    issue: string;
    action: string;
  }[];
  marketingStrategy: string;
  operationTips: string[];
  ownerMindsetFeedback: string;
  sixMonthGoalAction: string;
  bepAnalysis: {
    currentStatus: string;
    targetSales: string;
    fixedCostRatio: number;
    variableCostRatio: number;
  };
  menuEngineering: {
    star: string[];     // 인지도 높고 수익성 높음
    plowhorse: string[]; // 인지도 높으나 수익성 낮음
    puzzle: string[];    // 인지도 낮으나 수익성 높음
    dog: string[];       // 인지도 낮고 수익성 낮음
  };
  actionChecklist: {
    task: string;
    deadline: string;
  }[];
  analysisVectors: {
    subject: string;
    score: number;
    fullMark: number;
  }[];
  dataFidelity: number; // 0-100
  veteranPunchline: string; // 촌철살인 한마디
}
