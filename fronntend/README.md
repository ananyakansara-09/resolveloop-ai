# ResolveLoop AI — Autonomous Customer Support Resolution Assistant

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Alexa+ Track](https://img.shields.io/badge/Amazon_Developer_Hackathon_2026-Alexa%2B_Track-FF9900?style=flat&logo=amazon&logoColor=white)](https://developer.amazon.com/)

**ResolveLoop AI** is a modern SaaS customer-support operations center designed for ecommerce store owners. Tailored for the **Amazon Developer Hackathon 2026 (Alexa+ Track)**, the application demonstrates an **Alexa+-style simulated conversational assistant** that investigates delayed orders, queries carrier hub telemetry, evaluates merchant return and SLA policies, prepares personalized customer reassurance emails, enforces explicit merchant approval for consequential actions, and schedules persistent follow-up checkpoints.

---

## 🌟 Key Features

### 1. Operations Command Center (Main Dashboard)
- **Live Operational Metrics**: Total cases, open investigations, cases awaiting approval, resolved cases, and follow-ups due.
- **Prominent "Ask ResolveLoop" Entry Point**: Instant natural language investigation launcher with sample queries.
- **Recent Cases Table**: Real-time filtering, status badges, priority markers, and one-click workspace transitions.

### 2. Two-Panel AI Assistant Workspace
- **Left Panel (Conversational Interface & Execution Tracker)**:
  - Alexa+ Simulated Voice and reasoning indicator with audio pulse visualization.
  - Multi-turn conversational message stream.
  - One-click starter prompt chips (including the primary **Order KL-1042** scenario).
  - Progressive tool-call telemetry displaying live statuses: `Running`, `Completed`, or `Failed`.
- **Right Panel (Context & Resolution Workbench)**:
  - **Order & Customer Details**: Customer lifetime value, loyalty tier (VIP / Standard), itemization, and delivery address.
  - **Carrier Tracking Telemetry**: Step-by-step milestone timeline highlighting weather holds and distribution hub delays.
  - **Store Policy Evaluation**: Automated rule interpretation (e.g., Late Delivery Guarantee SLA > 48h).
  - **Agent Recommendation & Proposed Action**: Financial impact summary, personalized email draft preview, and approval launcher.

### 3. Human-in-the-Loop Approval Workflow
- Dedicated modal/drawer enforcing **explicit user confirmation** before consequential actions (financial courtesy credits or customer email dispatch) are executed.
- In-place editable draft email preview allowing store owners to customize wording prior to authorization.
- Rejection handling with mandatory rationale capture.

### 4. Dedicated Case Management (`/cases` & `/cases/:id`)
- Deep audit trail logging actors (`agent`, `user`, `system`), timestamps, and detailed action notes.
- Linked follow-up tasks, order items, and historical message threads.

### 5. Follow-up Checkpoint Management (`/follow-ups`)
- Overdue tasks clearly highlighted using **bold textual alert badges, warning icons, and borders without relying solely on color**.
- Quick "Mark Complete" and "Reopen" toggles.
- Modal powered by **React Hook Form** to schedule new follow-ups.

### 6. Settings & Integration Status (`/settings`)
- Health check verification against `GET /health`.
- Status dashboard for simulated connectors: **Alexa+ Voice Assistant**, **Shopify Store Sync**, **ShipStation / FedEx Tracking API**, **Customer Email Dispatcher**, and **Store Policy Rule Engine**.
- Strictly adheres to security standards: **no private API keys or credentials exposed to client-side code**.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vitejs.dev/)
- **UI & Layout**: [Bootstrap 5](https://getbootstrap.com/) and [React-Bootstrap](https://react-bootstrap.netlify.app/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **Design Aesthetic**: Premium SaaS Command Center with deep navy sidebar (`#0b1329`), restrained blue accents (`#2563eb`), clear Inter typography, subtle borders, and smooth transitions.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18.0.0` or higher (tested on Node `v22.x`)
- npm `v9.x` or higher

### Installation

1. **Clone or navigate to the workspace**:
   ```bash
   cd Resolveloop_AI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at: **`http://localhost:3000`** (or the port specified by Vite).

---

## ⚙️ Environment Configuration

The application uses Vite environment variables configured in `.env`:

```ini
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Development Mock Service Toggle
# Set to 'true' for standalone demo mode with rich synthetic data
# Set to 'false' to enforce strict network requests to the real backend
VITE_USE_MOCK_API=true
```

> **Resilient Fallback**: When `VITE_USE_MOCK_API=false` and a real backend is temporarily offline or returns a network error, the client gracefully falls back to the synthetic mock dataset with a console warning so the application remains fully testable.

---

## 🎯 Demo Acceptance Scenario: Order KL-1042

To demonstrate the full hackathon scenario:

1. **Open Dashboard** (`/`):
   - Review live metrics and recent support cases.
   - Click the prominent **"Launch Order KL-1042 Demo"** button (or click **"Ask ResolveLoop"** and select the starter inquiry).

2. **Inspect the AI Assistant Workspace** (`/assistant`):
   - Notice the **Tool Execution Tracker** executing sequentially:
     - `lookup_order(order_id="KL-1042")`
     - `fetch_shipping_events(tracking_number="TRK-9823412")` (Chicago hub blizzard hold detected)
     - `check_store_policy(policy_category="shipping_sla")` (Policy `POL-SHP-04` matched)
     - `synthesize_resolution_plan()` (Proactive delay apology + $15 credit)
     - `schedule_followup(checkpoint="Chicago Hub clearance scan")`
   - Review the right panel:
     - **Order & Customer**: Sarah Jenkins (VIP, 14 orders, $1,840 LTV), Apex Thermal Parka ($218.50).
     - **Carrier Telemetry**: FedEx Priority exception event at Chicago Distribution Hub.
     - **Store Policy Match**: Late Delivery Guarantee threshold met.
     - **Proposed Action**: $15 courtesy credit + customized customer email draft.

3. **Approve the Action**:
   - Click **"Review & Authorize Action"**.
   - (Optional) Click **"Edit Email Draft"** to customize the message.
   - Check the explicit confirmation box: *"I explicitly authorize this action..."*.
   - Click **"Authorize & Dispatch"**.
   - Notice the toast notification and conversational confirmation.

4. **Verify Case Details & Audit Trail** (`/cases/CASE-2026-1042`):
   - Confirm status has changed from `awaiting_approval` to **`approved`**.
   - Verify the Audit Trail contains the logged entry: *"Action Approved - Store owner approved action..."*.

5. **Verify Scheduled Follow-up** (`/follow-ups`):
   - Confirm task `TASK-1042` is present, scheduled for tomorrow morning at 09:00 AM.
   - Notice overdue tasks (e.g., `TASK-1025`) clearly marked with `[OVERDUE]` alert badges and warning icons.

6. **Verify State Persistence**:
   - Refresh the browser page (`Cmd + R` or `F5`).
   - Confirm that the approved case state and scheduled task persist across reloads!

---

## 📡 API Service Architecture & Contract

The frontend service layer in `src/api/` connects to the following endpoints:

| Method | Endpoint | Description | Service Function |
|---|---|---|---|
| `GET` | `/health` | Service health check | `getHealth()` |
| `GET` | `/dashboard` | Metric statistics & recent cases list | `getDashboard()` |
| `POST` | `/agent/run` | Submit user resolution query to agent | `runAgent(payload)` |
| `GET` | `/orders/:id` | Fetch order & customer metadata | `getOrder(id)` |
| `GET` | `/orders/:id/shipping` | Fetch carrier tracking timeline & events | `getOrderShipping(id)` |
| `GET` | `/cases` | List all resolution cases | `getCases()` |
| `GET` | `/cases/:id` | Retrieve single case with audit trail & messages | `getCase(id)` |
| `POST` | `/cases` | Initialize new support case | `createCase(payload)` |
| `POST` | `/cases/:id/approve` | Authorize proposed resolution action | `approveCaseAction(id, draft)` |
| `POST` | `/cases/:id/reject` | Reject proposed action with reason | `rejectCaseAction(id, reason)` |
| `POST` | `/cases/:id/follow-ups` | Schedule follow-up checkpoint for case | `createCaseFollowUp(id, dto)` |
| `GET` | `/follow-ups` | List scheduled follow-up tasks | `getFollowUps()` |
| `PATCH`| `/follow-ups/:id` | Update task status (`pending`/`completed`) | `updateFollowUp(id, patch)` |

---

## 📋 Backend Endpoints & Schema Fields Still Needed for Production

When connecting this frontend to a multi-tenant production backend, the following enhancements should be implemented:

1. **Authentication & Multi-Tenant Context**:
   - `POST /auth/login` and `POST /auth/refresh`
   - Store tenant identifier (`X-Store-Id` header) for multi-store support.
2. **Server-Sent Events (SSE) or WebSockets for Live Tool Streaming**:
   - `GET /agent/run/stream` for real-time sub-second streaming of tool calls as they execute on remote carrier APIs.
3. **Real Carrier Webhook Ingestion**:
   - `POST /webhooks/fedex` and `POST /webhooks/ups` to automatically advance shipping checkpoints without manual agent polling.
4. **Email Dispatch Gateway**:
   - Integration with SendGrid / Postmark / Amazon SES for sending actual customer emails upon authorization.
5. **Shopify Admin GraphQL App Bridge**:
   - Direct OAuth installation flow into Shopify Admin embedded apps.

---

## 📁 Repository Structure

```
Resolveloop_AI/
├── .env.example              # Template for environment configuration
├── .env                      # Local development environment configuration
├── index.html                # App entry HTML with Inter typography & SEO tags
├── package.json              # Project dependencies and npm scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── src/
│   ├── main.tsx              # React DOM mounting entry point
│   ├── App.tsx               # Route definitions and global providers
│   ├── index.css             # Design system tokens, cards, and animations
│   ├── api/
│   │   ├── apiClient.ts      # Configured Axios client with resilient mock fallback
│   │   ├── agentApi.ts       # POST /agent/run agent workflow
│   │   ├── casesApi.ts       # /cases CRUD, approvals, and rejections
│   │   ├── dashboardApi.ts   # /dashboard and /health endpoints
│   │   ├── ordersApi.ts      # /orders and carrier tracking endpoints
│   │   ├── followUpsApi.ts   # /follow-ups task management
│   │   └── mock/
│   │       ├── mockData.ts   # Rich synthetic dataset (KL-1042, KL-1089, etc.)
│   │       └── mockService.ts# In-memory/storage backend simulator
│   ├── types/
│   │   ├── agent.ts          # ToolCall, AgentRunResponse, ToolExecutionStatus
│   │   ├── case.ts           # Case, CaseWithHistory, ProposedAction, AuditEvent
│   │   ├── dashboard.ts      # DashboardData, DashboardStats, SystemHealth
│   │   ├── followUp.ts       # FollowUpTask, CreateFollowUpDto
│   │   ├── order.ts          # OrderDetails, CustomerInfo, OrderItem
│   │   └── shipping.ts       # ShippingDetails, ShippingEvent
│   ├── context/
│   │   ├── AgentContext.tsx  # Global agent investigation state & tool progress
│   │   └── ToastContext.tsx  # Accessible toast notification manager
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx # Main wrapper with responsive layout
│   │   │   ├── Sidebar.tsx   # Deep navy sidebar with hackathon badge
│   │   │   └── TopNavbar.tsx # Quick order lookup, status pill, demo reset
│   │   ├── common/
│   │   │   ├── StatusBadge.tsx     # Color and icon-coded accessible badges
│   │   │   ├── PriorityBadge.tsx   # Urgent, High, Medium, Low badges
│   │   │   ├── SkeletonLoader.tsx  # Card & table shimmer placeholders
│   │   │   ├── EmptyState.tsx      # Clean empty state display
│   │   │   └── ErrorAlert.tsx      # Accessible error message with retry
│   │   ├── agent/
│   │   │   ├── ChatMessageList.tsx # Two-panel left: message bubbles
│   │   │   ├── ChatInput.tsx       # Two-panel left: input & starter chips
│   │   │   ├── ToolExecutionTracker.tsx # Tool calls with running/completed badges
│   │   │   ├── OrderSummaryCard.tsx# Two-panel right: customer & order info
│   │   │   ├── ShippingTimeline.tsx# Two-panel right: carrier milestone trail
│   │   │   ├── PolicyEvidenceCard.tsx # Two-panel right: SLA rules & citations
│   │   │   └── ProposedActionCard.tsx # Two-panel right: recommendation & approve CTA
│   │   ├── cases/
│   │   │   ├── CasesTable.tsx      # Filterable cases data grid
│   │   │   ├── CaseAuditTrail.tsx  # Chronological audit & activity log
│   │   │   └── ApprovalModal.tsx   # Modal with confirmation checkbox & email editor
│   │   ├── followups/
│   │   │   ├── FollowUpsList.tsx   # Follow-ups with non-color reliant overdue alerts
│   │   │   └── NewFollowUpModal.tsx# Form to schedule tasks using React Hook Form
│   │   └── settings/
│   │       └── IntegrationCard.tsx # Integration status card with demo mode labeling
│   └── pages/
│       ├── DashboardPage.tsx       # Operations center with metric cards
│       ├── AgentWorkspacePage.tsx  # Two-panel Alexa+ resolution workspace
│       ├── CasesPage.tsx           # Full support cases audit list
│       ├── CaseDetailsPage.tsx     # Dedicated case investigation details
│       ├── FollowUpsPage.tsx       # Checkpoints & follow-up task manager
│       └── SettingsPage.tsx        # System health & connector status
```

---

## 📜 Available NPM Scripts

- `npm run dev` — Starts Vite dev server on `http://127.0.0.1:3000`
- `npm run build` — Compiles TypeScript (`tsc -b`) and produces production bundle in `dist/`
- `npm run lint` — Runs Oxlint for code quality and hook safety checks
- `npm run preview` — Locally previews the production build

---

## ⚖️ Hackathon Compliance & Disclaimer

*ResolveLoop AI is a hackathon submission prototype demonstrating an Alexa+-style simulated conversational experience. It is not affiliated with or endorsed by Amazon Alexa devices or third-party carriers. All carrier tracking numbers, customer names, and transactions are synthetic sample data.*
