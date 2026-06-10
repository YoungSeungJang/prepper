# 구현 계획: 레시피 카드 + 가격 힌트 웹 MVP

생성일: 2026-05-21  
기준 문서:

- `docs/recipe-card-price-hint-design-ko.md`
- `docs/recipe-card-price-hint-technical-design-ko.md`

## 0. 목표

첫 구현 목표는 **모바일에서 쓰기 좋은 웹 MVP**를 만드는 것이다.

사용자는 다음 흐름을 완성할 수 있어야 한다.

1. 로그인한다.
2. 레시피 링크를 붙여넣는다.
3. 레시피 카드 초안을 확인하고 수정한다.
4. 저장된 레시피 카드에서 재료와 조리 순서를 본다.
5. 저장된 레시피를 검색한다.
6. 홈에서 "이번 주 해먹기 좋은 저장 레시피" 추천을 본다.
7. 주요 재료 가격 힌트를 참고한다.

이번 구현에서 하지 않는 것:

- Expo 앱
- 앱스토어/플레이스토어 출시
- push notification
- 모바일 공유 시트
- 정확한 총 재료비 계산
- 실제 Coupang 가격 추적
- 냉장고/재고 관리
- 장보기 리스트
- 결제
- 소셜 기능

## 진행 상황

마지막 업데이트: 2026-06-10

| Task | 상태 | 메모 |
|---|---|---|
| Task 1. Monorepo 생성 | 완료 | `pnpm workspace`, `Turborepo`, `packages/shared`, 기본 디렉토리 생성 완료 |
| Task 2. Next.js 웹앱 생성 | 완료 | `apps/web` 생성, Supabase/Zod/test tooling 설치, env 검증 파일 추가 |
| Task 3. Shared package 생성 | 완료 | recipe type, URL validation, recommendation scoring, shared 테스트 9개 추가 |
| Task 4. Supabase DB schema와 RLS 작성 | 구현 완료 / DB 적용 검증 보류 | migration SQL, index, trigger, RLS policy 작성 완료. Docker/Supabase CLI 미설치로 `supabase db reset`은 미실행 |
| 화면 우선 작업 | 완료 | mock 데이터 기반 홈, 목록, 추가, 상세, 검토, 로그인 화면 구현 |
| UI 디자인 리뷰 및 모바일 우선 개선 | 완료 | 앱형 추천 패널, 활성 내비게이션, 폰트/팔레트, 상세/목록 정보 구조 개선 |
| Task 5. Supabase Auth 연결 | 구현 완료 / 실제 이메일 검증 필요 | Supabase browser/server client, Magic Link 로그인, 콜백 라우트, 로그아웃, 보호 라우팅 구현 |
| Task 6. URL 검증 로직 웹 연결 | 구현 완료 / 로그인 세션 수동 확인 필요 | `/recipes/new` submit action, shared URL validation 재사용, 에러 표시, mock review 이동 구현 |
| Task 7. 수동 레시피 CRUD | 구현 완료 / Supabase migration 적용 후 수동 확인 필요 | 검토 화면 저장 action, recipes/ingredients/recipe_steps insert, 목록/상세 DB 조회 연결 |
| Task 8-1. DB 기반 import/review 초안 | 구현 완료 / Supabase 수동 확인 필요 | URL 입력 시 `needs_review` 초안 생성, review 화면 DB 초안 조회, 저장 시 기존 초안 `saved` 업데이트 |
| Task 8-2. 기본 파싱 연결 | 구현 완료 / 실 URL 품질 확인 필요 | 웹 JSON-LD Recipe 파싱, HowToSection/한국어 섹션 fallback, HTML title fallback, YouTube oEmbed title |
| Task 8-3. 파싱 실패/품질 처리 | 구현 완료 / 실 URL 품질 확인 필요 | 제목만 가져온 초안, 유튜브 제목-only 초안, fetch 실패 fallback에 review 경고 표시 |
| Task 8-4. 실제 파서 1차 연결 | 구현 완료 / API 키 입력 후 실 URL 확인 필요 | YouTube API description 수집, 일반 웹 본문 추출, OpenAI Structured Outputs 기반 LLM 파싱 |

