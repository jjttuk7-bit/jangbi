import { DiagnosisItem, DiagnosisSection } from "./types";

export const DIAGNOSIS_ITEMS: DiagnosisItem[] = [
  // SECTION 1. 기본 신상 정보
  { id: 1, section: DiagnosisSection.BASIC_INFO, label: "업종 및 세부 카테고리", type: "text", placeholder: "예: 외식업 > 고기구이 > 특수부위", description: "전문가 Tip: 카테고리가 좁고 명확할수록 마케팅 타겟팅이 쉬워집니다." },
  { id: 2, section: DiagnosisSection.BASIC_INFO, label: "오픈 일자", type: "date", isMustFill: true, description: "전문가 Tip: 매장의 '생애주기'에 따라 지금 해야 할 일이 180도 달라집니다." },
  { id: 3, section: DiagnosisSection.BASIC_INFO, label: "매장 위치", type: "select", options: ["주거지 밀집", "오피스", "역세권", "로드샵", "기타"], placeholder: "상권 유형", description: "전문가 Tip: 상권에 따라 주력 고객의 동선과 방문 목적이 결정됩니다." },
  { id: 4, section: DiagnosisSection.BASIC_INFO, label: "매장 규모", type: "text", placeholder: "평수, 좌석 수 또는 테이블 수", description: "전문가 Tip: 규모 대비 매출액을 통해 공간 효율성을 진단합니다." },
  { id: 5, section: DiagnosisSection.BASIC_INFO, label: "운영 형태", type: "text", placeholder: "혼자 운영 / 가족 / 직원 수", description: "전문가 Tip: 인건비 구조와 서비스 질의 한계를 파악하는 지표입니다." },
  { id: 6, section: DiagnosisSection.BASIC_INFO, label: "영업시간 및 정기 휴무일", type: "text", description: "전문가 Tip: 인근 경쟁점과의 '시간적 공백'을 찾는 것이 핵심입니다." },

  // SECTION 2. 매출 & 수익 데이터
  { id: 7, section: DiagnosisSection.SALES_PROFIT, label: "월 평균 총매출액", type: "number", placeholder: "또는 일 평균 매출", description: "전문가 Tip: 정확한 숫자가 경영의 시작입니다. 모르면 POS 기록을 확인하세요." },
  { id: 8, section: DiagnosisSection.SALES_PROFIT, label: "카드 vs 현금 비율", type: "text", description: "전문가 Tip: 누락되는 매출은 없는지, 실제 이익률과 오차를 점검합니다." },
  { id: 9, section: DiagnosisSection.SALES_PROFIT, label: "월 평균 고객 수", type: "number", isMustFill: true, placeholder: "모든 수익 계산의 출발점", description: "전문가 Tip: '객단가 x 고객수' 공식에서 우리 매장의 약점이 결판납니다." },
  { id: 10, section: DiagnosisSection.SALES_PROFIT, label: "평균 객단가", type: "number", placeholder: "1인당 또는 1테이블당", description: "전문가 Tip: 현재 메뉴 구성이 고객 지갑에서 얼마를 끌어내는지 보여줍니다." },
  { id: 11, section: DiagnosisSection.SALES_PROFIT, label: "피크타임 vs 비피크타임 매출 비율", type: "text", placeholder: "예: 저녁 70% / 점심 30%", description: "전문가 Tip: 비피크타임의 '유휴 공간' 활용 방안이 순이익 증가의 돌파구입니다." },
  { id: 12, section: DiagnosisSection.SALES_PROFIT, label: "평일 vs 주말 고객 수 비율", type: "text", description: "전문가 Tip: 고객 타겟(직장인 vs 가족)이 명확한지 확인하는 지표입니다." },
  { id: 13, section: DiagnosisSection.SALES_PROFIT, label: "테이블 회전율", type: "number", placeholder: "하루 몇 회전", description: "전문가 Tip: 피크타임의 효율성 극대화 포인트를 찾습니다." },
  { id: 14, section: DiagnosisSection.SALES_PROFIT, label: "월세 / 임대료", type: "number", isMustFill: true, description: "전문가 Tip: 고정비 비중이 매출의 10%를 넘어가면 운영이 매우 고달파집니다." },
  { id: 15, section: DiagnosisSection.SALES_PROFIT, label: "식자재(원재료) 원가율", type: "percentage", placeholder: "매출 대비 %", description: "전문가 Tip: 훌륭한 메뉴도 원가가 40%를 넘으면 남는 게 없습니다." },
  { id: 16, section: DiagnosisSection.SALES_PROFIT, label: "인건비 총액", type: "number", description: "사장 본인 인건비 포함", description: "전문가 Tip: 사장님의 노동력을 '공짜'로 계산하고 있지 않나요?" },
  { id: 17, section: DiagnosisSection.SALES_PROFIT, label: "기타 고정비", type: "text", placeholder: "공과금, 보험료, 플랫폼 수수료 등", description: "전문가 Tip: 보이지 않게 세는 돈을 막는 것이 이익의 핵심입니다." },
  { id: 18, section: DiagnosisSection.SALES_PROFIT, label: "월 순이익", type: "number", placeholder: "또는 순이익률", description: "전문가 Tip: 결국 이 숫자를 높이는 것이 우리의 목표입니다." },

  // SECTION 3. 메뉴 & 상품 구성
  { id: 19, section: DiagnosisSection.MENU_PRODUCT, label: "전체 메뉴 리스트 및 가격", type: "textarea", description: "전문가 Tip: 메뉴판의 '심리학'을 분석하여 업셀링 구조를 진단합니다." },
  { id: 20, section: DiagnosisSection.MENU_PRODUCT, label: "주력 메뉴 / 시그니처 메뉴", type: "text", description: "전문가 Tip: 사장님이 밀고 싶은 것과 고객이 원하는 것이 일치하는지 봅니다." },
  { id: 21, section: DiagnosisSection.MENU_PRODUCT, label: "실제 가장 많이 팔리는 메뉴 TOP 3", type: "textarea", isMustFill: true, description: "전문가 Tip: 이 메뉴들이 우리 매장의 '진짜 얼굴'입니다." },
  { id: 22, section: DiagnosisSection.MENU_PRODUCT, label: "가장 수익성 높은 메뉴", type: "text", description: "전문가 Tip: 매출보다 '이익'을 견인하는 효자 메뉴를 파악합니다." },
  { id: 23, section: DiagnosisSection.MENU_PRODUCT, label: "거의 안 팔리는 메뉴", type: "text", description: "전문가 Tip: 식자재 낭비와 주방 혼란을 초래하는 제거 대상입니다." },
  { id: 24, section: DiagnosisSection.MENU_PRODUCT, label: "메뉴 개편 이력", type: "textarea", placeholder: "바꾼 적 있는지, 언제", description: "전문가 Tip: 피드백과 개선 속도가 매장의 성장 가능성을 결정합니다." },
  { id: 25, section: DiagnosisSection.MENU_PRODUCT, label: "가격 책정 기준", type: "text", placeholder: "원가 기반? 경쟁사 참고? 감으로?", description: "전문가 Tip: '감'으로 하는 가격 결정은 가장 위험한 도박입니다." },

  // SECTION 4. 고객 데이터
  { id: 26, section: DiagnosisSection.CUSTOMER_DATA, label: "주 고객층", type: "text", placeholder: "연령대, 성별, 직업군 등" },
  { id: 27, section: DiagnosisSection.CUSTOMER_DATA, label: "방문 목적 유형", type: "text", placeholder: "혼밥 / 가족식사 / 직장동료 / 데이트 / 단체 등" },
  { id: 28, section: DiagnosisSection.CUSTOMER_DATA, label: "재방문율", type: "percentage", description: "단골 비율 — 감으로라도" },
  { id: 29, section: DiagnosisSection.CUSTOMER_DATA, label: "신규 고객 유입 경로", type: "textarea", isMustFill: true, description: "마케팅 예산 배분 근거" },
  { id: 30, section: DiagnosisSection.CUSTOMER_DATA, label: "고객 클레임 또는 불만 유형", type: "textarea" },
  { id: 31, section: DiagnosisSection.CUSTOMER_DATA, label: "고객 칭찬 포인트", type: "textarea", description: "리뷰나 직접 반응에서" },

  // SECTION 5. 경쟁 환경
  { id: 32, section: DiagnosisSection.COMPETITION, label: "반경 500m~1km 내 직접 경쟁 매장 수 및 이름", type: "textarea" },
  { id: 33, section: DiagnosisSection.COMPETITION, label: "경쟁 매장들의 가격대 수준", type: "select", options: ["우리보다 비쌈", "비슷함", "우리보다 저렴함"] },
  { id: 34, section: DiagnosisSection.COMPETITION, label: "경쟁 매장들의 강점", type: "textarea", placeholder: "왜 거기 가는지" },
  { id: 35, section: DiagnosisSection.COMPETITION, label: "우리 매장의 자체 인식 차별점", type: "textarea" },
  { id: 36, section: DiagnosisSection.COMPETITION, label: "상권 내 공실률 또는 최근 폐업 매장 수", type: "text", description: "상권 건강도" },

  // SECTION 6. 마케팅 & 온라인 존재감
  { id: 37, section: DiagnosisSection.MARKETING, label: "네이버 플레이스 등록 여부 및 리뷰 수 / 평점", type: "text" },
  { id: 38, section: DiagnosisSection.MARKETING, label: "구글 지도 등록 여부 및 리뷰 수", type: "text" },
  { id: 39, section: DiagnosisSection.MARKETING, label: "배달앱 입점 여부 및 평점", type: "text", placeholder: "배달의민족 / 쿠팡이츠 등" },
  { id: 40, section: DiagnosisSection.MARKETING, label: "SNS 운영 여부 및 팔로워 수", type: "text", placeholder: "인스타그램 / 블로그 / 카카오 등" },
  { id: 41, section: DiagnosisSection.MARKETING, label: "현재 진행 중인 마케팅 활동", type: "textarea" },
  { id: 42, section: DiagnosisSection.MARKETING, label: "마케팅에 월 투자하는 비용", type: "number", description: "0원도 중요한 정보" },
  { id: 43, section: DiagnosisSection.MARKETING, label: "단골 관리 수단", type: "text", placeholder: "스탬프카드 / 카카오톡 / 아무것도 없음 등" },

  // SECTION 7. 운영 & 내부 역량
  { id: 44, section: DiagnosisSection.OPERATIONS, label: "사장 본인의 이 업종 경력 연수", type: "number" },
  { id: 45, section: DiagnosisSection.OPERATIONS, label: "직원 근속 기간 및 이직률", type: "text" },
  { id: 46, section: DiagnosisSection.OPERATIONS, label: "재고 관리 방식", type: "select", options: ["감으로", "엑셀", "포스 시스템", "기타"] },
  { id: 47, section: DiagnosisSection.OPERATIONS, label: "포스(POS) 시스템 사용 여부 및 활용 수준", type: "text" },
  { id: 48, section: DiagnosisSection.OPERATIONS, label: "식자재 발주 주기 및 주요 공급처 수", type: "text" },
  { id: 49, section: DiagnosisSection.OPERATIONS, label: "클레임 또는 위생 이슈 발생 이력", type: "textarea" },
  { id: 50, section: DiagnosisSection.OPERATIONS, label: "사장 본인이 가장 힘들다고 느끼는 업무 1가지", type: "text" },

  // SECTION 8. 사장의 목표 & 심리 상태
  { id: 51, section: DiagnosisSection.OWNER_MINDSET, label: "이 매장을 왜 시작했는가", type: "textarea", description: "동기" },
  { id: 52, section: DiagnosisSection.OWNER_MINDSET, label: "지금 가장 크게 느끼는 문제", type: "textarea", isMustFill: true, description: "분석 방향의 나침반" },
  { id: 53, section: DiagnosisSection.OWNER_MINDSET, label: "6개월 후 어떤 상태가 되고 싶은가", type: "textarea", description: "목표" },
  { id: 54, section: DiagnosisSection.OWNER_MINDSET, label: "현재 사용 가능한 추가 투자 여력", type: "text", description: "자금 여유" },
  { id: 55, section: DiagnosisSection.OWNER_MINDSET, label: "하루 중 운영 외 업무에 쓸 수 있는 시간", type: "text", description: "마케팅, 공부 등" },
];
