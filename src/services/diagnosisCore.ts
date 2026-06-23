// 장사비서 진단 코어 (서버 전용)
//
// 이 모듈은 OpenAI를 직접 호출하므로 서버리스 함수(api/diagnosis.ts)에서만 import 한다.
// 브라우저는 src/services/geminiService.ts(얇은 클라이언트)를 통해 /api/diagnosis 로 요청한다.
// → OpenAI 키가 클라이언트 번들에 포함되지 않는다.

import OpenAI from "openai";
import { DiagnosisData, DiagnosisReport } from "../types";
import { DIAGNOSIS_ITEMS } from "../constants";

function getAI(apiKey: string | undefined) {
  if (!apiKey) {
    throw new Error("장사 비서 지능 엔진을 가동하기 위한 API Key가 설정되지 않았습니다. 관리자에게 문의하세요.");
  }
  return new OpenAI({ apiKey });
}

function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val == null) return [];
  return [val] as T[];
}

function toNum(val: unknown, fallback = 0): number {
  if (typeof val === "string") val = val.replace(/%/g, "").trim();
  const n = Number(val);
  return isNaN(n) ? fallback : n;
}

function toStr(val: unknown): string {
  if (typeof val === "string") return val;
  if (val == null) return "";
  if (typeof val === "object")
    return Object.values(val as object)
      .filter((v) => typeof v === "string")
      .join(" / ") || JSON.stringify(val);
  return String(val);
}

