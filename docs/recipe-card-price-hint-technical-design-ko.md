# 기술 설계: 웹 MVP + Supabase 백엔드 + Expo 앱 확장

생성일: 2026-05-21  
기준 문서: `docs/recipe-card-price-hint-design-ko.md`  
상태: DRAFT  

## 0. 결정 요약

현재 추천 형태:

- 1단계: 웹 MVP를 먼저 만든다.
- 2단계: 같은 Supabase 백엔드 위에 Expo 앱을 추가한다.
- 핵심 가치는 "저장한 레시피를 실제로 해먹게 만드는 것"이다.
- 웹과 앱을 동시에 완성하려 하지 않는다.

선택 스택:

- Web: Next.js + React + TypeScript
- Repository: pnpm workspace + Turborepo monorepo
- Backend/DB/Auth: Supabase
- Database: Supabase Postgres
- Authorization: Supabase Row Level Security
- Server-side work: Supabase Edge Functions
- LLM parsing: OpenAI Structured Outputs
- YouTube metadata: YouTube Data API `videos.list(part=snippet,contentDetails)`
- 가격 힌트: 초기에는 mock 또는 낮은 정밀도 신호, 정책 확인 후 Coupang API 연동
- Phase 2 Mobile App: Expo + React Native + TypeScript

원칙:

- repo는 `apps/web`, `packages/shared`, `packages/config`, `supabase`로 시작한다.
- `apps/mobile`은 Expo 앱을 시작할 때 추가한다.
- Supabase 백엔드는 처음부터 웹/앱 공용으로 설계한다.
- OpenAI, YouTube, Coupang 호출은 Supabase Edge Functions에서만 한다.
- Supabase publishable key는 클라이언트에 둘 수 있지만, secret/service role key는 절대 노출하지 않는다.
- 모든 사용자 데이터 테이블은 RLS를 켠다.
- 웹 MVP에서 행동 검증이 되기 전까지 Expo 앱은 만들지 않는다.

공식 문서 근거:

- Supabase Edge Functions secret은 함수 환경에서 읽고, secret key는 브라우저/앱에 노출하면 안 된다: https://supabase.com/docs/guides/functions/secrets
- Turborepo는 task output cache로 반복 build/test 작업을 줄이는 데 적합하다: https://turborepo.com/docs/core-concepts/caching
- pnpm workspace는 root의 `pnpm-workspace.yaml`로 workspace package를 정의한다: https://pnpm.io/workspaces
- Expo는 workspace 기반 monorepo를 공식 지원하며, `apps/*`, `packages/*` 구조를 안내한다: https://docs.expo.dev/guides/monorepos/
- Supabase Expo React Native quickstart는 Expo 앱에서 `@supabase/supabase-js`, `react-native-url-polyfill`, `expo-sqlite` 조합을 안내한다: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
- Supabase Auth는 React Native/Expo에서 session persistence를 지원한다: https://supabase.com/docs/guides/auth/quickstarts/react-native
- YouTube `videos.list`는 `snippet.description`을 가져올 수 있고 quota cost는 1 unit이다: https://developers.google.com/youtube/v3/docs/videos/list
- OpenAI Structured Outputs는 JSON Schema 준수를 보장하므로 레시피 파싱에 JSON mode보다 적합하다: https://platform.openai.com/docs/guides/structured-outputs

## 1. 왜 웹 먼저인가

웹의 역할:

- 링크 저장과 레시피 파싱 검증이 쉽다.
- 5-10명 사용자에게 배포하고 피드백 받기 쉽다.
- 설치 장벽 없이 "이게 실제로 쓸 만한가"를 빠르게 확인할 수 있다.
- 파싱 결과 검토/수정 같은 입력 중심 UX를 만들기 좋다.

앱의 역할:

- 반복 사용에 강하다.
- 요리 중 레시피 확인, 저장 레시피 재방문, 추천 확인에 적합하다.
- 추후 push notification, 공유 시트, cooking mode 같은 기능을 붙이기 좋다.

결론:

- 웹은 가치 검증용 첫 제품이다.
- 앱은 검증된 행동을 더 자주 일어나게 만드는 확장 제품이다.
- 그래서 백엔드는 처음부터 앱 확장 가능하게 만들고, 프론트는 웹만 먼저 만든다.

## 2. 시스템 아키텍처

