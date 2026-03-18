# CODConfirm AI — Agent Design Document

## Problem

Cash-on-Delivery (COD) is the dominant payment method in Indian e-commerce (~60-70% of orders). A large share of these orders are never collected — the customer isn't home, changes their mind, or the delivery attempt is wasted. This is called **Return-to-Origin (RTO)**, and it costs logistics companies ₹150–₹400 per failed delivery (reverse shipping + restocking).

The standard fix — manually calling customers before dispatch — is labour-intensive, inconsistent, and doesn't scale.

**CODConfirm AI** automates this entire call process using a conversational voice AI agent.

---

## Agent Overview

The agent is a **COD Order Confirmation Agent**: an autonomous voice AI that calls customers on behalf of the seller, confirms their intent to receive the parcel, handles reschedule requests, and records every outcome in a dashboard.

It operates without human intervention. The ops team only needs to:
1. Create/upload orders.
2. Watch the dashboard update in real time.
3. Re-trigger calls for failed attempts if needed.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Ops Dashboard (Next.js)                                        │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Create Order │  │ Call All Pending │  │  Analytics Panel │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────────────────┘  │
└─────────│──────────────────│────────────────────────────────────┘
          │ POST /api/orders  │ POST /api/orders/batch-call
          ▼                  ▼
   ┌─────────────────────────────┐
   │    BolnaService.initiateCall│   ◄── sets status = CALLING
   └──────────────┬──────────────┘
                  │ REST API (BOLNA_API_KEY)
                  ▼
   ┌─────────────────────────────┐
   │    Bolna AI Voice Agent     │   ◄── full bilingual prompt
   │    (Hindi/English)          │        in AgentPrompt.md
   └──────────────┬──────────────┘
                  │ calls customer phone
                  ▼
           Customer speaks
                  │ transcript + JSON output
                  ▼
   ┌─────────────────────────────┐
   │  POST /api/bolna/webhook    │   ◄── lifecycle events
   │  - parse transcript JSON    │
   │  - resolve orderId          │
   │  - update DB status         │
   └──────────────┬──────────────┘
                  │
                  ▼
   ┌─────────────────────────────┐
   │    Neon PostgreSQL (Prisma) │
   │  OrderConfirmation table    │
   └──────────────┬──────────────┘
                  │ SWR polling every 5s
                  ▼
           Ops Dashboard updates
```

---

## Context the Agent Receives

When a call is triggered, three pieces of context are passed to the Bolna agent as `user_data`:

| Field      | Example            | Purpose                              |
|------------|--------------------|--------------------------------------|
| `order_id` | `ORD-20250318-001` | Identify the order in the webhook    |
| `amount`   | `1499`             | Tell customer the exact COD amount   |
| `phone`    | `+919876543210`    | Dialled number                       |

The agent's full system prompt (`AgentPrompt.md`) gives it:
- The seller's identity and purpose of the call.
- Language rules (Hindi by default, English if customer switches).
- Conversation flow: greeting → confirm amount → listen → handle response.
- Strict instruction to output a **silent structured JSON block** at the end of the call (never spoken aloud):

```json
{
  "order_id": "ORD-20250318-001",
  "status": "CONFIRMED",
  "delivery_slot": "Tomorrow morning",
  "call_summary": "Customer confirmed delivery for tomorrow morning."
}
```

This JSON is what the webhook parses to update the order status.

---

## Tools

The agent uses the following internal tools (API routes and service functions):

| Tool | Implementation | Description |
|------|---------------|-------------|
| `triggerBolnaCall` | `lib/bolna.ts` | Sends a REST call to Bolna API with order context |
| `initiateCall` | `services/bolna.service.ts` | Sets status to CALLING, then triggers call; rolls back to FAILED on error |
| `parseTranscript` | `app/api/bolna/webhook/route.ts` | Extracts structured JSON from Bolna's transcript |
| `updateOrderStatus` | `services/order.service.ts` | Persists the confirmed/cancelled/rescheduled status |
| `getAnalytics` | `services/order.service.ts` | Returns real-time metrics including today's call rate |
| `batchCall` | `app/api/orders/batch-call/route.ts` | Triggers all PENDING orders in one action |

---

## Workflow

```
1. PENDING   ← Order created via dashboard or API
      │
      │  initiateCall() triggered (auto on create, or manual via "Call All Pending")
      │
2. CALLING   ← Bolna API call dispatched; customer phone is ringing
      │
      │  Customer answers and converses with the AI agent
      │
3a. CONFIRMED   ← Customer said yes; JSON extracted from transcript
3b. RESCHEDULED ← Customer asked for a different delivery slot
3c. CANCELLED   ← Customer refused the order
3d. FAILED      ← No answer / busy / call error / JSON not parseable
```

For `FAILED` and `RESCHEDULED` orders, the ops team can manually press the **Re-call** button (per row) or **Call All Pending** (for bulk re-queueing after a fix).

---

## Usability

The dashboard is designed for ops teams who aren't technical:

- **Create order form** — 3 fields (Order ID, Phone, Amount). Call triggers automatically.
- **Order table** — sortable, filterable by status, searchable by order ID. Each row shows the call outcome and a clickable order ID linking to the detail view.
- **Re-call button** — per-row action to re-trigger a call for failed/rescheduled orders. Disabled for orders already confirmed or in progress.
- **Call All Pending** — one click to batch-trigger all unprocessed orders, with a live count badge.
- **Analytics panel** — six live stats: total calls, confirmed, cancelled, rescheduled, today's calls, today's rate, plus an RTO savings estimator.
- **Auto-refresh** — SWR polls every 5 seconds so the dashboard updates as calls complete without needing a page reload.
- **Dark mode** — system-aware, with a manual toggle in the header.

---

## What Makes It Production-Ready

- **Robust webhook parsing** — three fallback sources (structured extraction, transcript JSON block, phone/orderId resolution) handle every edge case in Bolna's response format.
- **Auth** — Clerk protects all dashboard routes; the webhook has optional bearer-token verification (`BOLNA_WEBHOOK_SECRET`).
- **Idempotent status updates** — the webhook skips intermediate statuses (ringing, in-progress) and only acts on final states.
- **Error isolation** — `initiateCall` catches Bolna API failures and sets the order to FAILED rather than leaving it stuck in CALLING.
- **Hosted DB** — Neon PostgreSQL with Prisma ORM; zero local setup needed.

---

## Limitations and Next Steps

- **No retry scheduler** — failed calls require manual re-trigger; an automated cron (e.g. "re-call all FAILED orders after 2 hours") would improve conversion.
- **No pagination** — `GET /api/orders` returns all rows; at thousands of orders, a paginated/cursor-based API is needed.
- **No WhatsApp fallback** — a follow-up WhatsApp message for unanswered calls would capture customers who don't pick up unknown numbers.
- **No multi-tenant support** — a single shared DB; adding a `tenantId` to the schema would enable SaaS multi-seller use.
- **Agent prompt is static** — personalising the script with product name/category would increase the confirmation rate.
