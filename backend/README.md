# ResolveLoop AI - Backend

**ResolveLoop AI** is an AI-powered ecommerce customer-support resolution assistant engineered for the **Amazon Developer Hackathon 2026 Alexa+ track**. It automates the investigation of delayed orders, evaluates store policies deterministically, formulates evidence-based recommendations, drafts customer communications awaiting merchant approval, executes approved actions through verified adapters, and schedules follow-up tasks.

---

## 1. Core Architecture & Workflow

When a shop owner or Alexa+ interface submits:
> *"Investigate order KL-1042, find out why it is delayed, check our policy, prepare a customer response, and follow up tomorrow if it remains unresolved."*

The backend executes a 14-step verified lifecycle:
1. **Request Ingestion & Validation:** Validates query and input schema.
2. **Persistent Support Case:** Retrieves or creates a persistent `SupportCase` record.
3. **Order Lookup (`lookup_order`):** Fetches customer details, purchase items, status, and dates.
4. **Shipping Event Tracking (`get_shipping_status`):** Retrieves carrier tracking timeline and extracts transit exceptions (e.g., Siskiyou Pass winter storm closure).
5. **Deterministic Policy Check (`check_store_policy`):** Evaluates active store rules. Outbound emails and concessions strictly require explicit merchant approval; refunds are disallowed while packages are actively in carrier transit.
6. **Evidence-Based Recommendation:** Synthesizes facts into an actionable recommendation without hallucinations.
7. **Draft Customer Response (`draft_customer_email`):** Generates an empathetic customer notification citing specific carrier tracking facts.
8. **Pending Approval Record:** Stores the proposed action in the database with status `pending` and a unique idempotency key.
9. **Explicit Human Approval (`/api/cases/{case_id}/approve`):** Waits for merchant decision.
10. **Controlled Execution Adapter:** Dispatches approved email to a simulated outbox (`OutboxMessage`).
11. **State Verification (`verify_action_result`):** Confirms persisted records in the database before acknowledging completion.
12. **Follow-Up Scheduling (`create_follow_up`):** Creates a persistent follow-up reminder for tomorrow.
13. **Audit Trail Persistence:** Every state transition and decision is logged in `AuditEvent`.
14. **Structured API Response:** Returns real-time structured data to the frontend or Alexa+ skill.

---

## 2. Technology Stack

- **Language:** Python 3.11+ (tested on Python 3.14)
- **API Framework:** FastAPI 0.156.x with Pydantic v2
- **Database ORM:** SQLAlchemy 2.0 (configured for SQLite and PostgreSQL/MySQL)
- **Migrations:** Alembic 1.18.x with batch support
- **Testing:** Pytest with FastAPI TestClient
- **AI Providers:** 
  - `MockProvider`: Deterministic local development and hackathon demo provider.
  - `BedrockProvider`: Amazon Bedrock Runtime Converse API integration with native tool calling (`toolConfig`).
- **Optional MCP Server:** Official `mcp` SDK v2.3.0 (`MCPServer`) with Streamable HTTP transport.

---

## 3. Project Structure

