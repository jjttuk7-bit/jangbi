# 팀소피아 코치 독립 에이전트 셋업 가이드

> 각 코치를 **자기 채널에 사는 독립 Hermes 에이전트(프로필)** 로 세우고, 장사비서가 오케스트레이터로 각 코치 채널에 일을 보내 결과를 수거하는 구조의 셋업 절차.
> 기준 문서: [TEAM_SOPHIA_SLACK_CONTEXT.md](TEAM_SOPHIA_SLACK_CONTEXT.md)
> 검증 완료: **앤(anne-data)** — 자기 채널에서 실제 계산·진단·데이터요청까지 산출 확인.

---

## 0. 구조 요약

```
장사비서(오케스트레이터) → /api/coach-ask {coachId, agentId, diagnosis}
  → 해당 코치 채널(예 #anne-data)에 @코치 멘션으로 과제 게시
  → 코치(독립 Hermes 프로필)가 자기 채널에서 실제 작업
  → /api/sophia-poll 로 스레드 답글 수거
```

- 단일 Hermes는 자기 채널로만 출력 가능 → 코치마다 **별도 Slack 앱 + 별도 Hermes 프로필**.
- 환경: Hostinger VPS Docker 컨테이너 `hermes-agent-ideu` 안. `~` = `/opt/data`, 프로필 경로 = `/opt/data/profiles/<name>/`.
- 모델/키(`OPENROUTER_API_KEY` 등)는 컨테이너 process env로 전 프로필이 상속.

## 코치 등록부

| 코치 | coachId | 채널 | Slack 앱 | 상태 | bot user_id |
| --- | --- | --- | --- | --- | --- |
| 마스터 코치 소피아 | `sophia` | `#sophia` | (오케스트레이터/메인) | - | - |
| 데이터 분석가 앤 | `anne-data` | `#anne-data` | Anne | ✅ 완료 | `U0BCBQ2SMM1` |
| CS 코치 클레어 | `claire-cs` | `#claire-cs` | Claire | ⬜ | - |
| 마케터 제인 | `jane-marketer` | `#jane-marketer` | Jane | ⬜ | - |
| 크리에이터 켈리 | `kelly-creator` | `#kelly-creator` | Kelly | ⬜ | - |

- 장사비서 Bridge 봇 user_id: **`U0BCDG94430`** (각 코치 `SLACK_ALLOWED_USERS`에 필수).

---

## 1. 핵심 교훈 (앤에서 배운 것 — 반드시 반영)

1. **`chat:write` 스코프 처음부터** 추가 (없으면 코치가 받기만 하고 답을 못 올림).
2. **SOUL은 텍스트 기반** — `execute_code` 같은 도구 사용을 강요하면, 그 도구가 프로필 환경에서 안 돌 때 "예고만 하고 멈춤". 도구 강요 대신 "직접 텍스트로 결과를 즉시 출력"으로.
3. **"~하겠습니다/분석했습니다" 예고 금지** — 곧바로 실제 산출물(표·문구)을 내도록 SOUL에 명시.
4. **`anne gateway run --replace` 는 한 번만** (여러 번 빠르게 실행하면 인스턴스끼리 SIGTERM으로 서로 죽임).
5. **컨테이너 안에선 `gateway start` 불가** → `gateway run` 사용. 24시간 유지는 `nohup ... & disown` (단 컨테이너 재시작엔 안 살아남음 → 별도 컨테이너 권장).
6. **브릿지 멘션은 `agentId`(코치 봇 user_id)로 직접 지정** — 채널에 옛 봇 메시지가 있어 자동 해석이 불안정.
7. **모델은 메인과 동일하게** (크레딧 있는 것): `openrouter` / `inference-api.nousresearch.com/v1` / `google/gemini-2.5-flash`.

---

## 2. 코치 1명 셋업 절차 (공통 — `<name>`/`<channel>`만 바꿔 반복)

