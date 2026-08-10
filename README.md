# Prepper

> 흩어진 레시피 링크를 한 곳에. 저장하면 요리가 되는 가장 쉬운 방법.

## 소개

유튜브나 블로그에서 찾은 레시피 링크를 붙여넣으면 재료와 조리 순서를 자동으로 정리해주는 서비스입니다.

- **유튜브 링크** — 영상 설명란과 자막에서 재료, 조리 순서 자동 파싱
- **블로그 링크** — 페이지 본문에서 레시피 정보 자동 추출
- **파싱이 어려운 경우** — 직접 수정할 수 있는 보정 화면 제공

## 주요 기능

- 링크 하나로 레시피 자동 저장
- YouTube / 블로그 출처별 분류
- 재료 및 조리 순서 자동 정리
- 확인이 필요한 레시피 별도 관리
- 레시피 상세 패널 (홈에서 바로 확인)

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 |
| 데이터베이스 | Supabase (PostgreSQL) |
| 인증 | Supabase Auth |
| AI 파싱 | OpenAI API |
| 모노레포 | Turborepo + pnpm |
| 배포 | AWS EC2 + Docker + GitHub Actions |

## 로컬 실행

**요구사항:** Node.js 20+, pnpm

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp apps/web/.env.example apps/web/.env.local
# .env.local에 Supabase, OpenAI, YouTube API 키 입력

# 개발 서버 실행
pnpm dev
```

`http://localhost:3000` 에서 확인

API 서버는 별도 터미널에서 실행합니다.

```bash
cp apps/api/.env.example apps/api/.env
# apps/api/.env에 Supabase 값 입력
pnpm --filter api dev
```

`http://localhost:4000/health` 에서 확인

## Docker로 로컬 테스트

```bash
docker compose up --build
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 배포합니다.

```
git push origin main
```

배포 흐름: GitHub Actions → Docker 빌드 → ECR push → EC2 컨테이너 교체

자세한 내용은 [`docs/deployment-2026-06.md`](docs/deployment-2026-06.md) 참고

## 프로젝트 구조

```
prepper/
├── apps/
│   ├── web/          # Next.js 웹 앱
│   └── api/          # Express API 서버
├── packages/
│   └── shared/       # 공통 타입 및 유틸
└── docs/             # 설계 문서
```

## 환경변수

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 |
| `OPENAI_API_KEY` | OpenAI API 키 (레시피 파싱) |
| `OPENAI_MODEL` | 사용할 OpenAI 모델 (기본값: gpt-5.4-mini) |
| `YOUTUBE_API_KEY` | YouTube Data API 키 |

API 서버는 `apps/api/.env`에서 아래 값을 사용합니다. Supabase 값은 웹과 같은
`NEXT_PUBLIC_*` 이름을 그대로 사용할 수 있습니다.

| 변수명 | 설명 |
|--------|------|
| `PORT` | API 서버 포트 (기본값: 4000) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 키 |
| `OPENAI_API_KEY` | OpenAI API 키 (레시피 파싱) |
| `OPENAI_MODEL` | 사용할 OpenAI 모델 (기본값: gpt-5.4-mini) |
| `YOUTUBE_API_KEY` | YouTube Data API 키 |


# Prepper Architecture

Prepper는 YouTube, Shorts, 블로그에 흩어진 레시피 링크를 재료와 조리순서가 정리된 레시피 카드로 변환해 저장하는 서비스입니다.

현재 구현 기준으로는 웹 앱과 모바일 앱이 같은 Supabase 데이터 모델을 사용합니다. 웹은 Next.js Server Actions로 import와 저장 흐름을 처리하고, 모바일은 별도 Express API 서버를 통해 같은 레시피 데이터를 조회, 생성, 수정, 삭제합니다.

## System Architecture

```mermaid
flowchart LR
  userWeb[Web User] --> browser[Next.js Web App<br/>apps/web]
  userMobile[Mobile User] --> mobile[Expo Mobile App<br/>apps/mobile]

  browser --> webServer[Next.js Server Components<br/>Server Actions]
  mobile --> api[Express API Server<br/>apps/api]

  browser --> supabaseAuth[Supabase Auth]
  mobile --> supabaseAuth

  webServer --> supabaseDb[(Supabase PostgreSQL)]
  api --> supabaseDb
  api --> supabaseAuth

  webServer --> youtube[YouTube Data API<br/>oEmbed]
  webServer --> openai[OpenAI Responses API]
  webServer --> webpages[Recipe Web Pages<br/>HTML / JSON-LD]

  api --> youtube
  api --> openai
  api --> webpages

  shared[packages/shared<br/>types / validation] --> browser
  shared --> mobile
  shared --> api

  cicd[GitHub Actions] --> ecr[AWS ECR]
  ecr --> ec2[AWS EC2 Docker Runtime]
  ec2 --> webRuntime[prepper-web<br/>port 3000]
  ec2 --> apiRuntime[prepper-api<br/>port 4000]
  nginx[Nginx HTTPS Proxy] --> webRuntime
  nginx --> apiRuntime