```text
Phase 1: Web MVP

Next.js Web App
  location: apps/web
  |
  +-- Routes
  |     - /: 추천 홈
  |     - /recipes/new: 링크 붙여넣기
  |     - /recipes/[id]/review: 파싱 결과 검토/수정
  |     - /recipes: 저장된 레시피 목록과 검색
  |     - /recipes/[id]: 레시피 카드
  |
  +-- Supabase Client
        |
        +-- Auth
        +-- Postgres queries with RLS
        +-- Edge Function invoke
              |
              +-- import-recipe
              |     +-- YouTube Data API
              |     +-- Web fetch
              |     +-- OpenAI Structured Outputs
              |
              +-- refresh-price-hints
              |     +-- mock data first
              |     +-- Coupang API after policy check
              |
              +-- generate-recommendations
                    +-- Postgres recipe + price_hint data

Supabase
  location: supabase
  |
  +-- Auth
  +-- Postgres
  +-- RLS Policies
  +-- Edge Functions
  +-- Secrets


Phase 2: Mobile App

Expo React Native App
  location: apps/mobile
  |
  +-- same Supabase project
  +-- same Auth
  +-- same Postgres schema
  +-- same Edge Functions
  +-- app-specific UI
        - Home
        - RecipeDetail
        - CookingMode
        - Notifications later
```

왜 Edge Functions가 필요한가:

- 웹/앱 클라이언트에 OpenAI/YouTube/Coupang 키를 넣으면 추출될 수 있다.
- 외부 URL fetch는 SSRF 위험이 있다.
- LLM prompt injection 방어와 schema validation은 서버에서 해야 한다.
- 가격 힌트 산정은 나중에 캐싱/재시도/관측 가능성이 필요하다.

Monorepo를 쓰는 이유:

- 웹 MVP 이후 Expo 앱을 붙일 계획이 확정되어 있다.
- 레시피 타입, URL validation, 추천 점수 계산은 웹과 앱이 공유할 가능성이 높다.
- 지금 repo가 비어 있어 나중에 옮기는 비용보다 초기에 구조를 잡는 비용이 낮다.
- Turborepo는 여러 app/package의 lint, test, build를 캐싱하고 병렬 실행하는 용도로만 쓴다.

Monorepo로 인해 하지 않을 것:

- 1단계에서 Expo 앱을 미리 만들지 않는다.
- 모든 코드를 무리하게 shared package로 빼지 않는다.
- 처음에는 `packages/shared`에 순수 TypeScript 타입/validation/scoring만 둔다.
- UI 컴포넌트 공유는 웹 MVP 검증 전까지 하지 않는다.

## 3. 웹과 앱의 서비스 형태

웹 MVP에서 반드시 해야 하는 일:

- 로그인
- 레시피 링크 저장
- 링크에서 레시피 카드 초안 생성
- 사용자가 파싱 결과 검토/수정
- 저장된 레시피 목록과 상세 보기
- 저장된 레시피 검색
- "이번 주 해먹기 좋은 저장 레시피" 추천
- 가격 힌트가 실패해도 레시피 저장은 성공

앱에서 나중에 강화할 일:

- 저장된 레시피 빠른 재방문
- 요리 중 보기 좋은 cooking mode
- 장보기/요리 타이밍에 맞춘 알림
- 모바일 공유 시트로 레시피 저장
- 반복 사용을 높이는 홈 추천

중요한 판단:

- 웹에도 가치가 있다. 다만 웹의 가치는 "처음 쓰게 만들고 검증하는 것"에 더 가깝다.
- 앱의 가치는 "계속 쓰게 만드는 것"에 더 가깝다.
- 둘은 같은 제품이지만, 첫 출시에서 같은 깊이로 만들 필요는 없다.

## 4. 데이터 모델

### profiles

Supabase Auth의 `auth.users`를 직접 확장하지 않고 public profile 테이블을 둔다.

```sql
profiles
- id uuid primary key references auth.users(id)
- display_name text
- created_at timestamptz
- updated_at timestamptz
```

### recipes

```sql
recipes
- id uuid primary key
- user_id uuid references auth.users(id)
- title text not null
- source_url text not null
- source_type text check in ('youtube', 'web')
- source_video_id text
- thumbnail_url text
- servings text
- status text check in ('importing', 'needs_review', 'saved', 'failed')
- parse_confidence numeric
- failure_reason text
- created_at timestamptz
- updated_at timestamptz
```

### ingredients

