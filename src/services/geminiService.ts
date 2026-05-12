import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisData, DiagnosisReport } from "../types";
import { DIAGNOSIS_ITEMS } from "../constants";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("장사 비서 지능 엔진을 가동하기 위한 API Key가 설정되지 않았습니다. 관리자에게 문의하세요.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function generateDiagnosis(data: DiagnosisData): Promise<DiagnosisReport> {
  const ai = getAI();
  const dataSummary = DIAGNOSIS_ITEMS.map((item) => {
    const value = data[item.id] || "데이터 없음";
    return `${item.id}. ${item.label}: ${value}`;
  }).join("\n");

  const systemInstruction = `
당신은 20년 경력의 베테랑 장사 비서 전문가입니다. 사용자가 제공한 55가지 장사 현황 데이터를 바탕으로 정밀 분석 보고서를 작성하세요.

분석 시 다음 '베테랑 장사 지능의 고도화 원칙'을 반드시 준수하세요:
1. 손익분기점(BEP) 분석: 고정비(임대료, 인건비 등)와 변동비(식자재 등)의 비율을 계산하여 현재 매장이 '생존선' 어디에 있는지 진단하십시오.
2. 메뉴 엔지니어링 (BCG Matrix): 판매량과 수익성을 기준으로 메뉴를 4가지(Star, Plowhorse, Puzzle, Dog)로 분류하고 각각의 전략을 제시하십시오.
3. 5대 핵심 지표 분석 (analysisVectors): 수익성, 메뉴 경쟁력, 고객 응집도, 운영 효율성, 마케팅 활동성을 각각 0-100점으로 정밀 산출하십시오.
4. 데이터 신뢰도(dataFidelity): 입력된 정보의 성실도와 구체성을 판단하여 0-100점으로 산출하십시오.
5. 베테랑의 촌철살인(veteranPunchline): 분석 결과 중 가장 뼈아픈 지점이나 핵심 돌파구를 아주 짧고 강렬한 한마디(반말로 해도 무방, 전문가적 권위 필요)로 작성하십시오.
6. 문제를 3층으로 분해: 표면 현상 -> 직접 원인 -> 구조적 원인 순으로 분석하십시오.
7. 실행 가능성: 매장 규모와 사장님의 여력을 고려한 현실적인 솔루션과 타임라인이 있는 체크리스트를 제안하십시오.

출력은 반드시 지정된 JSON 형식을 따라야 합니다.
`;

  const prompt = `
다음은 장사 현황 데이터입니다:
${dataSummary}

위 데이터를 바탕으로 베테랑 전문가용 정밀 분석 보고서를 작성해 주세요. 
특히 다음을 중점적으로 다루어야 합니다:
- 이익 구조 분석 및 손익분기점 도달을 위한 필요 매출액 
- 수익성 극대화를 위한 메뉴 재배치 전략 (Star, Plowhorse, Puzzle, Dog)
- 5각형 레이더 차트용 지표 점수 (수익성, 메뉴, 고객, 운영, 마케팅)
- 데이터 입력 데이터의 질에 따른 신뢰도 점수
- 6개월 내 성과를 내기 위한 단계별 액션 체크리스트
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER, description: "매장 건강도 점수 (0-100)" },
            summary: { type: Type.STRING, description: "전체 분석 요약" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "매장 강점 3가지" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "매장 약점 3가지" },
            threeLayerAnalysis: {
              type: Type.OBJECT,
              properties: {
                surface: { type: Type.STRING, description: "표면 증상 (현상)" },
                direct: { type: Type.STRING, description: "직접 원인 (왜?)" },
                structural: { type: Type.STRING, description: "구구조적 원인 (근본)" },
              },
              required: ["surface", "direct", "structural"],
            },
            viciousCycle: { type: Type.STRING, description: "분석된 악순환의 고리 설명" },
            riskPriorities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: { type: Type.STRING, description: "우선순위 (High/Medium/Low)" },
                  issue: { type: Type.STRING, description: "해당 이슈" },
                  action: { type: Type.STRING, description: "실행 방안" },
                },
                required: ["priority", "issue", "action"],
              },
            },
            marketingStrategy: { type: Type.STRING, description: "추천 마케팅 전략" },
            operationTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "운영 효율화 팁" },
            ownerMindsetFeedback: { type: Type.STRING, description: "사장님께 드리는 심리적 조언/피드백" },
            sixMonthGoalAction: { type: Type.STRING, description: "6개월 후 목표 달성을 위한 핵심 실행 과제" },
            bepAnalysis: {
              type: Type.OBJECT,
              properties: {
                currentStatus: { type: Type.STRING, description: "현재 손익 상태 요약" },
                targetSales: { type: Type.STRING, description: "강력 추천 목표 매출액" },
                fixedCostRatio: { type: Type.NUMBER, description: "고정비 비중 (%)" },
                variableCostRatio: { type: Type.NUMBER, description: "변동비 비중 (%)" },
              },
              required: ["currentStatus", "targetSales", "fixedCostRatio", "variableCostRatio"],
            },
            menuEngineering: {
              type: Type.OBJECT,
              properties: {
                star: { type: Type.ARRAY, items: { type: Type.STRING }, description: "수익성/인지도 모두 높은 메뉴" },
                plowhorse: { type: Type.ARRAY, items: { type: Type.STRING }, description: "인지도는 높으나 수익성 낮은 메뉴" },
                puzzle: { type: Type.ARRAY, items: { type: Type.STRING }, description: "인지도는 낮으나 수익성 높은 메뉴" },
                dog: { type: Type.ARRAY, items: { type: Type.STRING }, description: "인지도/수익성 모두 낮은 메뉴" },
              },
              required: ["star", "plowhorse", "puzzle", "dog"],
            },
            actionChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING, description: "실행 과제" },
                  deadline: { type: Type.STRING, description: "권장 기한" },
                  priority: { type: Type.STRING, description: "우선순위 (최우선/우선/보통)" },
                },
                required: ["task", "deadline", "priority"],
              },
            },
            analysisVectors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: "분석 지표 (예: 수익성, 메뉴 경쟁력, 고객 응집도, 운영 효율성, 마케팅 활동성)" },
                  score: { type: Type.NUMBER, description: "점수 (0-100)" },
                  fullMark: { type: Type.NUMBER, description: "기준 점수 (100)" },
                  insight: { type: Type.STRING, description: "해당 지표에 대한 짧고 강렬한 분석 의견 (20자 내외)" },
                },
                required: ["subject", "score", "fullMark", "insight"],
              },
            },
            financialDetail: {
              type: Type.OBJECT,
              properties: {
                fixedCostBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "고정비 항목 명칭" },
                      value: { type: Type.STRING, description: "항목별 상태 또는 특징 (예: '매출 대비 높음', '적정 수준')" },
                    },
                    required: ["label", "value"],
                  }
                },
                variableCostBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "변동비 항목 명칭" },
                      value: { type: Type.STRING, description: "항목별 상태 또는 특징" },
                    },
                    required: ["label", "value"],
                  }
                },
              },
              required: ["fixedCostBreakdown", "variableCostBreakdown"],
            },
            successMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "지표 명칭 (예: 월 매출, 테이블 회전율, 단골 비중)" },
                  before: { type: Type.STRING, description: "현재 수치" },
                  after: { type: Type.STRING, description: "6개월 후 목표 수치" },
                },
                required: ["label", "before", "after"],
              }
            },
            dataFidelity: { type: Type.NUMBER, description: "진단 신뢰도 점수 (0-100)" },
            veteranPunchline: { type: Type.STRING, description: "베테랑 전문가의 짧고 강렬한 촌철살인 한마디" },
          },
          required: [
            "overallScore", "summary", "strengths", "weaknesses", "threeLayerAnalysis",
            "viciousCycle", "riskPriorities", "marketingStrategy", "operationTips",
            "ownerMindsetFeedback", "sixMonthGoalAction", "bepAnalysis", "menuEngineering", "actionChecklist",
            "analysisVectors", "financialDetail", "successMetrics", "dataFidelity", "veteranPunchline"
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("AI 응답을 생성하지 못했습니다.");
    }

    return JSON.parse(response.text) as DiagnosisReport;
  } catch (error) {
    console.error("Diagnosis Generation Error:", error);
    throw error;
  }
}