```

## Runtime Responsibilities

```mermaid
flowchart TB
  subgraph Web["apps/web"]
    landing[Landing / authenticated home]
    addModal[Add recipe modal]
    reviewFunnel[Recipe review funnel]
    webQueries[Supabase server queries]
    webImport[Import parser<br/>HTML / JSON-LD / YouTube / OpenAI]
  end

  subgraph Mobile["apps/mobile"]
    tabs[Recipe / Import / Account tabs]
    mobileAuth[Mobile OAuth session]
    mobileQueries[React Query cache]
    mobileEdit[Recipe edit flow]
  end

  subgraph API["apps/api"]
    authMiddleware[Bearer token auth]
    recipeRoutes[Recipe routes]
    repository[Supabase repository]
    apiImport[Import service / parser]
  end

  subgraph Shared["packages/shared"]
    sharedTypes[Recipe types]
    urlValidation[URL validation]
    scoring[Recommendation scoring]
  end

  addModal --> webImport
  reviewFunnel --> webQueries
  tabs --> mobileQueries
  mobileQueries --> recipeRoutes
  recipeRoutes --> authMiddleware
  recipeRoutes --> repository
  recipeRoutes --> apiImport

  urlValidation --> addModal
  urlValidation --> apiImport
  sharedTypes --> webQueries
  sharedTypes --> mobileQueries
  sharedTypes --> repository