완료된 검증:

- `pnpm lint`: 통과
- `pnpm build`: 통과
- `pnpm typecheck`: 통과
- `pnpm test`: 통과
- `pnpm --filter @prepper/shared test`: 통과, 9 tests
- `pnpm --filter web lint`: 통과
- `pnpm --filter web typecheck`: 통과
- `pnpm --filter web test`: 통과
- 기본 import 파싱 유틸 테스트: 통과. JSON-LD Recipe, HowToSection, 한국어 재료/조리순서 섹션 fallback 포함
- import 품질 경고 유틸 테스트: 통과. 제목-only, YouTube metadata-only 초안 경고 포함
- LLM 입력용 웹 본문 추출 유틸 테스트: 통과
- 수동 레시피 CRUD 유틸 테스트: 통과
- URL 검증 유틸 테스트: 통과
- 비로그인 `/recipes` 접근: `/login?next=/recipes` 리다이렉트 확인
- Playwright 화면 캡처: 홈, 저장함, 상세 화면을 모바일/데스크톱에서 확인
- `supabase db reset`: 미실행, 현재 머신에 Docker와 Supabase CLI 없음

## 1. 구현 원칙

- 웹 MVP를 먼저 만든다.
- repo 구조는 pnpm workspace + Turborepo monorepo로 시작한다.
- Supabase 백엔드는 나중에 Expo 앱도 함께 쓸 수 있게 설계한다.
- OpenAI, YouTube, Coupang 같은 외부 API 키는 클라이언트에 넣지 않는다.
- 모든 사용자 데이터는 Supabase RLS로 보호한다.
- 가격 힌트는 정확한 계산서가 아니라 메뉴 선택을 돕는 신호로 다룬다.
- 첫 구현에서는 실제 Coupang 연동 대신 mock price hint로 행동을 검증한다.
- "완벽한 파싱"보다 `링크 -> 검토 -> 저장 -> 다시 열기` 흐름을 먼저 완성한다.

## 2. 기술 스택

- Web: Next.js App Router + React + TypeScript
- Monorepo: pnpm workspace + Turborepo
- Backend: Supabase
- Database: Supabase Postgres
- Auth: Supabase Auth
- Authorization: Supabase Row Level Security
- Server-side work: Supabase Edge Functions
- Unit test: Vitest
- Component/integration test: Testing Library
- E2E test: Playwright
- Phase 2 Mobile App: Expo + React Native

## 3. 목표 파일 구조

```text
apps/
  web/
    app/
      layout.tsx
      page.tsx
      login/page.tsx
      recipes/page.tsx
      recipes/new/page.tsx
      recipes/[id]/page.tsx
      recipes/[id]/review/page.tsx
    components/
      recipe-card.tsx
      recipe-form.tsx
      recipe-search.tsx
      recommendation-list.tsx
    lib/
      env.ts
      supabase/
        browser.ts
        server.ts
      recipes/
        queries.ts

  mobile/
    나중에 Expo 앱 시작 시 추가

packages/
  shared/
    src/
      recipes/
        types.ts
        validation.ts
      recommendations/
        scoring.ts
  config/
    typescript/
    eslint/

supabase/
  migrations/
    202605210001_initial_schema.sql
  functions/
    import-recipe/index.ts
    refresh-price-hints/index.ts
    generate-recommendations/index.ts

tests/
  e2e/
    recipe-flow.spec.ts

apps/web/tests/
  unit/
    recipe-queries.test.ts

packages/shared/tests/
  unit/
    url-validation.test.ts
    recommendation-scoring.test.ts
```

역할:

- `apps/web/**`: Next.js 웹 MVP
- `apps/mobile/**`: Expo 앱이 검증 후 들어올 자리
- `apps/web/app/**`: 페이지, 라우팅, 서버 컴포넌트 진입점
- `apps/web/components/**`: 웹 전용 UI
- `apps/web/lib/supabase/**`: Supabase client 생성
- `apps/web/lib/recipes/**`: 웹의 DB helper
- `packages/shared/**`: 웹과 앱이 공유할 타입, validation, 추천 점수 계산
- `packages/config/**`: 공통 TypeScript/ESLint 설정
- `supabase/migrations/**`: DB schema, index, RLS policy
- `supabase/functions/**`: 서버에서만 실행해야 하는 import/price/recommendation 로직
- `tests/e2e/**`: 브라우저 흐름 테스트
- `apps/web/tests/**`: 웹 전용 테스트
- `packages/shared/tests/**`: 공유 로직 단위 테스트

## 4. 구현 단계 요약

| 순서 | 상태 | 작업 | 산출물 | 검증 |
|---|---|---|---|---|
| 1 | 완료 | Monorepo 생성 | pnpm workspace + Turborepo | `pnpm lint`, `pnpm build` |
| 2 | 완료 | Next.js 웹앱 생성 | `apps/web` | `pnpm --filter web build` |
| 3 | 완료 | Shared package 생성 | `packages/shared` | shared unit test 통과 |
| 4 | 구현 완료 / 검증 보류 | Supabase schema/RLS 작성 | migration SQL | `supabase db reset`은 Docker/Supabase CLI 설치 후 필요 |
| 5 | 구현 완료 / 실제 이메일 검증 필요 | Auth 연결 | Magic Link 로그인 | 로그인 링크 발송/콜백, 보호 라우팅 |
| 6 | 구현 완료 / 로그인 세션 수동 확인 필요 | URL 검증 로직 | `/recipes/new` submit action | Vitest 통과, 로그인 후 폼 수동 확인 필요 |
| 7 | 구현 완료 / Supabase migration 적용 후 수동 확인 필요 | 수동 레시피 CRUD | 목록/상세/생성 | 저장 후 카드 보기 |
| 8 | 구현 완료 / API 키 입력 후 실 URL 확인 필요 | import/review 흐름 | DB 기반 review 초안 + YouTube API + 웹 LLM 파싱 | 실제 블로그/유튜브 링크 품질 확인 필요 |
| 9 | 대기 | mock price hint | 가격 힌트 섹션 | 가격 실패가 저장을 막지 않음 |
| 10 | 대기 | 추천 홈 | 추천 카드/empty state | 저장 레시피 추천 표시 |
| 11 | 대기 | E2E 테스트 | Playwright 테스트 | 핵심 흐름 통과 |
| 12 | 대기 | 배포 체크리스트 | `.env.example`, 배포 문서 | 첫 사용자 테스트 준비 |

## 5. 상세 구현 계획

### Task 1. Monorepo 생성

목표:

- pnpm workspace + Turborepo 기반 monorepo를 만든다.
- 웹앱은 `apps/web` 아래에 둔다.
- 공유 로직은 `packages/shared` 아래에 둔다.
- Expo 앱을 위한 `apps/mobile`은 지금 만들지 않는다.

생성/수정할 파일:

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `packages/shared/package.json`
- `packages/shared/src/index.ts`

작업:

```bash
corepack enable
pnpm init
pnpm add -D turbo typescript
mkdir -p apps packages/shared/src packages/config supabase/functions supabase/migrations tests/e2e
```

root `package.json` scripts:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck"
  }
}
```

`pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

`turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^test"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

검증:

```bash
pnpm lint
pnpm build
```

완료 기준:

- root에서 `pnpm` 명령을 쓴다.
- Turborepo가 root scripts를 위임한다.
- `apps/*`, `packages/*`가 workspace로 인식된다.

### Task 2. Next.js 웹앱 생성

목표:

- `apps/web`에 Next.js App Router 기반 웹앱을 만든다.
- TypeScript, ESLint, Tailwind, pnpm을 사용한다.
- 테스트 스크립트와 환경 변수 검증 파일을 추가한다.

작업:

```bash
pnpm create next-app apps/web --typescript --eslint --app --no-src-dir --tailwind --use-pnpm --import-alias "@/*"
pnpm --filter web add @supabase/ssr @supabase/supabase-js zod
pnpm --filter web add -D vitest @testing-library/react @testing-library/jest-dom jsdom playwright
```

추가할 파일:

- `apps/web/lib/env.ts`

검증:

```bash
pnpm --filter web lint
pnpm --filter web build
```

완료 기준:

- Next.js 기본 페이지가 빌드된다.
- `apps/web/lib/env.ts`가 public Supabase env를 검증한다.
- `apps/web/package.json`에 `test`, `test:watch`, `typecheck` 스크립트가 있다.

### Task 3. Shared package 생성

목표:

- 웹과 앱이 공유할 순수 TypeScript 로직을 `packages/shared`에 둔다.
- 첫 공유 대상은 레시피 타입, URL validation, 추천 점수 계산이다.
- UI 컴포넌트는 아직 공유하지 않는다.

생성할 파일:

- `packages/shared/package.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/recipes/types.ts`
- `packages/shared/src/recipes/validation.ts`
- `packages/shared/src/recommendations/scoring.ts`
- `packages/shared/tests/url-validation.test.ts`
- `packages/shared/tests/recommendation-scoring.test.ts`

검증:

```bash
pnpm --filter @prepper/shared test
pnpm --filter @prepper/shared typecheck
```

완료 기준:

- URL validation 테스트가 통과한다.
- 추천 점수 테스트가 통과한다.
- `apps/web`에서 `@prepper/shared`를 import할 수 있다.

### Task 4. Supabase DB schema와 RLS 작성

목표:

- 레시피, 재료, 조리 순서, 파싱 소스, 가격 힌트, 추천 데이터를 저장할 테이블을 만든다.
- 모든 사용자 데이터는 본인 데이터만 접근 가능해야 한다.

생성할 migration:

- `supabase/migrations/202605210001_initial_schema.sql`

필수 테이블:

- `profiles`
- `recipes`
- `ingredients`
- `recipe_steps`
- `parsed_sources`
- `price_hints`
- `recommendations`

핵심 컬럼:

```text
recipes
- id
- user_id
- title
- source_url
- source_type: youtube | web
- source_video_id
- thumbnail_url
- servings
- status: importing | needs_review | saved | failed
- parse_confidence
- failure_reason
- created_at
- updated_at

ingredients
- id
- recipe_id
- raw_text
- normalized_name
- amount_value
- amount_unit
- importance: primary | secondary | seasoning

recipe_steps
- id
- recipe_id
- position
- body

price_hints
- id
- ingredient_id
- provider
- price_band: cheap | normal | expensive | unknown
- confidence: high | medium | low
- checked_at

recommendations
- id
- recipe_id
- user_id
- reason
- score
- price_hint_summary
- confidence
- generated_at
```

필수 index:

- `recipes(user_id, created_at)`
- `recipes(user_id, title)`
- `ingredients(recipe_id)`
- `recipe_steps(recipe_id, position)`
- `price_hints(ingredient_id, checked_at)`
- `recommendations(user_id, score, generated_at)`

RLS 원칙:

- `profiles`: `auth.uid() = id`
- `recipes`: `auth.uid() = user_id`
- `ingredients`, `recipe_steps`, `parsed_sources`, `price_hints`: 연결된 recipe의 `user_id = auth.uid()`
- `recommendations`: `auth.uid() = user_id`

검증:

```bash
npx supabase start
npx supabase db reset
```

완료 기준:

- migration이 깨지지 않고 적용된다.
- 모든 사용자 데이터 테이블에 RLS가 켜져 있다.
- 다른 사용자의 recipe를 읽거나 수정할 수 없다.

### Task 5. Supabase Auth 연결

목표:

- Supabase client를 browser/server 용도로 분리한다.
- email magic link 방식으로 로그인한다.
- 로그인 후 `/recipes`로 이동한다.

생성할 파일:

- `apps/web/lib/supabase/browser.ts`
- `apps/web/lib/supabase/server.ts`
- `apps/web/app/login/page.tsx`

필수 UI:

- 이메일 입력
- 로그인 링크 받기 버튼
- 링크 발송 성공/실패 메시지
- 발송 성공/실패 메시지

검증:

```bash
pnpm --filter web lint
pnpm --filter web build
```

완료 기준:

- `/login`에서 이메일을 입력할 수 있다.
- Supabase Auth로 로그인 링크 요청이 간다.
- 메일 링크 클릭 후 `/auth/callback`에서 로그인 세션이 생성된다.
- 로그인한 사용자만 `/recipes`, `/recipes/new`, `/recipes/[id]`를 볼 수 있다.
- Supabase secret/service role key가 브라우저 코드에 들어가지 않는다.

### Task 6. 레시피 URL 검증 로직

목표:

- 링크 import 전에 위험하거나 잘못된 URL을 막는다.
- YouTube 링크와 일반 웹 링크를 구분한다.

생성할 파일:

- `packages/shared/src/recipes/types.ts`
- `packages/shared/src/recipes/validation.ts`
- `packages/shared/tests/url-validation.test.ts`
- `packages/shared/vitest.config.ts`

검증해야 할 케이스:

- 빈 문자열 거절
- URL이 아닌 값 거절
- `localhost`, `127.0.0.1`, private IP 거절
- `http`, `https` 외 scheme 거절
- YouTube URL이면 `sourceType = youtube`
- 일반 웹 URL이면 `sourceType = web`

검증:

```bash
pnpm --filter @prepper/shared test -- url-validation.test.ts
```

완료 기준:

- URL validation 테스트가 모두 통과한다.
- import flow에서 이 validation을 재사용할 수 있다.

### Task 7. 수동 레시피 CRUD 먼저 구현

목표:

- 외부 API 없이도 사용자가 레시피 카드를 만들고 볼 수 있게 한다.
- 이후 import parser가 붙어도 같은 저장 구조를 사용한다.

생성할 파일:

- `apps/web/lib/recipes/queries.ts`
- `apps/web/components/recipe-form.tsx`
- `apps/web/components/recipe-card.tsx`
- `apps/web/components/recipe-search.tsx`
- `apps/web/app/recipes/new/page.tsx`
- `apps/web/app/recipes/page.tsx`
- `apps/web/app/recipes/[id]/page.tsx`

필수 화면:

```text
/recipes/new
- 원본 링크 입력
- 제목 입력
- 재료 입력
- 조리 순서 입력
- 저장 버튼

/recipes
- 검색 입력
- 저장된 레시피 목록
- 빈 상태: "저장된 레시피가 없어요"

/recipes/[id]
- 제목
- 재료
- 조리 순서
- 원본 링크
```

검증:

```bash
pnpm --filter web lint
pnpm --filter web build
```

수동 확인:

1. 로그인한다.
2. `/recipes/new`에서 제육볶음 레시피를 수동 입력한다.
3. 저장한다.
4. `/recipes` 목록에 보이는지 확인한다.
5. 상세 페이지에서 재료, 조리 순서, 원본 링크가 보이는지 확인한다.

완료 기준:

- 수동 레시피 저장이 된다.
- 저장된 레시피를 검색할 수 있다.
- 다른 사용자의 레시피는 보이지 않는다.

### Task 8. 링크 import + review 흐름 구현

목표:

- 사용자가 URL을 붙여넣으면 레시피 초안이 생성된다.
- 초안은 바로 저장되지 않고 review 화면에서 확인 후 저장된다.
- 첫 버전은 서버 액션 기반 parser로 시작한다. Supabase Edge Function 분리는 배포/운영 단계에서 다시 판단한다.
- YouTube는 YouTube Data API `videos.list(part=snippet)`로 title/description을 가져온 뒤 LLM parser에 보낸다.
- 일반 웹/블로그는 JSON-LD를 주 경로로 믿지 않고, HTML에서 읽을 만한 본문 텍스트를 추출해 LLM parser에 보낸다.
- OpenAI API 키가 없거나 LLM 파싱이 실패하면 기존 비용 없는 fallback parser와 review warning을 사용한다.

생성/수정할 파일:

- `supabase/functions/import-recipe/index.ts`
- `apps/web/app/recipes/[id]/review/page.tsx`
- `apps/web/app/recipes/new/page.tsx`
- `apps/web/lib/recipes/queries.ts`
- `packages/shared/src/recipes/validation.ts`

Edge Function 역할:

```text
import-recipe
- JWT 확인
- URL validation
- recipes row 생성: importing
- mock parser 결과 생성
- ingredients, recipe_steps 생성
- recipes status를 needs_review로 변경
- recipeId 반환
```

review 화면 필수 UI:

- 제목 수정
- 재료 수정
- 조리 순서 수정
- parser warning 표시
- 저장하기 버튼

상태 전이:

```text
importing -> needs_review -> saved
importing -> failed
failed -> importing
```

검증:

```bash
pnpm --filter web lint
pnpm --filter web build
```

수동 확인:

1. `/recipes/new`에서 YouTube URL을 붙여넣는다.
2. review 화면으로 이동한다.
3. 제목/재료/순서를 수정한다.
4. 저장한다.
5. 상세 페이지에서 수정 결과가 보인다.

완료 기준:

- 사용자 검토 없이 `saved`가 되지 않는다.
- import 실패가 전체 앱을 깨뜨리지 않는다.
- double submit을 막는다.
- 구조화 데이터가 일부 다른 웹 페이지도 제목만 저장되지 않고 재료/순서 후보를 채운다.
- 제목만 가져온 초안은 review 화면에서 재료/조리순서 확인 경고를 보여준다.
- YouTube description 또는 일반 웹 본문에서 LLM parser가 재료/조리순서 초안을 만든다.

### Task 9. Mock 가격 힌트 구현

목표:

- 실제 Coupang 연동 없이 가격 힌트 UX를 검증한다.
- 가격 힌트 실패가 레시피 저장 실패로 이어지지 않게 한다.

생성/수정할 파일:

- `supabase/functions/refresh-price-hints/index.ts`
- `apps/web/app/recipes/[id]/page.tsx`
- `apps/web/lib/recipes/queries.ts`

초기 가격 힌트 규칙:

- 주요 재료 최대 3개만 대상으로 한다.
- 기본 provider는 `mock`이다.
- 표시 band는 `cheap | normal | expensive | unknown` 중 하나다.
- confidence는 대부분 `low` 또는 `medium`으로 시작한다.

사용자 문구:

```text
가격 힌트
가격 정보는 참고만 해주세요.
정확한 총 재료비가 아니라 메뉴 선택을 돕는 신호예요.
```

금지 문구:

- 오늘 최저가
- 지금 반드시 사야 함
- 총 재료비 8,732원
- 가장 싸다

검증:

```bash
pnpm --filter web lint
pnpm --filter web build
```

완료 기준:

- 레시피 상세에 가격 힌트 영역이 보인다.
- 가격 힌트가 없어도 레시피 상세가 정상 표시된다.
- 가격 힌트 생성 실패가 레시피 저장을 막지 않는다.

### Task 10. 추천 홈 구현

목표:

- 홈 화면에서 저장된 레시피 중 이번 주 해먹기 좋은 메뉴를 보여준다.
- 가격 정보가 부족하면 최근 저장순 fallback을 사용한다.

생성/수정할 파일:

- `packages/shared/src/recommendations/scoring.ts`
- `packages/shared/tests/recommendation-scoring.test.ts`
- `apps/web/components/recommendation-list.tsx`
- `apps/web/app/page.tsx`

추천 점수 초안:

```text
score =
  price_signal_score
  + recency_score
  + favorite_score
  - low_confidence_penalty
```

MVP에서는 favorite이 없으므로 아래처럼 시작한다.

```text
cheap: +30
normal: +15
expensive: -10
unknown: 0
recent: 최대 +20
```

홈 화면 상태:

```text
저장 레시피 없음:
"레시피를 먼저 저장해보세요"

가격 힌트 없음:
"가격 정보 없이 최근 저장순으로 보여드려요"

추천 있음:
"이번 주 해먹기 좋은 저장 레시피"
```

검증:

```bash
pnpm --filter @prepper/shared test -- recommendation-scoring.test.ts
pnpm --filter web lint
pnpm --filter web build
```

완료 기준:

- 저장된 레시피가 있으면 홈 추천 영역에 나온다.
- 가격 힌트가 없어도 최근 저장순으로 fallback한다.
- 추천 이유가 과장되지 않는다.

### Task 11. 핵심 E2E 테스트 추가

목표:

- 사용자가 실제로 레시피를 만들고 다시 볼 수 있는지 브라우저 테스트로 확인한다.

생성할 파일:

- `playwright.config.ts`
- `tests/e2e/recipe-flow.spec.ts`

테스트할 흐름:

1. `/recipes/new`로 이동한다.
2. 원본 링크, 제목, 재료, 조리 순서를 입력한다.
3. 저장한다.
4. 상세 페이지에서 제목, 재료, 원본 링크가 보인다.

검증:

```bash
pnpm --filter web dev
npx playwright test tests/e2e/recipe-flow.spec.ts
```

완료 기준:

- 핵심 recipe flow E2E가 통과한다.
- 실패 시 재현 가능한 에러 메시지가 나온다.

### Task 12. 배포 준비 문서 추가

목표:

- 첫 테스트 사용자에게 배포하기 전에 필요한 환경 설정을 정리한다.

생성할 파일:

- `.env.example`
- `docs/deployment-checklist.md`

`.env.example`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
YOUTUBE_API_KEY=
COUPANG_ACCESS_KEY=
COUPANG_SECRET_KEY=
```

배포 체크리스트:

```text
- Supabase project 생성
- migration 적용
- RLS 활성화 확인
- Next.js env 설정
- Supabase Edge Function secrets 설정
- pnpm lint 통과
- pnpm build 통과
- unit test 통과
- Playwright core flow 통과
- 테스트 사용자가 실제 레시피 링크 5개를 저장할 수 있음
```

## 6. Ship-blocking 검증

첫 사용자에게 보여주기 전에 반드시 확인할 것:

```bash
pnpm lint
pnpm build
pnpm test
npx playwright test
```

필수 통과 기준:

- 잘못된 URL을 막는다.
- 수동 레시피 생성이 된다.
- import draft를 review 후 저장할 수 있다.
- 레시피 검색이 된다.
- 레시피 상세에 재료, 조리 순서, 원본 링크, 가격 힌트가 보인다.
- 홈에서 추천 또는 empty/fallback 상태가 정직하게 보인다.
- 가격 힌트 실패가 레시피 저장을 막지 않는다.
- RLS가 다른 사용자 데이터 접근을 막는다.

## 7. 권장 구현 순서

가장 안전한 순서:

1. Task 1: Monorepo 구조 생성
2. Task 2: Next.js 웹앱 생성
3. Task 3: Shared package 생성
4. Task 4: Supabase schema/RLS 작성
5. Task 5: Auth
6. Task 6: URL validation
7. Task 7: 수동 recipe CRUD
8. Task 8: import/review
9. Task 9: mock price hint
10. Task 10: recommendation home
11. Task 11: E2E
12. Task 12: 배포 체크리스트

이 순서의 이유:

- 먼저 수동 CRUD를 완성하면 외부 API 없이도 제품 핵심 루프를 검증할 수 있다.
- import parser는 수동 저장 흐름 위에 얹으면 된다.
- 가격 힌트와 추천은 저장된 레시피가 있어야 의미가 있다.
- Expo 앱은 이 루프가 실제로 반복 사용되는지 확인한 뒤 시작한다.

## 8. 보류 항목

아래는 웹 MVP 검증 전까지 구현하지 않는다.

- Expo 앱
- PWA 설치 최적화
- push notification
- 공유 시트
- 실제 Coupang 가격 추적
- OpenAI 고도화 parser
- 브라우저 확장
- 장보기 리스트
- 냉장고 재고 관리
- 결제

## 9. 다음 액션

바로 구현한다면 다음 명령부터 시작한다.

```bash
corepack enable
pnpm init
pnpm add -D turbo typescript
```

그 다음에는 Task 1부터 체크박스를 하나씩 지우며 진행한다.