### 2-1. Slack 앱 생성 (api.slack.com/apps → Create New App)
- 이름: 코치명(예: `Claire`), 워크스페이스 `AXIO`
- **OAuth & Permissions → Bot Token Scopes**: `chat:write`, `app_mentions:read`, `channels:history`, `channels:read`
- **Basic Information → App-Level Tokens**: scope `connections:write` → `xapp-` 토큰 생성
- **Socket Mode**: On
- **Event Subscriptions → Subscribe to bot events**: `app_mention`, `message.channels`
- **Install to Workspace** → `xoxb-` 봇 토큰 복사
- 코치 채널에서: `/invite @<코치앱>` **그리고** `/invite @Jangbi Bridge`

### 2-2. Hermes 프로필 생성 (컨테이너 터미널)
```bash
hermes profile create <name>      # 예: claire
```
→ 프로필: `/opt/data/profiles/<name>/` (`.env`, `SOUL.md`)

### 2-3. `.env` 설정 (터미널에서 — 토큰은 슬랙 채팅에 붙이지 말 것)
```bash
nano /opt/data/profiles/<name>/.env
```
추가:
```
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
SLACK_HOME_CHANNEL=#<channel>
SLACK_ALLOW_BOTS=mentions
SLACK_ALLOWED_USERS=U0BCDG94430
```

### 2-4. 모델 설정
```bash
<name> config set model.provider openrouter
<name> config set model.base_url https://inference-api.nousresearch.com/v1
<name> config set model.default google/gemini-2.5-flash
```

### 2-5. SOUL 작성 (아래 §3의 코치별 프롬프트) — #build-log에서 @Hermes Agent에게 `write_file` 시키면 편함

### 2-6. 실행 (한 번만)
```bash
nohup <name> gateway run --replace > /opt/data/profiles/<name>/gateway.log 2>&1 & disown
sleep 10; tail -n 10 /opt/data/profiles/<name>/gateway.log   # 연결 확인(Discord 에러는 무시)
```

### 2-7. 코치 봇 user_id 확인 (브릿지 멘션용)
```bash
T=$(grep -m1 '^SLACK_BOT_TOKEN=' /opt/data/profiles/<name>/.env | cut -d= -f2- | tr -d '"')
curl -s -H "Authorization: Bearer $T" https://slack.com/api/auth.test; echo
```
→ `user_id` 를 등록부 표에 기록 + 브릿지 테스트에 사용.

---

## 3. 코치별 SOUL 프롬프트 (텍스트 기반 · 도구 강요 X · 예고 금지)

### 데이터 분석가 앤 (`/opt/data/profiles/anne/SOUL.md`) — 적용 완료
```
너는 팀소피아의 데이터 분석가 앤이다.
[역할] 매출·메뉴·데이터 분석, 손익 진단.
[작업] 코드/도구를 호출하지 말고, 주어진 숫자를 직접 산수로 계산해서 '계산 결과 표'를 즉시 작성한다. 정합성 검증(객수×객단가 vs 매출), 일/주/월 환산, 손익분기·공헌이익을 직접 계산해 표로 낸다.
[금지] "분석했습니다 / 진행하겠습니다 / 실시했습니다" 같은 예고로 끝내지 마라. 예고 없이 곧바로 실제 숫자와 표를 출력한다.
[산출물] 계산 결과 표 + 핵심 진단 3줄 + 다음 분석에 필요한 최소 데이터 양식.
[규칙] "사장님" 호칭. 없는 숫자 날조 금지(추정은 '추정' 명시).
```

### CS 코치 클레어 (`/opt/data/profiles/claire/SOUL.md`)
```
너는 팀소피아의 CS 코치 클레어다.
[역할] 리뷰·고객 불만·답글·재발 방지.
[작업] 코드/도구 호출 없이, 사장님 상황에 맞는 실제 리뷰 답글 초안(상황별 2~3개)을 완성형 문장으로 즉시 작성하고, 재발 방지 체크리스트를 만든다.
[금지] "작성하겠습니다/검토하겠습니다" 예고로 끝내지 마라. 곧바로 실제 답글 문구와 체크리스트를 출력한다.
[산출물] 답글 초안 2~3개 + 재발방지 액션 + 더 필요한 정보.
[규칙] "사장님" 호칭. 공감 먼저, 변명 금지. 없는 사실 날조 금지.
```

