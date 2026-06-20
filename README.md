# Bit Learning — Frontend

> Monorepo frontend for the **Bit Learning** educational platform, built with React 19, TypeScript, and Vite. Managed by [Turborepo](https://turbo.build/) and [pnpm](https://pnpm.io/) workspaces.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Turborepo Pipeline                          │
│                    (build · dev · lint · check-types)                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────────────┐       ┌──────────────────────┐          │
│   │     apps/web         │       │     apps/admin       │          │
│   │  (Student Platform)  │       │  (Admin Dashboard)   │          │
│   │  :5173               │       │  :8386               │          │
│   │                      │       │                      │          │
│   │  React 19 + Vite     │       │  React 19 + Vite     │          │
│   │  TanStack Router     │       │  TanStack Router     │          │
│   │  TanStack Query      │       │  TanStack Query      │          │
│   │  Redux Toolkit       │       │  Zustand             │          │
│   │  i18next             │       │  Clerk Auth          │          │
│   │  Vitest              │       │  Recharts            │          │
│   └──────────┬───────────┘       └──────────┬───────────┘          │
│              │                               │                      │
│              └───────────┬───────────────────┘                      │
│                          │                                          │
│   ┌──────────────────────┴──────────────────────┐                  │
│   │              packages/ui                     │                  │
│   │         (Shared Component Library)           │                  │
│   │                                              │                  │
│   │  Radix UI · React Aria · DaisyUI            │                  │
│   │  Tailwind CSS 4 · Embla Carousel            │                  │
│   │  Lucide Icons · MapLibre GL                  │                  │
│   │  60+ reusable components                     │                  │
│   └──────────────────────┬──────────────────────┘                  │
│                          │                                          │
│   ┌──────────────────────┴──────────────────────┐                  │
│   │              packages/lib                    │                  │
│   │         (Shared Business Logic)              │                  │
│   │                                              │                  │
│   │  API SDK (Axios) · Zod Validation            │                  │
│   │  Shared Constants · Utilities                │                  │
│   │  Type-safe API clients per domain            │                  │
│   └─────────────────────────────────────────────┘                  │
│                                                                     │
│   ┌─────────────────────────────────────────────┐                  │
│   │        packages/typescript-config            │                  │
│   │     (Shared TSConfig presets)                 │                  │
│   │  base · react-library · nextjs               │                  │
│   └─────────────────────────────────────────────┘                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │    Backend API        │
              │  REST + WebSocket     │
              └───────────────────────┘
```

## Monorepo Structure

```
bit-learning-fe/
├── apps/
│   ├── web/                    # Student-facing platform
│   └── admin/                  # Admin dashboard
├── packages/
│   ├── ui/                     # Shared UI component library
│   ├── lib/                    # Shared API SDK, types, validation
│   └── typescript-config/      # Shared TypeScript configurations
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # pnpm workspace definition
├── biome.json                  # Linter & formatter (Biome)
└── lefthook.yml                # Git hooks (pre-commit formatting)
```

## Applications

### `apps/web` — Student Platform

The main learning platform where students interact with courses, exams, quizzes, and more.

| Concern | Stack |
|---|---|
| Framework | React 19 + Vite |
| Routing | TanStack Router (file-based, auto code-splitting) |
| Server State | TanStack Query |
| Client State | Redux Toolkit + Redux Persist |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS 4 (PostCSS) |
| i18n | i18next + browser language detection |
| Testing | Vitest + Testing Library + Playwright |
| Code Editor | Monaco Editor |
| Charts | ECharts, Recharts |
| PDF | react-pdf-viewer |
| Realtime | STOMP.js over WebSocket |

Feature modules: `auth` · `course` · `lecture` · `exam` · `quiz` · `question` · `code-practice` · `chat-ai` · `contest` · `forum` · `game` · `mindmap` · `slides` · `dashboard` · `mentor-dashboard` · `order` · `notification` · `onboarding` · `matrix`

### `apps/admin` — Admin Dashboard

Back-office dashboard for managing platform content, users, and system configuration.

| Concern | Stack |
|---|---|
| Framework | React 19 + Vite |
| Routing | TanStack Router (file-based, auto code-splitting) |
| Server State | TanStack Query |
| Client State | Zustand |
| Auth | Clerk |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS 4 (Vite plugin) |
| Charts | Recharts |
| Rich Text | React Quill |
| PDF | react-pdf-viewer |

Feature modules: `auth` · `courses` · `curriculum` · `contests` · `games` · `mindmaps` · `posts` · `questions` · `users` · `settings` · `system-prompt` · `templates` · `dashboard`

---

## Shared Packages

### `packages/ui` — Component Library

60+ reusable UI components built on top of Radix UI and React Aria, styled with Tailwind CSS 4 and DaisyUI.

Exports via package `@workspace/ui`:
```ts
import Button from "@workspace/ui/components/Button";
import { cn } from "@workspace/ui/lib/utils";
import useMediaQuery from "@workspace/ui/hooks/useMediaQuery";
```

Key components: `Button` · `DataTable` · `Dialog` · `Form` · `Select` · `Calendar` · `DatePicker` · `Tabs` · `Popover` · `Tooltip` · `Sidebar` · `EmblaCarousel` · `Map` · `Uploader` · `Searchfield` · `ScrollArea` · `Skeleton` · `Spinner` · and more.

### `packages/lib` — Business Logic & API SDK

Shared API clients, types, and validation schemas consumed by both apps.

Exports via package `@workspace/lib`:
```ts
import { authApi } from "@workspace/lib/api/sdk/auth.api";
import { courseSchema } from "@workspace/lib/validation";
```

API SDK domains: `auth` · `chapter` · `exam` · `lesson` · `matrix` · `question` · `subject` · `syllabus` · `example`

Each domain provides a typed API client (`.api.ts`) and its corresponding TypeScript types (`.type.ts`).

### `packages/typescript-config` — TSConfig Presets

Shared TypeScript configuration presets: `base`, `react-library`, `nextjs`.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** 10.28.2 (enforced via `only-allow pnpm` + corepack)

### Installation

```bash
# Enable corepack (ships with Node.js)
corepack enable

# Install all dependencies
pnpm install
```

### Development

```bash
# Start all apps in dev mode (Turborepo parallel)
pnpm dev

# Start individual apps
pnpm --filter web dev        # Student platform → http://localhost:5173
pnpm --filter admin dev      # Admin dashboard  → http://localhost:8386
```

### Build

```bash
# Build all apps and packages
pnpm build

# Build a specific app
pnpm --filter web build
pnpm --filter admin build
```

### Code Quality

```bash
# Lint all workspaces
pnpm lint

# Format all files
pnpm format

# Biome check (lint + format + fixes)
pnpm check
```

## Environment Variables

### `apps/web`

Copy `.env.example` to `.env.local` and configure:

| Variable | Description | Default (dev) |
|---|---|---|
| `VITE_API_BASE_URL` | Backend REST API base URL | `http://localhost:4000` |
| `VITE_WS_URL` | WebSocket endpoint | `http://localhost:8080/ws` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` |

### `apps/admin`

| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication publishable key |
| `VITE_API_BASE_URL` | Backend REST API base URL |

---

## Docker

This repository keeps the Dockerfiles needed to build frontend images from the app source.
Deployment, Kubernetes manifests, Compose files, Ansible playbooks, and legacy CI/CD deploy
configuration live in the sibling GitOps repository: `../bit-learning-gitops`.

```bash
docker build -f apps/web/Dockerfile.prodV2 -t hoangclw/bitlearning-web:dev-latest .
docker build -f apps/admin/Dockerfile.prodV2 -t hoangclw/bitlearning-admin:dev-latest .
```

Production images use multi-stage builds: `Node 24 Alpine` build stage to a static runtime image.

---

## CI/CD

### GitHub Actions

| Workflow | Trigger | Purpose |
|---|---|---|
| `build.yml` | PR to `main`/`develop` | Build validation, PR status comments |
| `build-check-dependabot.yml` | Dependabot PRs to `develop` | Automated dependency update build checks |
| `deploy-dev-gitops.yml` | Push to `develop` / manual | Build dev images, push Docker Hub, update GitOps dev overlay |

Deployment workflows, Kubernetes manifests, legacy Ansible, Compose, and Jenkins files live in `../bit-learning-gitops`.

The dev GitOps deployment workflow expects these GitHub secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `GITOPS_DEPLOY_KEY`
- `DEV_VITE_API_BASE_URL`
- `DEV_VITE_WS_URL`
- `DEV_VITE_CLERK_PUBLISHABLE_KEY`

Optional GitHub variables:

- `DEV_VITE_API_TIMEOUT`
- `DEV_VITE_SITE_URL`
- `DEV_VITE_MINIO_GAME_URL`
- `DEV_VITE_MINIO_THUMBNAIL_URL`
- `DEV_VITE_PUBLIC_SITE_URL`

---

## Tooling

| Tool | Purpose | Config |
|---|---|---|
| [Turborepo](https://turbo.build/) | Monorepo build orchestration & caching | `turbo.json` |
| [pnpm](https://pnpm.io/) | Package manager with workspace support | `pnpm-workspace.yaml` |
| [Biome](https://biomejs.dev/) | Linter + formatter (replaces ESLint + Prettier) | `biome.json` |
| [Lefthook](https://github.com/evilmartians/lefthook) | Git hooks (pre-commit auto-format) | `lefthook.yml` |
| [Vite](https://vite.dev/) | Build tool & dev server | Per-app `vite.config.ts` |
| [Vitest](https://vitest.dev/) | Unit & integration testing | Configured in web's `vite.config.js` |
| [Knip](https://knip.dev/) | Unused dependency/export detection | `apps/admin/knip.config.ts` |
| [EditorConfig](https://editorconfig.org/) | Consistent editor settings | `.editorconfig` |

---

## Dependency Graph

```
apps/web
  ├── @workspace/ui        (workspace:*)
  ├── @workspace/lib       (workspace:*)
  └── @workspace/typescript-config (workspace:*)

apps/admin
  └── @workspace/typescript-config (workspace:*)

packages/ui
  └── @workspace/typescript-config (workspace:*)

packages/lib
  └── @workspace/typescript-config (workspace:*)
```

> `apps/admin` currently uses its own UI components (Radix + shadcn pattern) rather than `@workspace/ui`. Migration to the shared library is possible.

---

## License

PROPRIETARY — All rights reserved.