```sql
ingredients
- id uuid primary key
- recipe_id uuid references recipes(id)
- raw_text text not null
- normalized_name text
- amount_value numeric
- amount_unit text
- importance text check in ('primary', 'secondary', 'seasoning')
- created_at timestamptz
- updated_at timestamptz
```

### recipe_steps

```sql
recipe_steps
- id uuid primary key
- recipe_id uuid references recipes(id)
- position int not null
- body text not null
- created_at timestamptz
- updated_at timestamptz
```

### parsed_sources

```sql
parsed_sources
- id uuid primary key
- recipe_id uuid references recipes(id)
- parser_type text check in ('youtube_description', 'webpage_llm')
- raw_excerpt text
- model_name text
- schema_version text
- confidence numeric
- warnings jsonb
- created_at timestamptz
```

### price_hints

```sql
price_hints
- id uuid primary key
- ingredient_id uuid references ingredients(id)
- provider text default 'mock'
- query text
- matched_product_name text
- matched_product_url text
- unit_price numeric
- unit text
- price_band text check in ('cheap', 'normal', 'expensive', 'unknown')
- confidence text check in ('high', 'medium', 'low')
- checked_at timestamptz
- created_at timestamptz
```

### recommendations

```sql
recommendations
- id uuid primary key
- recipe_id uuid references recipes(id)
- user_id uuid references auth.users(id)
- reason text not null
- score numeric
- price_hint_summary text
- confidence text check in ('high', 'medium', 'low')
- generated_at timestamptz
```

## 5. RLS 정책

모든 사용자 데이터 테이블은 RLS를 켠다.

기본 원칙:

```sql
-- recipes 예시
select/update/delete/insert 허용 조건:
auth.uid() = user_id

-- ingredients, steps, parsed_sources, price_hints
소속 recipe의 user_id = auth.uid()

-- recommendations
auth.uid() = user_id
```

주의:

- Edge Function에서 service role/secret key를 쓰면 RLS를 우회할 수 있다.
- 유저 소유 데이터 수정은 가능하면 사용자 JWT를 전달한 Supabase client로 수행한다.
- 관리자 권한이 필요한 작업만 secret key client를 사용하고, 그 경우 user_id를 명시적으로 검증한다.

## 6. 상태 머신

```text
              ┌─────────────┐
              │ importing   │
              └──────┬──────┘
                     │ parse ok
                     v
              ┌─────────────┐
              │ needs_review│
              └──────┬──────┘
                     │ user confirms
                     v
              ┌─────────────┐
              │ saved       │
              └─────────────┘

importing ── parse failed ──▶ failed
failed ── retry ──▶ importing
needs_review ── user edits ──▶ needs_review
saved ── user edits ──▶ saved
```

금지 전이:

- `importing -> saved`: 사용자 검토 없이 저장 금지
- `failed -> saved`: 실패 결과 저장 금지
- `saved -> importing`: 재파싱은 별도 `reimport` 액션으로만 처리

## 7. Edge Function 설계

### import-recipe

입력:

```json
{ "url": "https://..." }
```

출력:

```json
{
  "recipeId": "uuid",
  "status": "needs_review",
  "warnings": []
}
```

흐름:

```text
Next.js Web App
  |
  v
supabase.functions.invoke('import-recipe', { url })
  |
  v
Edge Function
  |
  +-- verify JWT
  +-- validate URL
  +-- create recipes row: importing
  +-- resolve source
  +-- fetch source text
  +-- parse via OpenAI Structured Outputs
  +-- insert ingredients + steps + parsed_sources
  +-- update recipe: needs_review or failed
  |
  v
Web app redirects to review page
```

### refresh-price-hints

입력:

```json
{ "recipeId": "uuid" }
```

흐름:

```text
verify recipe ownership
  |
  v
select primary ingredients max 3
  |
  v
get price signal
  |
  +-- Phase 1: mock or static fixture
  +-- Phase 1.5: Coupang API after policy check
  |
  v
upsert price_hints
```

가격 힌트 실패는 recipe 저장 실패가 아니다.

### generate-recommendations

입력 없음 또는 `{ "limit": 10 }`

흐름:

```text
select saved recipes for user
  |
  v
join latest price_hints
  |
  v
score = price_signal + recency + favorite - low_confidence_penalty
  |
  v
upsert recommendations
```

MVP에서는 웹 홈 진입 시 호출하거나, 레시피 저장 직후 호출한다. cron 기반 자동 갱신은 후속 범위다.

## 8. 웹 화면 설계