```
amazon-hackthon/
├── app/
│   ├── main.py                     # FastAPI application entrypoint, lifespan, CORS, error handlers
│   ├── mcp_server.py               # Optional Model Context Protocol (MCP) server
│   ├── api/
│   │   └── routes/
│   │       ├── health.py           # GET /health
│   │       ├── dashboard.py        # GET /api/dashboard
│   │       ├── agent.py            # POST /api/agent/run
│   │       ├── orders.py           # GET /api/orders/{id}, GET /api/orders/{id}/shipping
│   │       ├── cases.py            # GET /api/cases, GET /api/cases/{id}, POST /api/cases, approve, reject
│   │       └── follow_ups.py       # GET /api/follow-ups, POST, PATCH
│   ├── core/
│   │   ├── config.py               # Pydantic Settings configuration
│   │   └── logging.py              # Structured, credential-safe logging
│   ├── db/
│   │   ├── session.py              # SQLAlchemy engine, sessionmaker, Base, get_db dependency
│   │   ├── seed.py                 # Idempotent database seeder (Order KL-1042, policies)
│   │   └── migrations/             # Alembic migration environment and versions
│   ├── models/                     # SQLAlchemy 2.x declarative models
│   │   ├── order.py                # Order model
│   │   ├── shipping.py             # ShippingEvent model
│   │   ├── policy.py               # Policy model
│   │   ├── case.py                 # SupportCase model
│   │   ├── message.py              # Message conversation history
│   │   ├── action.py               # ProposedAction with idempotency_key
│   │   ├── follow_up.py            # FollowUp reminder tasks
│   │   ├── audit.py                # AuditEvent trail
│   │   └── outbox.py               # OutboxMessage simulated email dispatch
│   ├── schemas/                    # Pydantic v2 validation schemas
│   ├── repositories/               # Repository pattern layer for all database operations
│   ├── services/
│   │   ├── policy_service.py       # Deterministic policy validation rules
│   │   ├── case_service.py         # Support case lifecycle management
│   │   ├── approval_service.py     # Approval execution, idempotency, verification
│   │   ├── follow_up_service.py    # Follow-up scheduling and status updates
│   │   └── agent_service.py        # Complete resolution assistant orchestrator
│   ├── tools/
│   │   ├── registry.py             # ToolRegistry with schema generator and execution safety
│   │   ├── order_tools.py          # lookup_order
│   │   ├── shipping_tools.py       # get_shipping_status
│   │   ├── policy_tools.py         # check_store_policy
│   │   └── communication_tools.py  # create_support_case, draft_customer_email, create_follow_up, etc.
│   └── providers/
│       ├── base.py                 # BaseAIProvider abstract interface
│       ├── mock_provider.py        # Deterministic mock provider using real tool registry
│       └── bedrock_provider.py     # Amazon Bedrock Converse API integration
├── tests/                          # Complete automated test suite (17 tests)
│   ├── conftest.py
│   ├── test_health_and_dashboard.py
│   ├── test_orders_and_shipping.py
│   ├── test_policy.py
│   ├── test_agent_orchestration.py
│   ├── test_approvals.py
│   ├── test_follow_ups.py
│   ├── test_edge_cases_and_persistence.py
│   └── test_hackathon_demo_flow.py
├── alembic.ini
├── requirements.txt
├── pytest.ini
├── .env.example
├── .env
└── README.md
```

---

## 4. Setup and Installation

### 1. Clone & Enter Directory
```bash
cd amazon-hackthon
```

### 2. Create and Activate Virtual Environment (Recommended)
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
Default configuration runs entirely locally with zero external credentials:
```env
APP_ENV=development
APP_NAME="ResolveLoop AI Backend"
APP_VERSION="1.0.0"
DATABASE_URL=sqlite:///./resolveloop.db
AI_PROVIDER=mock
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
TOOL_TIMEOUT_SECONDS=15
MAX_AGENT_ITERATIONS=5
LOG_LEVEL=INFO
```

---

## 5. Database Migrations & Seeding

### Run Alembic Migrations
```bash
alembic upgrade head
```

### Seed Synthetic Demo Records
```bash
python -m app.db.seed
```
This populates the primary demo order:
- **Order ID:** `KL-1042`
- **Customer:** `Sarah Connor` (`sarah.c@example.com`)
- **Status:** `delayed`
- **Shipping Events:**
  1. Picked up at Seattle Fulfillment Center, WA
  2. In transit at Portland Sorting Hub, OR
  3. Transit exception at Siskiyou Pass, CA (Severe winter storm mountain pass closure, delay 24-48 hours)
- **Active Policies:** `POL-SHIPPING-DELAY`, `POL-REFUND-RETURNS`, `POL-CUSTOMER-COMMUNICATION`

---

## 6. Running the Application

### Start FastAPI Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive OpenAPI / Swagger UI: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

### Start Optional MCP Server
```bash
python -m app.mcp_server
```
Runs the official MCP Server exposing the validated tool registry over Streamable HTTP transport at `http://127.0.0.1:8001`.

---

## 7. Running Automated Tests

Run the full automated test suite with pytest:
```bash
pytest -v
```

