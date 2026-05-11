export enum DiagnosisSection {
  BASIC_INFO = "SECTION 1. 기본 신상 정보",
  SALES_PROFIT = "SECTION 2. 매출 & 수익 데이터",
  MENU_PRODUCT = "SECTION 3. 메뉴 & 상품 구성",
  CUSTOMER_DATA = "SECTION 4. 고객 데이터",
  COMPETITION = "SECTION 5. 경쟁 환경",
  MARKETING = "SECTION 6. 마케팅 & 온라인 존재감",
  OPERATIONS = "SECTION 7. 운영 & 내부 역량",
  OWNER_MINDSET = "SECTION 8. 사장의 목표 & 심리 상태",
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