```

## Data Model

```mermaid
erDiagram
  auth_users {
    uuid id PK
  }

  profiles {
    uuid id PK
    text display_name
    timestamptz created_at
    timestamptz updated_at
  }

  recipes {
    uuid id PK
    uuid user_id FK
    text title
    text source_url
    text source_type
    text source_video_id
    text thumbnail_url
    text servings
    text status
    numeric parse_confidence
    text failure_reason
    timestamptz created_at
    timestamptz updated_at
  }

  ingredients {
    uuid id PK
    uuid recipe_id FK
    text raw_text
    text normalized_name
    numeric amount_value
    text amount_unit
    text importance
  }

  recipe_steps {
    uuid id PK
    uuid recipe_id FK
    int position
    text body
  }

  parsed_sources {
    uuid id PK
    uuid recipe_id FK
    text parser_type
    text raw_excerpt
    text model_name
    text schema_version
    numeric confidence
    jsonb warnings
  }

  price_hints {
    uuid id PK
    uuid ingredient_id FK
    text provider
    text query
    numeric unit_price
    text price_band
    text confidence
  }

  recommendations {
    uuid id PK
    uuid recipe_id FK
    uuid user_id FK
    text reason
    numeric score
    text price_hint_summary
    text confidence
  }

  auth_users ||--o| profiles : has
  auth_users ||--o{ recipes : owns
  recipes ||--o{ ingredients : has
  recipes ||--o{ recipe_steps : has
  recipes ||--o{ parsed_sources : records
  ingredients ||--o{ price_hints : has
  recipes ||--o{ recommendations : recommended_as
  auth_users ||--o{ recommendations : receives
```

## Recipe Lifecycle

```mermaid
stateDiagram-v2
  [*] --> UrlSubmitted
  UrlSubmitted --> InvalidUrl: invalid / blocked URL
  UrlSubmitted --> Duplicate: same user + source_url exists
  UrlSubmitted --> Parsing: valid URL

  Parsing --> NeedsReview: partial result / warnings / low confidence
  Parsing --> NeedsReview: current import behavior
  NeedsReview --> Saved: user completes title, ingredients, steps
  Saved --> Edited: user edits recipe
  Edited --> Saved: update succeeds
  Saved --> Deleted: user deletes recipe
  NeedsReview --> Deleted: user deletes draft

  InvalidUrl --> [*]
  Duplicate --> [*]
  Deleted --> [*]
```

## Web Data Flow

```mermaid
flowchart TD
  input[User pastes recipe URL] --> validate[validateRecipeImportUrl]
  validate -->|invalid| formError[Return error to modal]
  validate -->|valid| duplicateCheck[findRecipeBySourceUrl]
  duplicateCheck -->|duplicate| duplicateResult[Show existing recipe link]
  duplicateCheck -->|new URL| sourceType{sourceType}

  sourceType -->|youtube| youtubeFetch[Fetch YouTube title / snippet]
  sourceType -->|web| htmlFetch[Fetch HTML page]

  youtubeFetch --> llm[OpenAI structured parsing]
  htmlFetch --> jsonLd[Try JSON-LD Recipe]
  htmlFetch --> readableText[Extract readable text]
  jsonLd --> draft[Build recipe draft]
  readableText --> llm
  llm --> draft

  draft --> warnings[Build warnings / confidence]
  warnings --> createDraft[createReviewDraft]
  createDraft --> supabase[(Supabase)]
  supabase --> redirect[Redirect to /?category=pending&review=recipeId]
  redirect --> review[RecipeReviewFunnel]
  review --> save[saveRecipeAction]
  save --> update[updateRecipeFromDraft]
  update --> saved[Saved recipe card]
```

## Mobile Data Flow

```mermaid
flowchart TD
  login[Google / Kakao login] --> session[Supabase session]
  session --> token[Access token]

  token --> list[List recipes]
  token --> import[Import URL]
  token --> detail[Get recipe detail]
  token --> update[Update recipe]
  token --> delete[Delete recipe]

  list --> apiList[GET /recipes]
  import --> apiImport[POST /recipes/import]
  detail --> apiDetail[GET /recipes/:id]
  update --> apiUpdate[PATCH /recipes/:id]
  delete --> apiDelete[DELETE /recipes/:id]

  apiList --> apiAuth[API auth middleware]
  apiImport --> apiAuth
  apiDetail --> apiAuth
  apiUpdate --> apiAuth
  apiDelete --> apiAuth

  apiAuth --> supabase[(Supabase)]
  apiImport --> parser[API import service]
  parser --> external[YouTube / Web / OpenAI]
  external --> supabase

  supabase --> reactQuery[React Query cache]
  reactQuery --> mobileUi[Recipe list / detail / edit UI]
```

## Sequence Diagram: Web Recipe Import

```mermaid
sequenceDiagram
  actor User
  participant Web as Next.js Web
  participant Action as Server Action
  participant Parser as Import Parser
  participant External as YouTube/Web/OpenAI
  participant DB as Supabase DB

  User->>Web: Paste URL and submit
  Web->>Action: startRecipeImportFromModalAction(formData)
  Action->>Action: requireUser(nextPath)
  Action->>Action: validateRecipeImportUrl(rawUrl)

  alt Invalid URL
    Action-->>Web: error + sourceUrl
    Web-->>User: Show validation message
  else Duplicate URL
    Action->>DB: findRecipeBySourceUrl(sourceUrl, userId)
    DB-->>Action: existing recipe
    Action-->>Web: duplicateRecipeId
    Web-->>User: Show "already saved" link
  else New URL
    Action->>Parser: buildImportedRecipeDraft(sourceUrl, sourceType)
    Parser->>External: Fetch source text / parse with LLM
    External-->>Parser: structured draft or fallback data
    Parser-->>Action: title, ingredients, steps, warnings
    Action->>DB: createReviewDraft(...)
    DB-->>Action: recipeId
    Action-->>Web: redirect pending review
    Web-->>User: Open review funnel
  end
```

## Sequence Diagram: Web Review Save

```mermaid
sequenceDiagram
  actor User
  participant Funnel as RecipeReviewFunnel
  participant Action as saveRecipeAction
  participant Parser as parseRecipeDraftForm
  participant DB as Supabase DB
  participant Home as Home UI

  User->>Funnel: Edit title, ingredients, steps
  Funnel->>Action: Submit form
  Action->>Action: requireUser("/")
  Action->>Parser: parseRecipeDraftForm(formData)

  alt Invalid draft
    Parser-->>Action: error message
    Action-->>Home: redirect with error query
    Home-->>User: Show review error
  else Valid draft
    Parser-->>Action: normalized draft
    Action->>DB: delete previous ingredients / steps
    Action->>DB: insert new ingredients / steps
    Action->>DB: update recipe status = saved
    Action-->>Home: redirect /?recipe=recipeId
    Home-->>User: Show saved recipe detail
  end
```

## Sequence Diagram: Mobile Import And Edit

```mermaid
sequenceDiagram
  actor User
  participant Mobile as Expo Mobile App
  participant Auth as Supabase Auth
  participant API as Express API
  participant Parser as API Import Service
  participant External as YouTube/Web/OpenAI
  participant DB as Supabase DB

  User->>Mobile: Submit recipe URL
  Mobile->>Auth: getSession()
  Auth-->>Mobile: access_token
  Mobile->>API: POST /recipes/import with Bearer token
  API->>Auth: getUser(token)
  Auth-->>API: user
  API->>API: validate URL
  API->>DB: findRecipeBySourceUrl

  alt Duplicate
    DB-->>API: existing recipe
    API-->>Mobile: 409 duplicate
    Mobile-->>User: Alert with existing recipe action
  else New URL
    API->>Parser: importRecipe(...)
    Parser->>External: Fetch and parse recipe source
    External-->>Parser: draft data
    Parser->>DB: createReviewDraft
    DB-->>Parser: recipeId
    Parser-->>API: needs_review + recipeId
    API-->>Mobile: 201 needs_review
    Mobile-->>User: Navigate to edit screen
  end

  User->>Mobile: Complete title, ingredients, steps
  Mobile->>API: PATCH /recipes/:id
  API->>Auth: getUser(token)
  API->>DB: updateRecipe
  DB-->>API: success
  API-->>Mobile: saved
  Mobile-->>User: Return to saved recipes
```

## Sequence Diagram: Mobile OAuth

```mermaid
sequenceDiagram
  actor User
  participant Mobile as Expo Mobile App
  participant Browser as WebBrowser Auth Session
  participant Supabase as Supabase Auth
  participant Cache as React Query Cache

  User->>Mobile: Tap Google or Kakao login
  Mobile->>Supabase: signInWithOAuth(skipBrowserRedirect)
  Supabase-->>Mobile: provider auth URL
  Mobile->>Browser: openAuthSessionAsync(authUrl, prepper://auth/callback)
  Browser->>Supabase: OAuth provider flow
  Supabase-->>Browser: redirect to prepper://auth/callback
  Browser-->>Mobile: callback URL
  Mobile->>Supabase: exchangeCodeForSession or setSession
  Supabase-->>Mobile: session
  Mobile->>Cache: clear cache on sign out only
  Mobile-->>User: Enter authenticated tabs
```

## Deployment Flow

```mermaid
flowchart LR
  push[Push to main] --> actions[GitHub Actions]
  actions --> buildWeb[Build web-runner image]
  actions --> buildApi[Build api-runner image]
  buildWeb --> ecrWeb[Push web-latest / web-sha to ECR]
  buildApi --> ecrApi[Push api-latest / api-sha to ECR]
  ecrWeb --> ec2[SSH to EC2]
  ecrApi --> ec2
  ec2 --> ssm[Load env from SSM Parameter Store]
  ssm --> replace[Stop old containers and run new containers]
  replace --> web[prepper-web :3000]
  replace --> api[prepper-api :4000]
  nginx[Nginx + HTTPS] --> web
  nginx --> api
```

## Key Architectural Decisions

- **Web uses Server Actions for first-party flows**: the web app can validate auth, parse links, write Supabase data, and redirect without adding a client-side API layer.
- **Mobile uses Express API**: the mobile app cannot rely on Next.js Server Actions, so recipe operations are exposed through token-authenticated API endpoints.
- **Supabase owns auth and data isolation**: both clients use Supabase Auth, and recipe data is scoped by `user_id`.
- **Recipe import is intentionally staged**: imported content becomes `needs_review` first, then moves to `saved` after user confirmation.
- **Parsing is source-aware**: YouTube and web pages use different extraction strategies before falling back to structured LLM parsing.
- **Duplicate prevention happens before parsing**: same-user duplicate URLs return the existing recipe instead of spending external API calls and database writes.

## Notable Tradeoffs

- **Parser logic exists in both web and api**: this keeps web Server Actions and mobile API independent, but it creates duplication that could later move into a shared server package.
- **`needs_review` is the default safe path**: this reduces the risk of saving poor AI output as a finished recipe, but it adds one user confirmation step.
- **Supabase joins are convenient for list/detail reads**: they reduce app-side assembly work, but large recipe collections may later need pagination and narrower selects.