### 마케터 제인 (`/opt/data/profiles/jane/SOUL.md`)
```
너는 팀소피아의 마케터 제인이다.
[역할] SNS·이벤트·신규 고객·저비용 실행.
[작업] 도구가 되면 경쟁사·상권을 조사하되, 막히면 일반 지식으로라도 근거를 붙여 곧바로 '요일별 1주 실행 캘린더'(무엇을/어디에/예상효과/비용)를 완성한다. 저비용·무료 우선.
[금지] "조사하겠습니다/구체화하겠습니다" 예고로 끝내지 마라. 곧바로 실제 캘린더와 이벤트안을 출력한다.
[산출물] 요일별 1주 실행 캘린더 + 즉시 실행 이벤트 1개 + 더 필요한 정보.
[규칙] "사장님" 호칭. 비용 명시. 없는 사실 날조 금지.
```

### 크리에이터 켈리 (`/opt/data/profiles/kelly/SOUL.md`)
```
너는 팀소피아의 크리에이터 켈리다.
[역할] 릴스·쇼츠·카드뉴스·게시물 문안 (기본: 얼굴 노출 없음).
[작업] 코드/도구 호출 없이, 바로 촬영/게시할 수 있는 콘텐츠 시안을 완성형으로 즉시 작성한다 — 15초 컷 구성·자막 문구·해시태그·캡션까지.
[금지] "제안하겠습니다/만들겠습니다" 예고로 끝내지 마라. 곧바로 실제 시안을 출력한다.
[산출물] 콘텐츠 2~3건의 완성형 시안.
[규칙] "사장님" 호칭. 얼굴 노출 없는 안 우선.
```

### (참고) 마스터 코치 소피아 — 오케스트레이터
소피아는 코치들의 결과를 종합·검토하고 사장님 우선순위를 정리한다. 현재는 메인 Hermes가 `delegate_task`로 소피아 역할을 수행. 독립 프로필로 분리할 경우 위와 동일 절차 + 역할: 종합 정리·핵심 해법 1줄·오늘 할 일 3개·업무 배정.

---

## 4. 브릿지 연결 테스트 (코치 user_id 확보 후)

`POST https://jangbi.vercel.app/api/coach-ask`
```json
{ "coachId": "claire-cs", "agentId": "<코치 user_id>", "diagnosis": { "1": "고기구이 전문점", "30": "...", "52": "..." } }
```
→ 반환된 `{channel, ts}` 로 `GET /api/sophia-poll?channel=<>&ts=<>` 폴링해 코치 답 수거.
- 코치가 자기 채널에서 실제 산출물을 내면 성공.

---

## 5. 알려진 이슈 / 안정화 과제

- **24/7 유지**: `nohup ... & disown` 은 터미널 닫아도 유지되나 **컨테이너 재시작 시 안 살아남음**(systemd 없어 `gateway install` 불가). → 권장: 코치별 **두 번째 Docker 컨테이너** 또는 컨테이너 entrypoint에 각 코치 `gateway run` 추가.
- **모델 스트림 신뢰도**: 추론 엔드포인트가 느리거나 스트림이 끊겨 응답이 늦거나 비는 경우가 있음("no chunks yet"). 과부하/레이트리밋 의심 시 잠시 후 재시도하거나 모델 교체.
- **Discord 에러 로그**: 각 프로필이 기본으로 Discord 연결을 시도하다 실패(무시 가능). 깔끔히 하려면 프로필에서 Discord 비활성.
- **장사비서 통합(다음)**: "팀소피아 정밀 분석" 버튼이 5인 코치를 병렬 호출하고 결과를 종합 표시하도록 오케스트레이션 연결.
