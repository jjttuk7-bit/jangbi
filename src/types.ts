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
    contributionMarginRatio: number; // 공헌이익률 추가
  };
  menuEngineering: {
    star: string[];     
    plowhorse: string[]; 
    puzzle: string[];    
    dog: string[];       
    categorizationLogic: string; 
    dataQualityContext: string; 
    inventoryMix: { category: string; ratio: number; insight: string }[]; 
    costBreakdown: { menuName: string; rawMaterialRatio: number; laborRatio: number; netProfitRatio: number }[]; // 메뉴별 원가 분해표
  };
  efficiencyMetrics: {
    label: string;
    value: string;
    insight: string;
  }[]; 
  revenueHeatmap: { timeSlot: string; weekdaySales: string; weekendSales: string; laborCost: string }[]; // 요일별 매출 히트맵
  customerLogistics: {
    retentionRate: string;
    tablesPerStaff: string;
    processingTime: string;
    insight: string;
  }; // 고객 및 직원 생산성 지표
  competitorAnalysis: {
    competitionLevel: string;
    marketPosition: string;
    neighborStatus: string;
    detailedComparison: { factor: string; myStore: string; competitor: string }[]; 
    mysteryShopping: { storeName: string; strength: string; weakness: string; priceLevel: string; rotationRate: string }[]; // 경쟁사 미스터리 쇼핑
  };
  citations: {
    source: string;
    description: string;
  }[];
  actionChecklist: {
    task: string;
    deadline: string;
    priority: "최우선" | "우선" | "보통";
    owner: string; 
    kpi: string; 
    barrierResponse: string; 
    riskScenario: string; // 역방향 시나리오 (실패 시 대응)
  }[];
  analysisVectors: {
    subject: string;
    score: number;
    fullMark: number;
    insight: string; 
    weight: number; 
  }[];
  financialDetail: {
    fixedCostBreakdown: { label: string; value: string }[];
    variableCostBreakdown: { label: string; value: string }[];
    profitWaterfall: { label: string; value: string; type: "plus" | "minus" | "total" }[];
    cashFlowInsight: string; 
    laborDetail: { category: string; amount: string; description: string }[]; 
    monthlyTrend: { month: string; sales: string; profit: string }[]; // 월별 손익 추이
  };
  strategicRisks: {
    risk: string;
    impact: string;
    prevention: string;
  }[]; // 전략적 역방향 리스크
  successMetrics: {
    label: string;
    before: string;
    after: string;
  }[];
  scoreInterpretation: {
    label: string;
    description: string;
    calculationLogic: string; 
    calculationDetail: string; // 세분화된 산출 근거 (각 항목 점수 등)
  };
  ownerPersona: {
    type: string;
    description: string;
    advice: string;
  };
  storePersona: {
    type: string;
    description: string;
  };
  aiManagerPoints: {
    title: string;
    comment: string;
  }[];
  hourlyRevenueAnalysis: {
    timeSlot: string;
    flow: string;
    consumptionPsychology: string;
    strategy: string;
  }[];
  coreStrategy: string; // [이번 매장의 핵심 해법 1줄]
  monetaryEffect: {
    action: string;
    expectedGain: string;
  }[]; // [돈으로 번역되는 효과]
  topThreePriorities: {
    rank: number;
    task: string;
    reason: string;
  }[]; // [실행 순서 3단 압축]
  ownerResistancePrediction: {
    prediction: string;
    reason: string;
    countermeasure: string;
  }; // [사장 행동 예측 & 대응 방안]
  dataFidelity: number; // 0-100
}
