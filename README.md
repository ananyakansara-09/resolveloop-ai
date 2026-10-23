# ResolveLoop AI — Autonomous Customer Support Resolution Assistant

[![Amazon Developer Hackathon 2026 - Alexa+ Track](https://img.shields.io/badge/Amazon_Developer_Hackathon_2026-Alexa%2B_Track-FF9900?style=for-the-badge&logo=amazon&logoColor=white)](https://developer.amazon.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Pytest](https://img.shields.io/badge/Pytest-17_Passed-brightgreen?style=for-the-badge&logo=pytest&logoColor=white)](https://docs.pytest.org/)

**ResolveLoop AI** is an AI-powered ecommerce customer-support operations center and autonomous resolution assistant engineered for the **Amazon Developer Hackathon 2026 (Alexa+ Track)**. 

Tailored for ecommerce merchants, ResolveLoop AI automates the entire investigation lifecycle for delayed orders: fetching real-time carrier telemetry, deterministically evaluating store policies, synthesizing evidence-backed resolution plans, generating customer communications awaiting human approval, safely executing merchant-approved actions via verified adapters, and scheduling persistent follow-up checkpoints.

---

## 📑 Table of Contents

- [System Architecture & 14-Step Lifecycle](#-system-architecture--14-step-lifecycle)
- [Monorepo Directory Structure](#-monorepo-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (FastAPI & SQLite)](#1-backend-setup-fastapi--sqlite)
  - [2. Frontend Setup (React & Vite)](#2-frontend-setup-react--vite)
- [Environment Configuration](#-environment-configuration)
  - [Backend Environment Variables (`backend/.env`)](#backend-environment-variables-backendenv)
  - [Frontend Environment Variables (`fronntend/.env`)](#frontend-environment-variables-fronntendenv)
- [Order KL-1042 Hackathon Demo Flow](#-order-kl-1042-hackathon-demo-flow)
- [Application Interfaces & Workspaces](#-application-interfaces--workspaces)
  - [1. Operations Command Center (`/`)](#1-operations-command-center-)
  - [2. Two-Panel AI Assistant Workspace (`/assistant`)](#2-two-panel-ai-assistant-workspace-assistant)
  - [3. Human-in-the-Loop Approval Workflow](#3-human-in-the-loop-approval-workflow)
  - [4. Dedicated Case Management & Audit Trail (`/cases` & `/cases/:id`)](#4-dedicated-case-management--audit-trail-cases--casesid)
  - [5. Follow-up Checkpoint Management (`/follow-ups`)](#5-follow-up-checkpoint-management-follow-ups)
  - [6. Settings & Integration Status (`/settings`)](#6-settings--integration-status-settings)
- [Complete REST API Reference](#-complete-rest-api-reference)
- [AI Providers & Tool Calling Engine](#-ai-providers--tool-calling-engine)
- [Model Context Protocol (MCP) Server](#-model-context-protocol-mcp-server)
- [Automated Testing & Quality Checks](#-automated-testing--quality-checks)
- [Production Roadmap & Multi-Tenant Capabilities](#-production-roadmap--multi-tenant-capabilities)
- [Security & Deterministic Guardrails](#-security--deterministic-guardrails)
- [Hackathon Compliance & Disclaimer](#-hackathon-compliance--disclaimer)

---

## 🏗️ System Architecture & 14-Step Lifecycle

When a merchant or Alexa+ simulated interface submits:
> *"Investigate order KL-1042, find out why it is delayed, check our policy, prepare a customer response, and follow up tomorrow if it remains unresolved."*

The system executes a strictly deterministic and auditable **14-step verified lifecycle**:

```mermaid
flowchart TD
    A[Shop Owner / Alexa+ Query] --> B[FastAPI Endpoint: POST /api/agent/run]
    B --> C[Agent Orchestration Service]
    
    subgraph Tool Calling Registry (Deterministic Execution)
        C --> D[lookup_order: Fetch Customer & Item Details]
        C --> E[get_shipping_status: Carrier Transit Telemetry & Exceptions]
        C --> F[check_store_policy: Evaluate Shipping SLA & Refund Rules]
        C --> G[draft_customer_email: Synthesize Empathetic Customer Draft]
        C --> H[create_support_case: Persist Case Record]
        C --> I[create_follow_up: Schedule Next-Day Checkpoint]
    end

    G --> J[Store Proposed Action as 'pending' with Idempotency Key]
    J --> K[Frontend Two-Panel Workspace Displays Evidence & Email Draft]
    
    K --> L{Human-in-the-Loop: Merchant Review}
    L -- Reject --> M[POST /api/cases/{id}/reject: Log Reason & Update Case]
    L -- Approve --> N[POST /api/cases/{id}/approve: Explicit Confirmation]
    
    N --> O[Execute Approved Action: Dispatch to OutboxMessage]
    O --> P[verify_action_result: Confirm Persistence in DB]
    P --> Q[Log Audit Trail Event: Actor, Timestamp & Payload]
    Q --> R[Return Updated Case & Real-Time Notification to Frontend]
```

### The 14 Verified Steps:
1. **Request Ingestion & Schema Validation:** Validates query string, case IDs, and payload types via Pydantic v2.
2. **Persistent Support Case:** Retrieves or initializes an active `SupportCase` database record.
3. **Order Lookup (`lookup_order`):** Queries order item details, total purchase amount, customer name, and VIP loyalty tier.
4. **Shipping Event Tracking (`get_shipping_status`):** Queries carrier timeline and isolates transit exceptions (e.g. Siskiyou Pass winter storm closure, delay 24-48 hours).
5. **Deterministic Policy Check (`check_store_policy`):** Evaluates store rules. Concessions and external communications require explicit merchant authorization; refunds are prohibited while packages are actively in transit.
6. **Evidence-Based Recommendation:** Synthesizes factual findings into an actionable recommendation without AI hallucinations.
7. **Draft Customer Response (`draft_customer_email`):** Generates an empathetic customer notification citing specific carrier tracking facts and revised ETA.
8. **Pending Approval Record:** Persists proposed action to database with `pending` status and a unique idempotency key.
9. **Real-Time Telemetry Streaming:** Progressive tool-call telemetry displays live milestones (`Running` ➔ `Completed`).
10. **Human-in-the-Loop Gate:** Enforces explicit store-owner authorization before executing any financial courtesy credit or customer dispatch.
11. **Controlled Execution Adapter:** Dispatches approved email to a simulated outbox (`OutboxMessage`).
12. **State Verification (`verify_action_result`):** Asserts persisted records in the database before acknowledging completion.
13. **Follow-Up Scheduling (`create_follow_up`):** Creates persistent task scheduled for carrier checkpoint review tomorrow.
14. **Audit Trail Persistence:** Every state transition, action payload, and actor note is permanently logged in `AuditEvent`.

---

## 📁 Monorepo Directory Structure

```
resolveloop-ai/
├── README.md                      # Single Global Master Documentation (this file)
├── .gitignore                     # Monorepo ignore rules (logs, cache, node_modules)
│
├── backend/                       # FastAPI Backend Service
│   ├── app/
│   │   ├── main.py                # FastAPI entrypoint, CORS, lifespan, exception handlers
│   │   ├── mcp_server.py          # Model Context Protocol (MCP) server (Streamable HTTP)
│   │   ├── api/routes/            # REST API endpoints
│   │   │   ├── health.py          # GET /health
│   │   │   ├── dashboard.py       # GET /api/dashboard
│   │   │   ├── agent.py           # POST /api/agent/run
│   │   │   ├── orders.py          # GET /api/orders/{id}, GET /api/orders/{id}/shipping
│   │   │   ├── cases.py           # GET, POST /api/cases, /approve, /reject
│   │   │   └── follow_ups.py      # GET, POST, PATCH /api/follow-ups
│   │   ├── core/                  # Pydantic Settings configuration & structured logging
│   │   │   ├── config.py          # App settings (.env parser)
│   │   │   └── logging.py         # Structured, credential-safe logging
│   │   ├── db/                    # SQLAlchemy engine, session maker, seeder, migrations
│   │   │   ├── session.py         # SQLite / PostgreSQL session factory & get_db
│   │   │   ├── seed.py            # Synthetic seeder (Order KL-1042, store policies)
│   │   │   └── migrations/        # Alembic environment and migration versions
│   │   ├── models/                # SQLAlchemy 2.0 Declarative Models
│   │   │   ├── order.py           # Order & OrderItem
│   │   │   ├── shipping.py        # ShippingEvent carrier milestone logs
│   │   │   ├── policy.py          # Policy store rules & thresholds
│   │   │   ├── case.py            # SupportCase state entity
│   │   │   ├── message.py         # Conversation history
│   │   │   ├── action.py          # ProposedAction with idempotency keys
│   │   │   ├── follow_up.py       # FollowUp checkpoint tasks
│   │   │   ├── audit.py           # AuditEvent immutable log trail
│   │   │   └── outbox.py          # OutboxMessage simulated email dispatch
│   │   ├── schemas/               # Pydantic v2 schemas for all requests & responses
│   │   ├── repositories/          # Repository pattern layer for database access
│   │   ├── services/              # Business logic (AgentService, PolicyService, ApprovalService)
│   │   ├── tools/                 # ToolRegistry & 8 verified resolution tools
│   │   │   ├── registry.py        # Tool registry, schema generator, execution safety
│   │   │   ├── order_tools.py     # lookup_order
│   │   │   ├── shipping_tools.py  # get_shipping_status
│   │   │   ├── policy_tools.py    # check_store_policy
│   │   │   └── communication_tools.py # draft_customer_email, create_follow_up, etc.
│   │   └── providers/             # AI Provider abstraction
│   │       ├── base.py            # BaseAIProvider abstract interface
│   │       ├── mock_provider.py   # Deterministic local orchestrator
│   │       └── bedrock_provider.py# Amazon Bedrock Runtime Converse API integration
│   ├── tests/                     # 17 automated Pytest test cases
│   ├── alembic.ini                # Alembic database migration config
│   ├── requirements.txt           # Python backend dependencies
│   ├── pytest.ini                 # Pytest runner configuration
│   └── .env.example               # Backend environment variable template
│
└── fronntend/                     # React 19 + TypeScript + Vite Frontend Application
    ├── index.html                 # App entry HTML with Inter typography & SEO tags
    ├── package.json               # Frontend dependencies and npm scripts
    ├── vite.config.ts             # Vite bundler configuration
    ├── tsconfig.json              # TypeScript root configuration
    ├── .oxlintrc.json             # Oxlint code quality configuration
    ├── .env.example               # Frontend environment template
    ├── src/
    │   ├── main.tsx               # React root mount
    │   ├── App.tsx                # React Router v7 routes & global context providers
    │   ├── index.css              # Custom design system tokens, variables & glassmorphism
    │   ├── api/                   # Axios client with resilient mock fallback
    │   │   ├── apiClient.ts       # Configured Axios client with automatic fallback
    │   │   ├── agentApi.ts        # POST /api/agent/run
    │   │   ├── casesApi.ts        # Cases list, single case, approve, reject
    │   │   ├── dashboardApi.ts    # Dashboard metrics & health check
    │   │   ├── ordersApi.ts       # Order metadata & tracking timelines
    │   │   ├── followUpsApi.ts    # Task scheduling and status updates
    │   │   └── mock/              # Synthetic datasets & in-memory simulator
    │   ├── components/            # Reusable UI component architecture
    │   │   ├── layout/            # AppLayout, Sidebar (navy #0b1329), TopNavbar
    │   │   ├── common/            # StatusBadge, PriorityBadge, Skeletons, ErrorAlert
    │   │   ├── agent/             # ChatMessageList, ChatInput, ToolExecutionTracker,
    │   │   │                      # OrderSummaryCard, ShippingTimeline, PolicyEvidenceCard, ProposedActionCard
    │   │   ├── cases/             # CasesTable, CaseAuditTrail, ApprovalModal
    │   │   ├── followups/         # FollowUpsList, NewFollowUpModal
    │   │   └── settings/          # IntegrationCard status cards
    │   ├── context/               # Global state (AgentContext, ToastContext)
    │   ├── types/                 # Shared TypeScript interfaces (Agent, Case, Order, etc.)
    │   └── pages/                 # Full pages: DashboardPage, AgentWorkspacePage, CasesPage,
    │                              # CaseDetailsPage, FollowUpsPage, SettingsPage
    └── public/                    # Static assets
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.11+ (tested on Python 3.11, 3.12, 3.14)
- **Node.js**: 18.0.0+ (tested on Node 22.x)
- **npm**: 9.x+

---

### 1. Backend Setup (FastAPI & SQLite)

Open a terminal in the root directory:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python virtual environment
# Windows (PowerShell):
python -m venv .venv
.venv\Scripts\Activate.ps1

# macOS / Linux:
python3 -m venv .venv
source .venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Configure environment
# Windows:
copy .env.example .env
# macOS / Linux:
cp .env.example .env

# 5. Run Alembic database migrations
alembic upgrade head

# 6. Seed synthetic demo records (Order KL-1042 and store policies)
python -m app.db.seed

# 7. Start the FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend server is now running:
- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`
- **Health Check Endpoint**: `http://localhost:8000/health`

*(Optional) Start the official MCP Server in a separate terminal:*
```bash
python -m app.mcp_server
# Exposes MCP tools over Streamable HTTP at http://127.0.0.1:8001
```

---

### 2. Frontend Setup (React & Vite)

Open a second terminal in the root directory:

```bash
# 1. Navigate to frontend directory
cd fronntend

# 2. Install dependencies
npm install

# 3. Configure environment
# Windows:
copy .env.example .env
# macOS / Linux:
cp .env.example .env

# 4. Start the Vite development server
npm run dev
```

The web application is now accessible at **`http://localhost:5173`** (or the port specified by Vite).

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`backend/.env`)

```ini
# Application Mode
APP_ENV=development
APP_NAME="ResolveLoop AI Backend"
APP_VERSION="1.0.0"

# Database Configuration (SQLite by default, supports PostgreSQL & MySQL)
DATABASE_URL=sqlite:///./resolveloop.db

# AI Provider Selection: 'mock' (local zero-dependency) or 'bedrock' (AWS Bedrock)
AI_PROVIDER=mock

# Amazon Bedrock Settings (required only if AI_PROVIDER=bedrock)
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=

# CORS Allowed Origins
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

# Operational Parameters
TOOL_TIMEOUT_SECONDS=15
MAX_AGENT_ITERATIONS=5
LOG_LEVEL=INFO
```

### Frontend Environment Variables (`fronntend/.env`)

```ini
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8000

# Development Mock Service Toggle:
# Set to 'false' to communicate with the real FastAPI backend
# Set to 'true' for standalone client-side demo mode with synthetic data
VITE_USE_MOCK_API=false
```

> **Resilient Fallback**: When `VITE_USE_MOCK_API=false` and the backend is unreachable, the frontend gracefully falls back to the synthetic dataset with a console notice so UI testing is never interrupted.

---

## 🎯 Order KL-1042 Hackathon Demo Flow

To experience the complete **Amazon Developer Hackathon 2026** resolution lifecycle:

1. **Open the Operations Command Center** (`http://localhost:5173/`):
   - Review live operational metrics: *Total Cases, Open Investigations, Awaiting Approval, Follow-ups Due*.
   - Click the prominent **"Launch Order KL-1042 Demo"** button (or click **"Ask ResolveLoop"** in the navigation bar).

2. **Inspect the Two-Panel Resolution Assistant** (`/assistant`):
   - The query: `"Investigate order KL-1042, find out why it is delayed, check our policy, prepare a customer response, and follow up tomorrow if it remains unresolved."` is submitted to the backend orchestrator.
   - Watch the **Tool Execution Tracker** sequentially progress in real-time:
     1. `lookup_order(order_id="KL-1042")` ➔ Fetches customer Sarah Connor, VIP tier, item details.
     2. `get_shipping_status(order_id="KL-1042")` ➔ Extracts Siskiyou Pass winter storm closure exception.
     3. `check_store_policy(policy_type="shipping_delay")` ➔ Verifies delay communication eligibility & refund constraint.
     4. `draft_customer_email(...)` ➔ Prepares customer notification email with revised arrival window.
     5. `create_support_case(...)` ➔ Links data to persistent case record `CASE-KL1042`.
     6. `create_follow_up(...)` ➔ Schedules checkpoint task for tomorrow.
   - Review the **Context Workbench (Right Panel)**:
     - **Customer & Order Card**: Shows item details, total amount ($189.99), and customer loyalty tier.
     - **Carrier Telemetry Timeline**: Visualizes transit milestones and highlights the weather delay event.
     - **Store Policy Evaluation**: Displays matched rules (`POL-SHIPPING-DELAY`).
     - **Proposed Action Card**: Details the pending email action awaiting merchant authorization.

3. **Authorize the Action (Human-in-the-Loop)**:
   - Click **"Review & Authorize Action"**.
   - Review the modal showing the editable customer email draft.
   - Select the required checkbox: *"I explicitly authorize this action to be executed"*.
   - Click **"Authorize & Dispatch"**.
   - The backend validates the idempotency key, records execution in `OutboxMessage`, confirms persistence via `verify_action_result`, and marks the action approved.

4. **Verify Case Details & Audit Trail** (`/cases` ➔ View Case):
   - Confirm status transitioned from `awaiting_approval` to `approved` / `resolved`.
   - Inspect the **Audit Trail** displaying timestamped events for query analysis, tool execution, merchant approval, and email dispatch.

5. **Verify Scheduled Follow-up** (`/follow-ups`):
   - Review the scheduled checkpoint task for tomorrow.
   - Toggle status to completed or add custom notes.

6. **Validate State Persistence**:
   - Refresh the browser (`F5` or `Ctrl + R`).
   - Notice all updates persist in SQLite via SQLAlchemy and remain consistent across sessions.

---

## 🖥️ Application Interfaces & Workspaces

### 1. Operations Command Center (`/`)
- **Real-Time KPI Cards**: Total support cases, cases awaiting merchant approval, resolved issues, and follow-ups due.
- **Recent Cases Grid**: Interactive table with status badges, priority markers, and direct workspace transitions.
- **Top Quick Bar**: Global order ID search and system health status badge.

### 2. Two-Panel AI Assistant Workspace (`/assistant`)
- **Left Panel (Interaction & Telemetry)**:
  - Alexa+ style animated audio pulse and conversational message stream.
  - Interactive starter prompt chips for instant demo queries.
  - Real-time tool execution status badges (`Running`, `Completed`, `Failed`).
- **Right Panel (Evidence & Resolution Workbench)**:
  - Customer lifetime value, order itemization, and delivery address.
  - Step-by-step carrier tracking milestone timeline with delay exceptions.
  - Policy evidence citations confirming rule compliance.
  - Proposed action summary with email preview and financial impact calculations.

### 3. Human-in-the-Loop Approval Workflow
- Consequential actions (financial concessions, customer email dispatches) are blocked until explicit merchant approval is given.
- Store owners can edit email drafts directly in the authorization modal.
- Rejection workflow with mandatory rationale logging.
- Protected by database-enforced idempotency keys to eliminate double-dispatch.

### 4. Dedicated Case Management & Audit Trail (`/cases` & `/cases/:id`)
- Deep audit trail logging actors (`agent`, `user`, `system`), timestamps, and detailed action notes.
- Linked follow-up tasks, order items, and historical message threads.

### 5. Follow-up Checkpoint Management (`/follow-ups`)
- Overdue tasks clearly highlighted using **bold textual alert badges, warning icons, and borders without relying solely on color (WCAG accessible)**.
- Quick "Mark Complete" and "Reopen" toggles.
- Modal powered by **React Hook Form** to schedule new follow-ups.

### 6. Settings & Integration Status (`/settings`)
- Live health check verification against `GET /health`.
- Status dashboard for simulated connectors: **Alexa+ Voice Assistant**, **Shopify Store Sync**, **ShipStation / FedEx Tracking API**, **Customer Email Dispatcher**, and **Store Policy Rule Engine**.
- Strictly adheres to security standards: **no private API keys or credentials exposed to client-side code**.

---

## 📡 Complete REST API Reference

### 1. Health Check
`GET /health`
```json
{
  "status": "healthy",
  "service": "ResolveLoop AI Backend",
  "version": "1.0.0",
  "environment": "development",
  "ai_provider": "mock"
}
```

### 2. Dashboard Metrics
`GET /api/dashboard`
```json
{
  "total_cases": 1,
  "cases_awaiting_approval": 1,
  "resolved_cases": 0,
  "follow_ups_due": 0,
  "recent_cases": [
    {
      "id": "CASE-KL1042",
      "order_id": "KL-1042",
      "summary": "Shipping delay investigation for order KL-1042",
      "status": "awaiting_approval",
      "priority": "medium",
      "created_at": "2026-10-23T10:00:00Z"
    }
  ]
}
```

### 3. Agent Execution
`POST /api/agent/run`
**Request Payload:**
```json
{
  "message": "Investigate order KL-1042, find out why it is delayed, check our policy, prepare a customer response, and follow up tomorrow if it remains unresolved.",
  "caseId": null
}
```
**Response Summary:**
Returns the structured conversational response, tool execution logs, order metadata, shipping telemetry, policy evaluation citations, and the pending proposed action.

### 4. Orders & Shipping
- `GET /api/orders/KL-1042`: Order details, customer metadata, line items.
- `GET /api/orders/KL-1042/shipping`: Carrier tracking events, locations, timestamps, and delay flags.

### 5. Support Cases & Approvals
- `GET /api/cases?status=awaiting_approval&page=1&limit=10`: Paginated list of cases.
- `GET /api/cases/{case_id}`: Full case record, audit events, messages, and proposed action.
- `POST /api/cases/{case_id}/approve`:
  ```json
  {
    "action_id": "ACT-1042-EMAIL",
    "actor": "store_owner",
    "notes": "Verified delay with carrier; customer notification approved."
  }
  ```
- `POST /api/cases/{case_id}/reject`:
  ```json
  {
    "action_id": "ACT-1042-EMAIL",
    "reason": "Wait for carrier dispatch confirmation first."
  }
  ```

### 6. Follow-up Tasks
- `GET /api/follow-ups`: List all follow-up tasks.
- `POST /api/cases/{case_id}/follow-ups`:
  ```json
  {
    "description": "Check if Siskiyou Pass mountain route reopened",
    "due_date": "2026-10-24T09:00:00Z"
  }
  ```
- `PATCH /api/follow-ups/{follow_up_id}`:
  ```json
  {
    "status": "completed",
    "description": "Carrier delivered package successfully."
  }
  ```

---

## 🧠 AI Providers & Tool Calling Engine

ResolveLoop AI utilizes a decoupled provider architecture (`BaseAIProvider`):

| Provider | Status | Description |
|---|---|---|
| **MockProvider** | **Active & Verified** | Deterministic orchestrator that executes the real tool registry and database services. Perfect for local development, fast offline hackathon demos, and automated testing. |
| **BedrockProvider** | **Implemented** | Full Amazon Bedrock Runtime `converse` API integration with native tool definitions (`toolConfig`). Connects to `anthropic.claude-3-5-sonnet-20241022-v2:0` when AWS credentials are configured. |
| **MCP Server** | **Active** | Exposes 8 validated tools via the official Model Context Protocol Python SDK (`mcp`) over Streamable HTTP transport. |

### Verified Tool Calling Registry
1. `lookup_order(order_id)`: Fetches order items, customer profile, status, and dates.
2. `get_shipping_status(order_id)`: Retrieves carrier transit milestones, locations, and exceptions.
3. `check_store_policy(policy_type, order_status)`: Evaluates SLA guarantee and concession rules.
4. `draft_customer_email(order_id, reason, eta)`: Generates personalized customer notification.
5. `create_support_case(order_id, summary, priority)`: Creates persistent case entity.
6. `create_follow_up(case_id, description, due_date)`: Schedules review reminder.
7. `verify_action_result(action_id)`: Verifies database persistence prior to marking completion.
8. `execute_approved_action(action_id)`: Dispatches email to simulated outbox (`OutboxMessage`).

---

## 🔌 Model Context Protocol (MCP) Server

The backend includes a fully functional Model Context Protocol server implemented using the official `mcp` Python SDK:

```bash
cd backend
python -m app.mcp_server
```

- **Protocol**: Model Context Protocol (MCP) v2.3.0
- **Transport**: Streamable HTTP
- **Default Endpoint**: `http://127.0.0.1:8001`
- **Exposed Tools**: `lookup_order`, `get_shipping_status`, `check_store_policy`, `draft_customer_email`, `create_support_case`, `create_follow_up`, `verify_action_result`, `execute_approved_action`

---

## 🧪 Automated Testing & Quality Checks

### Backend Automated Test Suite (17 Tests)
Run the automated test suite with pytest:

```bash
cd backend
pytest -v
```

**Coverage Breakdown:**
- `test_health_and_dashboard.py`: Service health and live KPI aggregation calculations.
- `test_orders_and_shipping.py`: Database lookup and carrier timeline retrieval.
- `test_policy.py`: Deterministic guardrails (in-transit refund rejection, delay email eligibility).
- `test_agent_orchestration.py`: Full tool orchestration cycle for query `KL-1042`.
- `test_approvals.py`: Approval execution, dispatch to outbox, verification, and duplicate approval prevention.
- `test_follow_ups.py`: Follow-up scheduling and status transitions.
- `test_edge_cases_and_persistence.py`: Error handling, missing orders, transaction rollbacks.
- `test_hackathon_demo_flow.py`: Complete 14-step end-to-end hackathon lifecycle.

**Result: 17 passed in ~1.1 seconds.**

### Frontend Quality Checks
```bash
cd fronntend
npm run lint      # Code quality check using Oxlint
npm run build     # Full TypeScript compilation (tsc -b) & Vite production build
npm run preview   # Preview the production bundle locally
```

---

## 🔮 Production Roadmap & Multi-Tenant Capabilities

For multi-tenant ecommerce production deployments:

1. **Authentication & Tenant Isolation**:
   - `POST /auth/login` and JWT token issuance.
   - `X-Store-Id` header isolation for multi-store support on a single deployment.
2. **Server-Sent Events (SSE) Streaming**:
   - `GET /api/agent/run/stream` for real-time sub-second streaming of tool calls as they execute on remote carrier APIs.
3. **Carrier Webhook Ingestion**:
   - Ingest webhooks from FedEx, UPS, and DHL (`POST /api/webhooks/carrier`) to trigger autonomous investigations automatically without manual merchant prompts.
4. **Live Customer Email Gateway**:
   - Integration with Amazon SES / SendGrid to dispatch merchant-approved customer reassurance emails.
5. **Shopify Embedded App Bridge**:
   - Direct OAuth installation flow into Shopify Admin embedded apps.

---

## 🔒 Security & Deterministic Guardrails

1. **Deterministic Guardrails**: The LLM cannot authorize refunds, bypass store policy rules, or approve its own actions.
2. **Human-in-the-Loop Enforced**: Outbound emails and customer credits remain in `pending` status until authorized by a human merchant.
3. **Idempotency Guarantees**: Actions have unique idempotency keys preventing duplicate email dispatch or double concessions.
4. **Verified Persistence**: Actions are only acknowledged after verifying persistent database records.
5. **Zero Client Secrets**: No AWS access keys, carrier tokens, or passwords are exposed to the frontend browser bundle.

---

## ⚖️ Hackathon Compliance & Disclaimer

*ResolveLoop AI is an independent prototype developed for the **Amazon Developer Hackathon 2026 (Alexa+ Track)**. In accordance with submission guidelines, the application simulates an Alexa+-style voice and natural language resolution assistant using verified REST APIs and stateful backend adapters. It is not affiliated with or endorsed by Amazon Alexa devices or third-party logistics carriers. All carrier tracking numbers, customer names, and transactions are synthetic sample data.*