function normalizeReport(r: any): any {
  if (!r) return r;

  // 최상위 문자열 필드
  r.summary = toStr(r.summary);
  r.viciousCycle = toStr(r.viciousCycle);
  r.marketingStrategy = toStr(r.marketingStrategy);
  r.ownerMindsetFeedback = toStr(r.ownerMindsetFeedback);
  r.sixMonthGoalAction = toStr(r.sixMonthGoalAction);
  r.coreStrategy = toStr(r.coreStrategy);

  // 중첩 객체 문자열 필드
  if (r.scoreInterpretation) {
    r.scoreInterpretation.label = toStr(r.scoreInterpretation.label);
    r.scoreInterpretation.description = toStr(r.scoreInterpretation.description);
    r.scoreInterpretation.calculationLogic = toStr(r.scoreInterpretation.calculationLogic);
    r.scoreInterpretation.calculationDetail = toStr(r.scoreInterpretation.calculationDetail);
  }
  if (r.ownerPersona) {
    r.ownerPersona.type = toStr(r.ownerPersona.type);
    r.ownerPersona.description = toStr(r.ownerPersona.description);
    r.ownerPersona.advice = toStr(r.ownerPersona.advice);
  }
  if (r.storePersona) {
    r.storePersona.type = toStr(r.storePersona.type);
    r.storePersona.description = toStr(r.storePersona.description);
  }
  if (r.threeLayerAnalysis) {
    r.threeLayerAnalysis.surface = toStr(r.threeLayerAnalysis.surface);
    r.threeLayerAnalysis.direct = toStr(r.threeLayerAnalysis.direct);
    r.threeLayerAnalysis.structural = toStr(r.threeLayerAnalysis.structural);
  }
  if (r.ownerResistancePrediction) {
    r.ownerResistancePrediction.prediction = toStr(r.ownerResistancePrediction.prediction);
    r.ownerResistancePrediction.reason = toStr(r.ownerResistancePrediction.reason);
    r.ownerResistancePrediction.countermeasure = toStr(r.ownerResistancePrediction.countermeasure);
  }
  if (r.bepAnalysis) {
    r.bepAnalysis.currentStatus = toStr(r.bepAnalysis.currentStatus);
    r.bepAnalysis.targetSales = toStr(r.bepAnalysis.targetSales);
  }
  if (r.competitorAnalysis) {
    r.competitorAnalysis.competitionLevel = toStr(r.competitorAnalysis.competitionLevel);
    r.competitorAnalysis.marketPosition = toStr(r.competitorAnalysis.marketPosition);
    r.competitorAnalysis.neighborStatus = toStr(r.competitorAnalysis.neighborStatus);
  }
  if (r.customerLogistics) {
    r.customerLogistics.retentionRate = toStr(r.customerLogistics.retentionRate);
    r.customerLogistics.tablesPerStaff = toStr(r.customerLogistics.tablesPerStaff);
    r.customerLogistics.processingTime = toStr(r.customerLogistics.processingTime);
    r.customerLogistics.insight = toStr(r.customerLogistics.insight);
  }
  if (r.menuEngineering) {
    r.menuEngineering.categorizationLogic = toStr(r.menuEngineering.categorizationLogic);
    r.menuEngineering.dataQualityContext = toStr(r.menuEngineering.dataQualityContext);
  }

  r.strengths = toArray(r.strengths);
  r.weaknesses = toArray(r.weaknesses);
  r.riskPriorities = toArray(r.riskPriorities);
  r.operationTips = toArray(r.operationTips);
  r.aiManagerPoints = toArray(r.aiManagerPoints);
  r.hourlyRevenueAnalysis = toArray(r.hourlyRevenueAnalysis);
  r.monetaryEffect = toArray(r.monetaryEffect);
  r.topThreePriorities = toArray(r.topThreePriorities);
  r.citations = toArray(r.citations);
  r.actionChecklist = toArray(r.actionChecklist);
  r.analysisVectors = toArray(r.analysisVectors).map((v: any) => ({
    ...v,
    subject: toStr(v?.subject),
    insight: toStr(v?.insight),
    score: toNum(v?.score),
    fullMark: toNum(v?.fullMark, 100),
    weight: toNum(v?.weight),
  }));
  r.strategicRisks = toArray(r.strategicRisks);
  r.successMetrics = toArray(r.successMetrics);
  r.efficiencyMetrics = toArray(r.efficiencyMetrics);
  r.revenueHeatmap = toArray(r.revenueHeatmap).map((v: any) => ({
    ...v,
    timeSlot: toStr(v?.timeSlot),
    weekdaySales: toStr(v?.weekdaySales),
    weekendSales: toStr(v?.weekendSales),
    laborCost: toStr(v?.laborCost),
  }));
  r.dataFidelity = toNum(r.dataFidelity);
  r.overallScore = toNum(r.overallScore);

  if (r.bepAnalysis) {
    r.bepAnalysis.fixedCostRatio = toNum(r.bepAnalysis.fixedCostRatio);
    r.bepAnalysis.variableCostRatio = toNum(r.bepAnalysis.variableCostRatio);
    r.bepAnalysis.contributionMarginRatio = toNum(r.bepAnalysis.contributionMarginRatio);
  }

  if (r.menuEngineering) {
    r.menuEngineering.star = toArray(r.menuEngineering.star);
    r.menuEngineering.plowhorse = toArray(r.menuEngineering.plowhorse);
    r.menuEngineering.puzzle = toArray(r.menuEngineering.puzzle);
    r.menuEngineering.dog = toArray(r.menuEngineering.dog);
    r.menuEngineering.inventoryMix = toArray(r.menuEngineering.inventoryMix).map((v: any) => ({
      ...v,
      ratio: toNum(v?.ratio),
    }));
    r.menuEngineering.costBreakdown = toArray(r.menuEngineering.costBreakdown).map((v: any) => ({
      ...v,
      rawMaterialRatio: toNum(v?.rawMaterialRatio),
      laborRatio: toNum(v?.laborRatio),
      netProfitRatio: toNum(v?.netProfitRatio),
    }));
  }

  if (r.financialDetail) {
    r.financialDetail.fixedCostBreakdown = toArray(r.financialDetail.fixedCostBreakdown);
    r.financialDetail.variableCostBreakdown = toArray(r.financialDetail.variableCostBreakdown);
    r.financialDetail.profitWaterfall = toArray(r.financialDetail.profitWaterfall);
    r.financialDetail.laborDetail = toArray(r.financialDetail.laborDetail);
    r.financialDetail.monthlyTrend = toArray(r.financialDetail.monthlyTrend);
  }

  if (r.competitorAnalysis) {
    r.competitorAnalysis.detailedComparison = toArray(r.competitorAnalysis.detailedComparison);
    r.competitorAnalysis.mysteryShopping = toArray(r.competitorAnalysis.mysteryShopping);
  }

  return r;
}