```text
HomePage /
  |
  +-- RecommendationSection
  |     +-- recommended recipe cards
  |     +-- empty state: "레시피를 먼저 저장해보세요"
  |     +-- fallback: "가격 정보 없이 최근 저장순"
  |
  +-- RecentRecipes

NewRecipePage /recipes/new
  |
  +-- URL input
  +-- submit button
  +-- loading/progress state
  +-- validation error state

ReviewRecipePage /recipes/[id]/review
  |
  +-- parsed title
  +-- ingredients editor
  +-- steps editor
  +-- parse confidence/warnings
  +-- confirm save

RecipeListPage /recipes
  |
  +-- saved recipe list
  +-- search input
  +-- status filter
  +-- empty state

RecipeDetailPage /recipes/[id]
  |
  +-- ingredients
  +-- steps
  +-- price hints
  +-- original link
```

Phase 2 Expo 화면:

```text
HomeScreen
RecipeDetailScreen
CookingModeScreen
ImportFromShareSheet later
NotificationSettings later
```

## 9. 가격 힌트 산정 방식

가격 힌트는 계산서가 아니라 신호다.

MVP 규칙:

1. `importance = primary` 재료 최대 3개만 조회한다.
2. 초기에는 mock price hint로 추천 UX와 행동을 검증한다.
3. Coupang API 정책 확인 후 실제 검색 결과를 붙인다.
4. 단위 가격을 계산할 수 없으면 `unknown`.
5. band는 `cheap | normal | expensive | unknown`.
6. "최저가", "오늘이 가장 싸다", "총 재료비" 표현 금지.

초기에는 히스토리 데이터가 없으므로 `cheap` 판정을 보수적으로 한다.

```text
ingredient query
  |
  +-- no signal             -> unknown
  +-- unit parse failed     -> unknown
  +-- low confidence match  -> unknown
  +-- enough signal         -> cheap | normal | expensive
```

## 10. 추천 로직

```text
score =
  price_signal_score
  + recency_score
  + favorite_score
  - low_confidence_penalty
```

MVP 추천 이유:

- "돼지고기 가격이 최근보다 낮은 편이에요"
- "최근 저장한 레시피예요"
- "가격 정보는 부족하지만 최근 저장한 레시피예요"
- "주요 재료 가격 신뢰도가 낮아 참고만 해주세요"

저장 레시피가 3개 미만이면 추천 UX를 과장하지 않는다. 그냥 최근 저장 레시피와 "더 저장하면 추천이 좋아져요" 상태를 보여준다.

## 11. 에러 처리

| Codepath | Failure | 처리 | 사용자 메시지 |
|---|---|---|---|
| URL validation | 빈 문자열 | reject | 링크를 입력해주세요 |
| URL validation | URL 아님 | reject | 올바른 링크가 아니에요 |
| URL validation | private IP/localhost | reject | 지원하지 않는 링크입니다 |
| SourceResolver | 지원하지 않는 도메인 | reject | 아직 지원하지 않는 링크예요 |
| YouTube API | quota exceeded | failed | 잠시 후 다시 시도해주세요 |
| YouTube API | video not found | failed | 영상을 찾을 수 없어요 |
| Web fetch | timeout | retry 1회 후 failed | 페이지를 불러오지 못했어요 |
| OpenAI parser | schema error | retry 1회 후 failed | 레시피 분석에 실패했어요 |
| OpenAI parser | no recipe found | needs_review warning | 레시피 정보를 충분히 찾지 못했어요 |
| Price hint | unavailable | degrade | 가격 정보를 불러오지 못했어요 |
| Product match | low confidence | unknown | 가격 정보가 불확실해요 |
| Recommendation | no recipes | empty state | 레시피를 먼저 저장해보세요 |
| Recommendation | no price hints | fallback | 가격 정보 없이 최근 저장순으로 보여드려요 |

## 12. 보안 설계

필수 방어:

- SSRF: URL validation에서 `localhost`, private IP, non-http(s), file scheme 차단.
- XSS: 외부 HTML/LLM output을 raw HTML로 렌더링하지 않음.
- Prompt injection: 외부 문서의 지시는 따르지 않고 레시피 정보만 추출.
- IDOR: 모든 recipe/ingredient/price_hint/recommendation 접근은 RLS 또는 명시적 ownership check.
- Secret leakage: OpenAI/YouTube/Coupang/Supabase secret key는 Supabase Edge Function secrets에만 저장.
- Client key: 웹/앱에는 Supabase publishable key만 둔다.

Supabase secret 관리:

```text
supabase secrets set OPENAI_API_KEY=...
supabase secrets set YOUTUBE_API_KEY=...
supabase secrets set COUPANG_ACCESS_KEY=...
supabase secrets set COUPANG_SECRET_KEY=...
```

`.env` 파일은 git에 넣지 않는다.

## 13. 테스트 계획

추천 테스트 도구:

- Unit: Vitest
- Web component/integration: Testing Library
- Web E2E: Playwright
- Edge Function tests: Supabase local + mocked external APIs
- LLM eval: fixture 기반 golden tests
- Phase 2 App: React Native Testing Library + Maestro 또는 Detox

Coverage diagram:

```text
CODE PATHS
[+] import-recipe Edge Function
  ├── [GAP] valid YouTube URL -> needs_review
  ├── [GAP] valid web URL -> needs_review
  ├── [GAP] empty URL -> validation error
  ├── [GAP] unsupported URL -> validation error
  ├── [GAP] private IP URL -> validation error
  ├── [GAP] YouTube quota failure -> failed
  ├── [GAP] OpenAI malformed output -> retry then failed
  └── [GAP] no recipe -> needs_review warning

[+] refresh-price-hints Edge Function
  ├── [GAP] mock signal -> price_band
  ├── [GAP] no signal -> unknown
  ├── [GAP] unit parse failed -> unknown
  └── [GAP] provider timeout -> graceful degradation

[+] generate-recommendations Edge Function
  ├── [GAP] price hints exist -> ranked recommendations
  ├── [GAP] no price hints -> recency fallback
  ├── [GAP] no recipes -> empty state
  └── [GAP] low confidence -> warning reason

[+] RLS policies
  ├── [GAP] user can CRUD own recipes
  ├── [GAP] user cannot read another user's recipe
  └── [GAP] user cannot update another user's price hints

USER FLOWS
[+] Link import
  ├── [GAP] [E2E] paste YouTube link -> review -> save -> card
  ├── [GAP] [E2E] paste invalid link -> clear error
  ├── [GAP] [E2E] parser partial result -> user edits -> save
  └── [GAP] [E2E] double submit -> one recipe only

[+] Home recommendations
  ├── [GAP] [E2E] saved recipes show recommended cards
  ├── [GAP] [E2E] zero recipes shows onboarding empty state
  └── [GAP] [E2E] price unavailable still shows recipes
```

Ship-blocking tests:

1. URL validation rejects empty, invalid, private IP, unsupported schemes.
2. YouTube fixture parses title/description into recipe draft.
3. OpenAI Structured Output fixture returns schema-valid recipe.
4. Malformed LLM response does not create saved recipe.
5. Price hint failure does not block recipe save.
6. Recommendation fallback works without price hints.
7. RLS blocks cross-user recipe access.
8. E2E: paste link -> review -> edit -> save -> view card.

## 14. 성능 설계

금지:

- Home 화면에서 Coupang API 직접 호출.
- 웹/앱에서 OpenAI/YouTube/Coupang 직접 호출.
- 레시피 목록에서 ingredients/price_hints를 N+1로 조회.
- 검색할 때 모든 레시피를 클라이언트로 가져와 필터링.
- 사용자가 저장 버튼을 누른 뒤 모든 가격 힌트가 끝날 때까지 대기.

권장:

- `recipes(user_id, created_at)` index.
- `recipes(user_id, title)` index 또는 간단한 text search.
- `ingredients(recipe_id)` index.
- `price_hints(ingredient_id, checked_at)` index.
- `recommendations(user_id, score, generated_at)` index.
- price hints는 저장 후 lazy refresh.
- recommendations는 캐시된 DB 결과를 보여주고 필요할 때 갱신.

## 15. 구현 순서

1. Monorepo scaffold
   - pnpm workspace
   - Turborepo
   - root package scripts

2. Next.js web scaffold
   - `apps/web`
   - TypeScript
   - Supabase client
   - env 설정
   - 기본 라우팅

3. Shared package scaffold
   - `packages/shared`
   - recipe types
   - URL validation
   - recommendation scoring

4. Supabase foundation
   - migrations
   - RLS policies
   - local Supabase dev setup
   - test fixtures

5. Web Auth + protected routes
   - email OTP 로그인
   - session 처리
   - 로그인 필요 페이지 보호

6. Recipe CRUD
   - list/detail
   - title/source URL 기반 검색
   - manual create/edit path
   - RLS verification

