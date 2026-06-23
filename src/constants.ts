import { DiagnosisItem, DiagnosisSection } from "./types.js";

export const DIAGNOSIS_ITEMS: DiagnosisItem[] = [
  // SECTION 1. 매장 기본 정보
  { id: 1, section: DiagnosisSection.BASIC_INFO, label: "운영 업종 및 핵심 카테고리", type: "text", placeholder: "예: 외식업 > 고기구이 > 특수부위", description: "컨설팅 Tip: 카테고리가 좁고 명확할수록 마케팅 타겟팅이 쉬워집니다." },
  { id: 2, section: DiagnosisSection.BASIC_INFO, label: "매장 오픈 일자", type: "date", isMustFill: true, description: "컨설팅 Tip: 매장의 '생애주기'에 따라 지금 해야 할 핵심 과제가 달라집니다." },
  { id: 3, section: DiagnosisSection.BASIC_INFO, label: "매장 입지 유형", type: "select", options: ["주거지 밀집", "오피스 상권", "역세권", "로드샵", "기타"], placeholder: "상권 유형 선택", description: "컨설팅 Tip: 입지에 따라 주력 고객의 동선과 방문 목적이 결정됩니다." },
  { id: 4, section: DiagnosisSection.BASIC_INFO, label: "매장 규모(평수/좌석)", type: "text", placeholder: "예: 15평 / 테이블 8개", description: "컨설팅 Tip: 규모 대비 매출액을 통해 공간 효율성을 진단합니다." },
  { id: 5, section: DiagnosisSection.BASIC_INFO, label: "인력 구성 현황", type: "text", placeholder: "예: 사장 1명, 정직원 1명, 파트타임 2명", description: "컨설팅 Tip: 인건비 구조와 서비스 품질의 한계를 파악하는 지표입니다." },
  { id: 6, section: DiagnosisSection.BASIC_INFO, label: "영업 시간 및 휴무 안내", type: "text", description: "컨설팅 Tip: 인근 경쟁점과의 '시간적 공백'을 찾는 것이 핵심입니다." },

  // SECTION 2. 매출 & 수익 현황
  { id: 7, section: DiagnosisSection.SALES_PROFIT, label: "월 평균 매출액", type: "number", placeholder: "최근 3개월 평균", description: "컨설팅 Tip: 정확한 숫자가 경영의 시작입니다. POS 기록을 참고하세요." },
  { id: 8, section: DiagnosisSection.SALES_PROFIT, label: "결집 수단별 매출 비중", type: "text", placeholder: "예: 카드 90% / 현금 10%", description: "컨설팅 Tip: 매출 누락 여부와 실제 정산 이익률의 오차를 점검합니다." },
  { id: 9, section: DiagnosisSection.SALES_PROFIT, label: "월 평균 방문 고객 수", type: "number", isMustFill: true, placeholder: "영업 이익 계산의 핵심", description: "컨설팅 Tip: '객단가 x 고객수' 공식에서 우리 매장의 약점이 결판납니다." },
  { id: 10, section: DiagnosisSection.SALES_PROFIT, label: "평균 객단가(1인)", type: "number", placeholder: "고객 1인당 평균 결제액", description: "컨설팅 Tip: 현재 메뉴 구성이 고객 지갑에서 얼마를 인출시키는지 보여줍니다." },
  { id: 11, section: DiagnosisSection.SALES_PROFIT, label: "시간대별 매출 집중도", type: "text", placeholder: "예: 저녁 피크 70% 집중", description: "컨설팅 Tip: 비피크타임의 '유휴 공간' 활용 방안이 순이익의 돌파구입니다." },
  { id: 12, section: DiagnosisSection.SALES_PROFIT, label: "요일별 매출 편차", type: "text", placeholder: "예: 주말 매출이 평일의 2배", description: "컨설팅 Tip: 주요 고객군(직장인 vs 가족)의 방문 패턴을 확인합니다." },
  { id: 13, section: DiagnosisSection.SALES_PROFIT, label: "평균 테이블 회전율", type: "number", placeholder: "일 평균 회전수", description: "컨설팅 Tip: 피크타임의 운영 효율성 극대화 포인트를 찾습니다." },
  { id: 14, section: DiagnosisSection.SALES_PROFIT, label: "월 임대료(VAT 포함)", type: "number", isMustFill: true, description: "컨설팅 Tip: 고정비 비중이 매출의 10%를 초과하면 경영이 매우 힘들어집니다." },
  { id: 15, section: DiagnosisSection.SALES_PROFIT, label: "원재료비(식자재) 점유율", type: "percentage", placeholder: "매출액 대비 %", description: "컨설팅 Tip: 맛있는 메뉴도 원재료비가 40%를 넘으면 남는 게 없습니다." },
  { id: 16, section: DiagnosisSection.SALES_PROFIT, label: "인건비 총 지출액", type: "number", description: "컨설팅 Tip: 대표님의 노동력을 '공짜'로 계산하고 있지는 않으신가요? (사장님 본인의 인건비도 반드시 고려하세요.)" },
  { id: 17, section: DiagnosisSection.SALES_PROFIT, label: "기타 고정 지출", type: "text", placeholder: "수도광열비, 플랫폼 수수료 등", description: "컨설팅 Tip: 보이지 않게 새는 비용을 차단하는 것이 수익 개선의 핵심입니다." },
  { id: 18, section: DiagnosisSection.SALES_PROFIT, label: "예상 월 순수익", type: "number", placeholder: "모든 비용을 제외한 실제 수익", description: "컨설팅 Tip: 결국 이 숫자를 유의미하게 높이는 것이 컨설팅의 최종 목표입니다." },

  // SECTION 3. 메뉴 & 판매 구성
  { id: 19, section: DiagnosisSection.MENU_PRODUCT, label: "전체 메뉴 구성 및 가격표", type: "textarea", description: "컨설팅 Tip: 메뉴판의 '심리학'을 분석하여 자연스러운 추가 주문 구조를 진단합니다." },
  { id: 20, section: DiagnosisSection.MENU_PRODUCT, label: "매장 내수/시그니처 메뉴", type: "text", description: "컨설팅 Tip: 사장님이 밀고 싶은 메뉴와 고객이 실제 찾는 메뉴가 일치하는지 확인합니다." },
  { id: 21, section: DiagnosisSection.MENU_PRODUCT, label: "판매량 TOP 3 메뉴", type: "textarea", isMustFill: true, description: "컨설팅 Tip: 이 메뉴들이 우리 매장의 '실질적 경쟁력'입니다." },
  { id: 22, section: DiagnosisSection.MENU_PRODUCT, label: "수익 기여도가 가장 높은 메뉴", type: "text", description: "컨설팅 Tip: 매출액보다 실제 '마진'을 견인하는 효자 메뉴를 파악합니다." },
  { id: 23, section: DiagnosisSection.MENU_PRODUCT, label: "판매 저조(비인기) 메뉴", type: "text", description: "컨설팅 Tip: 식자재 낭비와 주방 혼란을 초래하는 과감한 정리 대상입니다." },
  { id: 24, section: DiagnosisSection.MENU_PRODUCT, label: "최근 메뉴 개편 및 개선 이력", type: "textarea", placeholder: "바꾼 적 있는지, 언제", description: "컨설팅 Tip: 시장 반응에 따른 개선 속도가 매장의 성장 가능성을 결정합니다." },
  { id: 25, section: DiagnosisSection.MENU_PRODUCT, label: "메뉴 가격 결정 기준", type: "text", placeholder: "원가 기반? 경쟁사 참고? 감으로?", description: "컨설팅 Tip: '감'에 의존하는 가격 결정은 가장 위험한 경영 방식입니다." },

  // SECTION 4. 고객 흐름 & 단골 현황
  { id: 26, section: DiagnosisSection.CUSTOMER_DATA, label: "주요 고객층 분포(성별/연령)", type: "text", placeholder: "예: 20대 여성 60%, 30대 남성 30%" },
  { id: 27, section: DiagnosisSection.CUSTOMER_DATA, label: "고객 방문 목적 분석", type: "text", placeholder: "예: 데이트 40%, 인근 직장 직무 40%, 혼밥 20%" },
  { id: 28, section: DiagnosisSection.CUSTOMER_DATA, label: "추정 단골(재방문) 비율", type: "percentage", description: "컨설팅 Tip: 단골 비중이 매장의 기초 체력을 결정합니다." },
  { id: 29, section: DiagnosisSection.CUSTOMER_DATA, label: "신규 고객 유입 경로 현황", type: "textarea", isMustFill: true, description: "컨설팅 Tip: 마케팅 예산의 효율적인 배분을 위한 핵심 근거입니다." },
  { id: 30, section: DiagnosisSection.CUSTOMER_DATA, label: "주요 클레임 및 개선 요구사항", type: "textarea", placeholder: "최근 1개월 내 반복된 불만사항" },
  { id: 31, section: DiagnosisSection.CUSTOMER_DATA, label: "현장의 긍정적 반응 포인트", type: "textarea", description: "컨설팅 Tip: 강화해야 할 우리 매장만의 강점을 파악합니다." },

  // SECTION 5. 주변 상권 & 경쟁 매장
  { id: 32, section: DiagnosisSection.COMPETITION, label: "주변 1km 내 주요 경쟁 매장 현황", type: "textarea", placeholder: "이름과 특징을 적어주세요." },
  { id: 33, section: DiagnosisSection.COMPETITION, label: "경쟁 점포 대비 가격 경쟁력", type: "select", options: ["높음(우리가 저렴)", "비슷함", "낮음(우리가 비쌈)"] },
  { id: 34, section: DiagnosisSection.COMPETITION, label: "경쟁 매장의 핵심 강점 분석", type: "textarea", placeholder: "고객들이 경쟁점으로 발길을 돌리는 이유" },
  { id: 35, section: DiagnosisSection.COMPETITION, label: "우리 매장만의 차별화된 요소", type: "textarea", placeholder: "오직 우리 집에서만 경험할 수 있는 것" },
  { id: 36, section: DiagnosisSection.COMPETITION, label: "인근 상권 활성도 및 변화", type: "text", description: "컨설팅 Tip: 최근 폐업이나 신규 오픈 추세를 통해 상권의 흐름을 읽습니다." },

  // SECTION 6. 홍보 & 온라인 반응
  { id: 37, section: DiagnosisSection.MARKETING, label: "네이버 플레이스 관리 상태", type: "text", placeholder: "리뷰 수, 평점, 사진 등록 수준 등" },
  { id: 38, section: DiagnosisSection.MARKETING, label: "구글 및 외부 채널 활성화 정도", type: "text" },
  { id: 39, section: DiagnosisSection.MARKETING, label: "배달 서비스 플랫폼 운영 현황", type: "text", placeholder: "배민/쿠팡이츠 등 입점 여부와 반응" },
  { id: 40, section: DiagnosisSection.MARKETING, label: "자체 SNS 채널 홍보 현황", type: "text", placeholder: "인스타그램, 블로그 등 직접 운영 여부" },
  { id: 41, section: DiagnosisSection.MARKETING, label: "진행 중인 온/오프라인 홍보 내역", type: "textarea", placeholder: "체험단, 지역 광고, 전단지 등" },
  { id: 42, section: DiagnosisSection.MARKETING, label: "월 평균 홍보/마케팅 비용", type: "number", description: "컨설팅 Tip: 0원이라도 정확히 파악해야 전략 수립이 가능합니다." },
  { id: 43, section: DiagnosisSection.MARKETING, label: "고객 재방문 유도 수단", type: "text", placeholder: "포인트 적립, 쿠폰, 카톡 채널 등" },

  // SECTION 7. 매장 운영 상태
  { id: 44, section: DiagnosisSection.OPERATIONS, label: "사장님의 관련 업종 경력", type: "number", placeholder: "연 단위" },
  { id: 45, section: DiagnosisSection.OPERATIONS, label: "직원 근속 및 인력 안정성", type: "text", placeholder: "이직 주기 및 채용의 어려움 정도" },
  { id: 46, section: DiagnosisSection.OPERATIONS, label: "식자재 및 재고 관리 현황", type: "select", options: ["경험적 관리", "엑셀/장부", "시스템 연동", "기타"] },
  { id: 47, section: DiagnosisSection.OPERATIONS, label: "디지털 기기 활용 및 데이터 관리 수준", type: "text", placeholder: "키오스크, 테이블오더, POS 데이터 분석 등" },
  { id: 48, section: DiagnosisSection.OPERATIONS, label: "공급망 및 원가 효율성", type: "text", placeholder: "발주 주기 및 주요 거래처 수" },
  { id: 49, section: DiagnosisSection.OPERATIONS, label: "위생 및 서비스 매뉴얼 유무", type: "textarea" },
  { id: 50, section: DiagnosisSection.OPERATIONS, label: "운영 상 가장 개선하고 싶은 병목 업무", type: "text", placeholder: "예: 서빙 속도, 식자재 손질, 마케팅 등" },

  // SECTION 8. 사장님의 목표 & 운영 방향
  { id: 51, section: DiagnosisSection.OWNER_MINDSET, label: "창업 동기 및 경영 철학", type: "textarea", description: "컨설팅 Tip: 브랜드의 정체성을 결정짓는 핵심 가치입니다." },
  { id: 52, section: DiagnosisSection.OWNER_MINDSET, label: "현재 가장 시급한 경영 해결 과제", type: "textarea", isMustFill: true, description: "컨설팅 Tip: 이번 분석의 가장 중요한 나침반이 됩니다." },
  { id: 53, section: DiagnosisSection.OWNER_MINDSET, label: "향후 6개월 이후 도달 희망 목표", type: "textarea", description: "컨설팅 Tip: 구체적일수록 현실적인 액션 플랜이 나옵니다." },
  { id: 54, section: DiagnosisSection.OWNER_MINDSET, label: "추가 투입 가능한 자금 및 리소스 여력", type: "text", description: "마케팅비, 시설 개선비 등" },
  { id: 55, section: DiagnosisSection.OWNER_MINDSET, label: "자기 계발 및 연구에 할애 가능한 시간", type: "text", description: "컨설팅 Tip: 실행력을 담보할 수 있는 사장님의 가용 시간입니다." },
];