export async function generateDiagnosisReport(
  data: DiagnosisData,
  apiKey: string | undefined
): Promise<DiagnosisReport> {
  const ai = getAI(apiKey);
  const dataSummary = DIAGNOSIS_ITEMS.map((item) => {
    const value = data[item.id] || "데이터 없음";
    return `${item.id}. ${item.label}: ${value}`;
  }).join("\n");

  const systemInstruction = `
당신은 30년 경력의 '장사의 신'이자 대한민국 최고의 외식업 컨설턴트입니다. 당신의 분석은 단순한 데이터 나열이 아니라, 사장님의 마음을 어루만지면서도 사업의 급소를 정확히 찌르는 '냉철한 처방전'이어야 합니다.

분석 시 다음 '베테랑 장사 지능의 고도화 원칙'을 반드시 준수하세요:

1. 숫자의 신뢰도 확보 (citations & scoreInterpretation):
   - 모든 수치(원가율, 가중치 등)에는 반드시 근거가 있어야 합니다. 공식 출처는 기관명을, 자체 기준은 "유사 상권 고기구이 전문점 벤치마크 적용" 등으로 명시하십시오.
   - 전체 점수(매장 건강 지수)는 어떤 가중치 공식으로 산출되었는지 calculationLogic에 상세히 기록하고, 실제 산입된 가중치를 명시하십시오.

2. 수익 산출의 투명성과 현금흐름 (financialDetail):
   - 순이익 산출 시 'Profit Waterfall' 방식을 사용하여 매출액에서 각 비용 항목을 단계별로 차감하는 과정을 시각화하듯 서술하십시오.
   - **[월별 손익 추이]**: monthlyTrend에 최근 6개월 또는 향후 6개월의 매출 및 이익 트렌드를 정량적으로 구현하십시오.
   - 특히 'cashFlowInsight'에는 장부상 이익과 실제 통장 잔고의 괴리(카드 정산 시차, 외상 매입주기 등)를 한 줄로 날카롭게 지적하십시오.

3. 매장 운영 효율성 극대화 (efficiencyMetrics & menuEngineering):
   - **[원가 분해표]**: costBreakdown에 주요 메뉴별 식재료비, 인건비 배분 내역을 정확히 명시하십시오.
   - **[매출 히트맵]**: revenueHeatmap에 요일별/시간대별 매출과 인건비의 교차 분석 데이터를 생성하십시오. 평일 유휴 인력의 비효율을 수치로 드러내야 합니다.
   - **[고객/직원 지표]**: customerLogistics에 재방문율(단골 비중 검증), 직원 1인당 담당 테이블 수, 주문 처리 속도 등을 분석하십시오.
   - 주류 매출 비중(inventoryMix)을 분석하십시오. 고기집의 실질 수익은 술에서 나옵니다. 주류 믹스가 낮다면 그 이유와 개선 방향을 제시하십시오.

4. 상권 및 경쟁 분석의 정밀도 (competitorAnalysis):
   - 인근 경쟁점의 가격대, 운영 시간대, 리뷰 수 등을 비교하여 구조적 원인을 detailedComparison에 명시하십시오.
   - **[미스터리 쇼핑]**: mysteryShopping에 주변 3개 핵심 경쟁점의 장단점, 가격 수준, 회전율 실측 데이터를 시뮬레이션하여 비교하십시오.

5. 실행 로드맵의 구체성과 리스크 관리 (actionChecklist, successMetrics & strategicRisks):
   - 모든 제안에는 트레이드오프가 있습니다. 특정 전략이 품질 저하나 브랜드 훼손으로 이어질 수 있는 리스크를 명시하고 예방책(barrierResponse, riskScenario)을 제시하십시오.
   - **[정량적 KPI]**: successMetrics의 'before' 항목에는 현재의 구체적 상태를, 'after'에는 목표를 명시하여 변화의 경로를 보여주십시오.

6. 감성적 호소와 실용적 균형 (ownerMindsetFeedback & Summary):
   - 사장님께 드리는 조언은 문학적이고 따뜻한 문체를 유지하십시오. "336시간의 기다림을 견디는 그 정성이라면..." 같은 사장님의 가치를 인정하는 표현을 사용하십시오.
   - Summary(한 줄 진단)는 사장님의 노고와 현재의 병목을 동시에 꿰뚫는 압축적 문장이어야 합니다.

7. 압축된 의사결정 설계 (coreStrategy, monetaryEffect, topThreePriorities & ownerResistancePrediction):
   - **[핵심 해법 선언]**: coreStrategy에 이번 매장의 운명을 바꿀 단 하나의 핵심 전략을 선포하십시오. (예: "이 매장의 해법은 '주류 매출 비중 확대'입니다.")
   - **[재무적 환산]**: monetaryEffect에 제안된 액션이 실제 '돈'으로 얼마의 가치가 있는지 정량적으로 제시하십시오. (예: "주류 10% 증가 -> 월 +180만원")
   - **[실행 압축]**: 수많은 전략 중 당장 내일부터 해야 할 Top 3 순위를 rank별로 topThreePriorities에 정리하십시오.
   - **[인간적 저항 예측]**: ownerResistancePrediction에 사장님이 심리적으로 미루거나 저항할 항목을 예측하고 그 대안을 제시하십시오.

출력은 반드시 유효한 JSON 형식이어야 합니다. 다음 필드를 모두 포함하십시오:
overallScore(number 0-100), scoreInterpretation(object: label, description, calculationLogic, calculationDetail), ownerPersona(object: type, description, advice), storePersona(object: type, description), summary(string), strengths(array of strings), weaknesses(array of strings), threeLayerAnalysis(object: surface, direct, structural), viciousCycle(string), aiManagerPoints(array of objects: title, comment), riskPriorities(array of objects: priority, issue, action), hourlyRevenueAnalysis(array of objects: timeSlot, flow, consumptionPsychology, strategy), marketingStrategy(string), operationTips(array of strings), coreStrategy(string), monetaryEffect(array of objects: action, expectedGain), topThreePriorities(array of objects: rank, task, reason), ownerResistancePrediction(object: prediction, reason, countermeasure), ownerMindsetFeedback(string), sixMonthGoalAction(string), bepAnalysis(object: currentStatus, targetSales, fixedCostRatio, variableCostRatio, contributionMarginRatio), menuEngineering(object: star, plowhorse, puzzle, dog, categorizationLogic, dataQualityContext, inventoryMix, costBreakdown), efficiencyMetrics(array of objects: label, value, insight), revenueHeatmap(array of objects: timeSlot, weekdaySales, weekendSales, laborCost), customerLogistics(object: retentionRate, tablesPerStaff, processingTime, insight), competitorAnalysis(object: competitionLevel, marketPosition, neighborStatus, detailedComparison, mysteryShopping), citations(array of objects: source, description), actionChecklist(array of objects: task, deadline, priority, owner, kpi, barrierResponse, riskScenario), analysisVectors(array of objects: subject, score, fullMark, insight, weight), financialDetail(object: fixedCostBreakdown, variableCostBreakdown, profitWaterfall, cashFlowInsight, laborDetail, monthlyTrend), strategicRisks(array of objects: risk, impact, prevention), successMetrics(array of objects: label, before, after), dataFidelity(number 0-100).
`;

  const prompt = `
다음은 매장 운영 현황 데이터입니다:
${dataSummary}

당신은 이 매장을 진심으로 아끼고 함께 성장시키고 싶어 하는 '베테랑 장사 파트너'입니다.
위 데이터를 기반으로 위에서 정의한 7가지 고도화 원칙을 적용하여 리포트를 작성해 주세요.
특히 '인건비'와 '임대료'의 비중, '평일 매출'과 '주말 매출'의 편차를 수치 중심으로 아주 날카롭게 분석해야 합니다.
`;

  try {
    const response = await ai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 16384,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("AI 응답을 생성하지 못했습니다.");
    }

    const parsed = JSON.parse(text);
    return normalizeReport(parsed) as DiagnosisReport;
  } catch (error) {
    console.error("Diagnosis Generation Error:", error);
    throw error;
  }
}