7. import-recipe Edge Function
   - URL validation
   - YouTube fetch
   - web fetch
   - OpenAI parser
   - needs_review flow

8. Review/save UX
   - parsed recipe editor
   - confirm save
   - failure states

9. Price hints
   - mock price hints first
   - refresh-price-hints Edge Function
   - unknown fallback
   - UI labels

10. Recommendations
   - generate-recommendations Edge Function
   - Home cards
   - empty/fallback states

11. E2E + observability
   - import flow
   - recommendation flow
   - structured function logs

12. Expo app expansion
   - validation metrics 확인 후 시작
   - same Supabase project 사용
   - Home/RecipeDetail/CookingMode부터 구현

## 16. 병렬화 전략

초기 scaffold와 Supabase schema 전에는 병렬화하지 않는다.

```text
Phase 1: scaffold + Supabase schema 단독

Phase 2 병렬 가능:
  Lane A: Web Auth + protected routes
  Lane B: DB/RLS tests + fixtures
  Lane C: UI mock pages

Phase 3 병렬 가능:
  Lane D: import-recipe Edge Function
  Lane E: Recipe CRUD + review/save UX

Phase 4:
  Lane F: PriceHintService
  Lane G: RecommendationService

Phase 5:
  E2E + QA

Phase 6:
  Expo app scaffold after validation
```

충돌 주의:

- Lane D와 E 모두 recipe schema를 건드릴 수 있으니 schema 변경은 Phase 1에서 잠근다.
- Edge Function과 UI가 동시에 API response shape을 바꾸면 충돌한다. JSON schema를 먼저 고정한다.
- Expo 앱은 같은 Supabase schema를 쓰므로, 앱 시작 전 웹 MVP schema를 안정화한다.

## 17. NOT in scope

1단계 웹 MVP에서 제외:

- Expo 앱 전체 구현
- 앱스토어/플레이스토어 출시
- push notification
- 모바일 공유 시트
- 냉장고 재료 관리
- 정확한 총 재료비
- 자동 장보기 리스트
- 결제
- 소셜 공유
- 브라우저 확장

제외 이유:

- 초기 목표는 5-10명에게 "저장한 레시피를 다시 열고 실제로 해먹는가"를 검증하는 것이다.
- 앱/웹을 동시에 만들면 검증 전에 구현량이 커진다.
- 가격 힌트의 신뢰도가 검증되기 전에는 장보기/결제 기능으로 확장하면 위험하다.

## 18. 앱 전환 기준

Expo 앱은 아래 조건 중 다수가 충족된 뒤 시작한다.

- 5명 이상이 각자 실제 저장 레시피 5개 이상을 넣었다.
- 3명 이상이 7일 안에 다시 들어와 추천/저장 레시피를 확인했다.
- 2명 이상이 가격 힌트 또는 추천 이유가 의사결정에 도움이 됐다고 말했다.
- 웹에서 링크 import -> review -> save 흐름이 큰 설명 없이 작동했다.
- "앱이면 더 자주 쓸 것 같다"는 피드백이 2명 이상에게서 나왔다.

앱 시작 시 첫 범위:

- Home
- RecipeDetail
- CookingMode
- Supabase Auth 연동
- 기존 저장 레시피 읽기

앱 시작 시에도 제외:

- push notification
- 공유 시트
- 오프라인 모드
- 장보기 리스트

## 19. 남은 결정

구현 전에 확정할 것:

1. Next.js 배포 플랫폼: Vercel을 기본값으로 둘지.
2. Supabase Auth 방식: email OTP, magic link, Google 중 무엇부터 할지.
3. Edge Function을 동기 호출로 시작할지, `importing` 상태 + polling으로 시작할지.
4. OpenAI 모델과 schema version.
5. Coupang API 정책상 가격 표시/추적이 허용되는지.
6. 가격 힌트 MVP에서 mock data로 먼저 행동 검증할지.
7. Expo 앱 시작 기준을 위 validation metric으로 확정할지.

추천 기본값:

- Monorepo: pnpm workspace + Turborepo.
- Web deploy: Vercel.
- Auth: email OTP부터 시작. Google/Apple은 후속.
- Import: `importing` 상태는 처음부터 둔다. 내부 처리는 동기 Edge Function으로 시작하되 timeout 대응을 준비한다.
- LLM: Structured Outputs 지원 모델.
- Price hints: 정책 확인 전에는 mock price hints로 UI/행동 검증.
- Expo: 웹 MVP 검증 후 시작.