### Test Coverage Highlights
- `test_health_and_dashboard.py`: Service health verification, live calculated dashboard metrics.
- `test_orders_and_shipping.py`: Persisted order lookup and shipping event timeline retrieval.
- `test_policy.py`: Deterministic store policy enforcement (in-transit refund rejection, delay email eligibility).
- `test_agent_orchestration.py`: End-to-end tool orchestration for query `KL-1042`.
- `test_approvals.py`: Approval execution, controlled simulated dispatch, verification, and duplicate approval protection.
- `test_follow_ups.py`: Follow-up creation, query, and status transition.
- `test_edge_cases_and_persistence.py`: Missing orders, error handling, session persistence.
- `test_hackathon_demo_flow.py`: Complete 14-step hackathon demo lifecycle.

**Result: 17 passed in ~3 seconds.**

---

## 8. API Endpoints Reference

### 1. Health
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

### 2. Dashboard
`GET /api/dashboard`
```json
{
  "total_cases": 1,
  "cases_awaiting_approval": 1,
  "resolved_cases": 0,
  "follow_ups_due": 0,
  "recent_cases": [
    {
      "id": "CASE-7B89A120",
      "order_id": "KL-1042",
      "summary": "Shipping transit investigation for order KL-1042",
      "status": "awaiting_approval",
      "priority": "medium",
      "created_at": "2026-10-21T11:00:00Z"
    }
  ]
}
```

### 3. Agent Execution
`POST /api/agent/run`
```json
{
  "message": "Investigate order KL-1042, find out why it is delayed, check our policy, prepare a customer response, and follow up tomorrow if it remains unresolved.",
  "caseId": null
}
```

### 4. Orders & Shipping
- `GET /api/orders/KL-1042`
- `GET /api/orders/KL-1042/shipping`

### 5. Cases & Approvals
- `GET /api/cases?status=awaiting_approval&page=1&limit=10`
- `GET /api/cases/{case_id}`
- `POST /api/cases/{case_id}/approve`
  ```json
  {
    "action_id": "ACT-12AB34CD",
    "actor": "store_owner",
    "notes": "Verified delay with carrier; customer notification approved."
  }
  ```
- `POST /api/cases/{case_id}/reject`
  ```json
  {
    "action_id": "ACT-12AB34CD",
    "reason": "Wait for carrier dispatch confirmation first."
  }
  ```

### 6. Follow-ups
- `GET /api/follow-ups`
- `POST /api/cases/{case_id}/follow-ups`
- `PATCH /api/follow-ups/{follow_up_id}`
  ```json
  {
    "status": "completed",
    "description": "Carrier delivered package successfully."
  }
  ```

---

## 9. AI Provider & Integration Status

| Component | Status | Description |
| :--- | :--- | :--- |
| **MockProvider** | **Fully Tested & Verified** | Deterministic orchestrator that executes the real tool registry and DB services. Ideal for local dev, automated testing, and reliable offline demos. |
| **BedrockProvider** | **Implemented** | Implemented using Amazon Bedrock Runtime `converse` API with `toolConfig`. Requires valid AWS credentials and model access (`anthropic.claude-3-5-sonnet-20241022-v2:0`). Automatically falls back gracefully if credentials are unavailable. |
| **MCP Server** | **Implemented** | Exposes the 8 tools using official MCP Python SDK v2.3.0 with Streamable HTTP transport. |
| **Alexa+ Connectivity** | **Independent Backend API** | Note on submission: In accordance with hackathon instructions, this backend exposes clean REST APIs ready for Alexa+ custom skill or action integration, without falsely claiming live Alexa+ connection prior to certification. |

---

## 10. Security & Safety

- **Deterministic Guardrails:** The LLM cannot authorize refunds, bypass policy limits, or approve its own actions.
- **Human-in-the-Loop:** All external communications and concessions are created in a `pending` state and strictly require explicit merchant approval.
- **Idempotency:** Unique idempotency keys and transactional database constraints prevent duplicate message dispatch or double-execution.
- **Verified State:** Actions are never marked completed without verifying backend persistence in the simulated outbox.
- **Data Privacy:** Credential-safe logging ensures no AWS keys, passwords, or customer tokens are logged.
