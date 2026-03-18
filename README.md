# CODConfirm AI

AI-powered dashboard for Indian e-commerce brands to automatically confirm Cash-on-Delivery (COD) orders via AI voice calls.

## What It Does

- Operations team submits an order (Order ID, phone number, amount)
- Backend triggers a **Bolna AI voice call** to the customer
- Voice agent speaks Hindi/Hinglish and confirms the order
- Call result is sent back via webhook and updates the dashboard in real time
- Analytics track confirmation rates and estimated RTO savings

> See [FLOW.md](./FLOW.md) for the full system flow and voice call diagrams.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | Clerk |
| Database | PostgreSQL + Prisma v6 |
| UI | TailwindCSS + shadcn/ui |
| Data Fetching | SWR (5s polling) |
| Notifications | Sonner |
| Voice AI | Bolna API |
| Deployment | Vercel |

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```
DATABASE_URL=postgresql://...       # Supabase or Neon PostgreSQL URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=  # From https://dashboard.clerk.com
CLERK_SECRET_KEY=                   # From https://dashboard.clerk.com
BOLNA_API_KEY=                      # From https://app.bolna.ai
BOLNA_AGENT_ID=                     # Your Bolna agent ID
```

### 3. Run Database Migration

```bash
npx prisma migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/dashboard`.

## Project Structure

```
codconfirm-ai/
├── app/
│   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in page
│   ├── dashboard/
│   │   ├── page.tsx                       # Server component with Suspense
│   │   └── dashboard-client.tsx           # Client component with SWR polling
│   ├── order/[id]/page.tsx                # Order detail page
│   └── api/
│       ├── orders/route.ts                # POST (create) / GET (list)
│       ├── trigger-call/route.ts          # POST — triggers Bolna call
│       ├── bolna/webhook/route.ts         # POST — receives call results
│       └── analytics/route.ts             # GET — dashboard stats
├── components/
│   ├── OrderTable.tsx                     # TanStack Table with filter/sort
│   ├── CreateOrderForm.tsx                # react-hook-form + Zod
│   ├── StatusBadge.tsx                    # Color-coded status indicator
│   ├── CallSummaryDialog.tsx              # Modal for call summary
│   └── AnalyticsSection.tsx              # Stats + RTO Savings card
├── lib/
│   ├── prisma.ts                          # Prisma singleton client
│   └── bolna.ts                           # Bolna API HTTP client
├── services/
│   ├── order.service.ts                   # All DB queries
│   └── bolna.service.ts                   # Call trigger logic
├── middleware.ts                           # Clerk route protection
└── prisma/schema.prisma                   # Database schema
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Create order + trigger call |
| `GET` | `/api/orders` | List all orders |
| `POST` | `/api/trigger-call` | Re-trigger call for an order |
| `POST` | `/api/bolna/webhook` | Receive Bolna call results |
| `GET` | `/api/analytics` | Dashboard statistics |

### Webhook Payload (from Bolna)

```json
{
  "order_id": "ORD123",
  "status": "CONFIRMED",
  "delivery_slot": "Tomorrow 4-7 PM",
  "call_summary": "Customer confirmed the order and requested evening delivery"
}
```

### Order Statuses

| Status | Description |
|---|---|
| `PENDING` | Order created, call not yet initiated |
| `CALLING` | Voice call is in progress |
| `CONFIRMED` | Customer confirmed the order |
| `RESCHEDULED` | Customer wants delivery at a different time |
| `CANCELLED` | Customer cancelled the order |
| `FAILED` | Call failed (Bolna API error or timeout) |

## Deployment on Vercel

1. Push to GitHub
2. Import into Vercel
3. Add environment variables in Vercel dashboard
4. Run `npx prisma migrate deploy` after deployment

## Error Handling

- **Bolna API failure** → order status set to `FAILED` automatically
- **Invalid phone number** → Zod validation rejects at form + API level
- **API timeout** → 15s timeout on Bolna calls via `AbortSignal.timeout`
- **Webhook payload mismatch** → returns `400` with validation details
- **UI errors** → Sonner toasts for all user-facing errors
