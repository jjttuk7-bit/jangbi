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

출력은 반드시 지정된 JSON 형식을 따라야 합니다.
`;

  const prompt = `
다음은 매장 운영 현황 데이터입니다:
${dataSummary}

당신은 이 매장을 진심으로 아끼고 함께 성장시키고 싶어 하는 '베테랑 장사 파트너'입니다. 
위 데이터를 기반으로 위에서 정의한 7가지 고도화 원칙을 적용하여 리포트를 작성해 주세요. 
특히 '인건비'와 '임대료'의 비중, '평일 매출'과 '주말 매출'의 편차를 수치 중심으로 아주 날카롭게 분석해야 합니다.
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
            scoreInterpretation: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "점수 단계 명칭 (안정/구조개선/위험/긴급)" },
                description: { type: Type.STRING, description: "이 점수가 사장님께 갖는 인간적 의미 설명" },
                calculationLogic: { type: Type.STRING, description: "전체 점수 산출 공식 및 항목별 가중치 설명" },
                calculationDetail: { type: Type.STRING, description: "항목별 실제 부여 점수 및 산출 근거 (상세 수치 포함)" }
              },
              required: ["label", "description", "calculationLogic", "calculationDetail"]
            },
            ownerPersona: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "사장님 유형 (장인형/운영형/감성형 등)" },
                description: { type: Type.STRING, description: "이 유형의 특징과 장점" },
                advice: { type: Type.STRING, description: "이 유형이 주의해야 할 점" }
              },
              required: ["type", "description", "advice"]
            },
            storePersona: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "매장 정체성 정의" },
                description: { type: Type.STRING, description: "상권과 메뉴의 결합 분석" }
              },
              required: ["type", "description"]
            },
            summary: { type: Type.STRING, description: "전체 분석의 정수를 꿰뚫는 '단 한 문장'의 강력한 핵심 문구 (임팩트 중심, 여러 문장 금지)" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "매장 강점 3가지" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "매장 약점 3가지" },
            threeLayerAnalysis: {
              type: Type.OBJECT,
              properties: {
                surface: { type: Type.STRING, description: "표면 증상 (현상)" },
                direct: { type: Type.STRING, description: "직접 원인 (왜?)" },
                structural: { type: Type.STRING, description: "구조적 원인 (근본 심리/상권)" },
              },
              required: ["surface", "direct", "structural"],
            },
            viciousCycle: { type: Type.STRING, description: "분석된 악순환의 고리 설명" },
            aiManagerPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "성장 포인트의 제목" },
                  comment: { type: Type.STRING, description: "베테랑의 따뜻하고 날카로운 조언" }
                },
                required: ["title", "comment"]
              },
            },
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
            hourlyRevenueAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING, description: "시간대 (예: 11시-14시)" },
                  flow: { type: Type.STRING, description: "현재 현황" },
                  consumptionPsychology: { type: Type.STRING, description: "이 시간대 고객의 숨은 심리" },
                  strategy: { type: Type.STRING, description: "심리 기반 공략법" }
                },
                required: ["timeSlot", "flow", "consumptionPsychology", "strategy"]
              }
            },
            marketingStrategy: { type: Type.STRING, description: "추천 마케팅 전략 (초정밀 타겟팅)" },
            operationTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "운영 효율화 팁" },
            coreStrategy: { type: Type.STRING, description: "이번 매장의 운명을 바꿀 단 하나의 핵심 전략 선언" },
            monetaryEffect: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING, description: "실행 액션" },
                  expectedGain: { type: Type.STRING, description: "예상되는 금전적/수치적 효과" }
                },
                required: ["action", "expectedGain"]
              }
            },
            topThreePriorities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.NUMBER },
                  task: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["rank", "task", "reason"]
              }
            },
            ownerResistancePrediction: {
              type: Type.OBJECT,
              properties: {
                prediction: { type: Type.STRING, description: "사장님이 실행을 미루거나 저항할 것으로 예상되는 지점" },
                reason: { type: Type.STRING, description: "그 심리적/현실적 원인" },
                countermeasure: { type: Type.STRING, description: "이를 극복하기 위한 컨설턴트의 제언" }
              },
              required: ["prediction", "reason", "countermeasure"]
            },
            ownerMindsetFeedback: { type: Type.STRING, description: "사장님께 드리는 심리적 조언/격려" },
            sixMonthGoalAction: { type: Type.STRING, description: "6개월 후 도달해 있을 매장의 구체적인 모습" },
            bepAnalysis: {
              type: Type.OBJECT,
              properties: {
                currentStatus: { type: Type.STRING, description: "현재 손익 상태 요약" },
                targetSales: { type: Type.STRING, description: "강력 추천 목표 매출액" },
                fixedCostRatio: { type: Type.NUMBER, description: "고정비 비중 (%)" },
                variableCostRatio: { type: Type.NUMBER, description: "변동비 비중 (%)" },
                contributionMarginRatio: { type: Type.NUMBER, description: "공헌이익률 (%)" },
              },
              required: ["currentStatus", "targetSales", "fixedCostRatio", "variableCostRatio", "contributionMarginRatio"],
            },
            menuEngineering: {
              type: Type.OBJECT,
              properties: {
                star: { type: Type.ARRAY, items: { type: Type.STRING }, description: "수익성/인지도 모두 높은 메뉴" },
                plowhorse: { type: Type.ARRAY, items: { type: Type.STRING }, description: "인지도는 높으나 수익성 낮은 메뉴" },
                puzzle: { type: Type.ARRAY, items: { type: Type.STRING }, description: "인지도는 낮으나 수익성 높은 메뉴" },
                dog: { type: Type.ARRAY, items: { type: Type.STRING }, description: "인지도/수익성 모두 낮은 메뉴" },
                categorizationLogic: { type: Type.STRING, description: "메뉴 분류 기준 및 데이터 근거" },
                dataQualityContext: { type: Type.STRING, description: "분류의 데이터 신뢰도 맥락" },
                inventoryMix: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      category: { type: Type.STRING }, 
                      ratio: { type: Type.NUMBER }, 
                      insight: { type: Type.STRING } 
                    },
                    required: ["category", "ratio", "insight"]
                  }
                },
                costBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      menuName: { type: Type.STRING },
                      rawMaterialRatio: { type: Type.NUMBER },
                      laborRatio: { type: Type.NUMBER },
                      netProfitRatio: { type: Type.NUMBER }
                    },
                    required: ["menuName", "rawMaterialRatio", "laborRatio", "netProfitRatio"]
                  }
                }
              },
              required: ["star", "plowhorse", "puzzle", "dog", "categorizationLogic", "dataQualityContext", "inventoryMix", "costBreakdown"],
            },
            efficiencyMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "지표명 (예: 회전율)" },
                  value: { type: Type.STRING, description: "현재 수치" },
                  insight: { type: Type.STRING, description: "베테랑의 해석" }
                },
                required: ["label", "value", "insight"]
              }
            },
            revenueHeatmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING },
                  weekdaySales: { type: Type.STRING },
                  weekendSales: { type: Type.STRING },
                  laborCost: { type: Type.STRING }
                },
                required: ["timeSlot", "weekdaySales", "weekendSales", "laborCost"]
              }
            },
            customerLogistics: {
              type: Type.OBJECT,
              properties: {
                retentionRate: { type: Type.STRING },
                tablesPerStaff: { type: Type.STRING },
                processingTime: { type: Type.STRING },
                insight: { type: Type.STRING }
              },
              required: ["retentionRate", "tablesPerStaff", "processingTime", "insight"]
            },
            competitorAnalysis: {
              type: Type.OBJECT,
              properties: {
                competitionLevel: { type: Type.STRING, description: "경쟁 강도 진단" },
                marketPosition: { type: Type.STRING, description: "매장의 상권 내 포지셔닝" },
                neighborStatus: { type: Type.STRING, description: "주변 주요 경쟁점 현황" },
                detailedComparison: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      factor: { type: Type.STRING, description: "비교 요소 (가격/시간/서비스)" },
                      myStore: { type: Type.STRING, description: "우리 매장 상태" },
                      competitor: { type: Type.STRING, description: "경쟁 매장 상태" }
                    },
                    required: ["factor", "myStore", "competitor"]
                  }
                },
                mysteryShopping: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      storeName: { type: Type.STRING },
                      strength: { type: Type.STRING },
                      weakness: { type: Type.STRING },
                      priceLevel: { type: Type.STRING },
                      rotationRate: { type: Type.STRING }
                    },
                    required: ["storeName", "strength", "weakness", "priceLevel", "rotationRate"]
                  }
                }
              },
              required: ["competitionLevel", "marketPosition", "neighborStatus", "detailedComparison", "mysteryShopping"]
            },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING, description: "데이터 출처 (기관명 등)" },
                  description: { type: Type.STRING, description: "인용 내용 및 근거" }
                },
                required: ["source", "description"]
              }
            },
            actionChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING, description: "초정밀 실행 과제" },
                  deadline: { type: Type.STRING, description: "권장 기한" },
                  priority: { type: Type.STRING, description: "우선순위" },
                  owner: { type: Type.STRING, description: "담당자" },
                  kpi: { type: Type.STRING, description: "성공 측정 지표" },
                  barrierResponse: { type: Type.STRING, description: "장벽 발생 시 대응" },
                  riskScenario: { type: Type.STRING, description: "역방향 리스크 시나리오" }
                },
                required: ["task", "deadline", "priority", "owner", "kpi", "barrierResponse", "riskScenario"],
              },
            },
            analysisVectors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING, description: "분석 지표" },
                  score: { type: Type.NUMBER, description: "점수 (0-100)" },
                  fullMark: { type: Type.NUMBER, description: "기준 점수 (100)" },
                  insight: { type: Type.STRING, description: "분석 내용" },
                  weight: { type: Type.NUMBER, description: "가중치" }
                },
                required: ["subject", "score", "fullMark", "insight", "weight"],
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
                      label: { type: Type.STRING, description: "고정비 항목" },
                      value: { type: Type.STRING, description: "진단" },
                    },
                    required: ["label", "value"],
                  }
                },
                variableCostBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "변동비 항목" },
                      value: { type: Type.STRING, description: "진단" },
                    },
                    required: ["label", "value"],
                  }
                },
                profitWaterfall: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "단계" },
                      value: { type: Type.STRING, description: "금액" },
                      type: { type: Type.STRING, enum: ["plus", "minus", "total"] }
                    },
                    required: ["label", "value", "type"]
                  }
                },
                cashFlowInsight: { type: Type.STRING, description: "현금흐름 구조 한 줄 진단" },
                laborDetail: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING, description: "인건비 분류 (예: 정직원, 아르바이트)" },
                      amount: { type: Type.STRING, description: "금액" },
                      description: { type: Type.STRING, description: "구성 상세 (인원 x 시간 등)" }
                    },
                    required: ["category", "amount", "description"]
                  }
                },
                monthlyTrend: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      month: { type: Type.STRING },
                      sales: { type: Type.STRING },
                      profit: { type: Type.STRING }
                    },
                    required: ["month", "sales", "profit"]
                  }
                }
              },
              required: ["fixedCostBreakdown", "variableCostBreakdown", "profitWaterfall", "cashFlowInsight", "laborDetail", "monthlyTrend"],
            },
            strategicRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING, description: "전략적 리스크 (예: 브랜드 이미지 희석)" },
                  impact: { type: Type.STRING, description: "부정적 영향" },
                  prevention: { type: Type.STRING, description: "예방 및 대응책" }
                },
                required: ["risk", "impact", "prevention"]
              }
            },
            successMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "지표 명칭" },
                  before: { type: Type.STRING, description: "현재" },
                  after: { type: Type.STRING, description: "목표" },
                },
                required: ["label", "before", "after"],
              }
            },
            dataFidelity: { type: Type.NUMBER, description: "진단 신뢰도 점수 (0-100)" },
          },
          required: [
            "overallScore", "scoreInterpretation", "ownerPersona", "storePersona", "summary", 
            "strengths", "weaknesses", "threeLayerAnalysis", "viciousCycle", "aiManagerPoints", 
            "riskPriorities", "hourlyRevenueAnalysis", "marketingStrategy", "operationTips", 
            "coreStrategy", "monetaryEffect", "topThreePriorities", "ownerResistancePrediction",
            "ownerMindsetFeedback", "sixMonthGoalAction", "bepAnalysis", "menuEngineering", "actionChecklist", 
            "analysisVectors", "financialDetail", "successMetrics", "dataFidelity", "revenueHeatmap", "customerLogistics"
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
