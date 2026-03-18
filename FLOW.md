# CODConfirm AI — Flow Diagrams

---

## 1. System Flow

```
  ┌─────────────────────────────────────┐
  │          Operations Team            │
  │         (Ops Dashboard)             │
  └──────────────────┬──────────────────┘
                     │  Fill: Order ID · Phone No. · Amount
                     ▼
  ┌─────────────────────────────────────┐
  │         Create Order Form           │
  │    (react-hook-form + Zod)          │
  └──────────────────┬──────────────────┘
                     │  POST /api/orders
                     ▼
  ┌─────────────────────────────────────┐      ┌────────────────────────┐
  │         Orders API Route            │─────▶│    PostgreSQL (DB)     │
  │           /api/orders               │ Save │   Status: PENDING      │
  └──────────────────┬──────────────────┘      └────────────────────────┘
                     │  POST /api/trigger-call
                     ▼
  ┌─────────────────────────────────────┐
  │            Bolna API                │
  │         (Trigger Call)              │
  └──────────────────┬──────────────────┘
                     │  Outbound AI Voice Call
                     ▼
  ┌─────────────────────────────────────┐
  │             Customer                │
  │          (Phone Call)               │
  └──────────────────┬──────────────────┘
                     │  Call ends: confirm / cancel / reschedule
                     ▼
  ┌─────────────────────────────────────┐      ┌────────────────────────┐
  │        Bolna Webhook Handler        │─────▶│    PostgreSQL (DB)     │
  │        /api/bolna/webhook           │Update│  Status + Call Summary │
  └─────────────────────────────────────┘      └────────────┬───────────┘
                                                            │  SWR polling (every 5s)
                                                            ▼
                                               ┌────────────────────────┐
                                               │      Dashboard UI      │
                                               │  (Real-time updates    │
                                               │    + Analytics)        │
                                               └────────────┬───────────┘
                                                            │  View results
                                                            ▼
                                               ┌────────────────────────┐
                                               │    Operations Team     │
                                               └────────────────────────┘
```

---

## 2. Bolna AI Voice Call Flow

```
                    ┌───────────────────────────┐
                    │   Bolna Initiates Call     │
                    │   (Outbound to Customer)   │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │  Greet in Hindi/Hinglish   │
                    │  "Namaste, main aapke COD  │
                    │   order ki confirmation ke  │
                    │   liye call kar raha hoon." │
                    │                            │
                    │  (Switch to English if     │
                    │  customer replies English) │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │   State Order Amount       │
                    │  "Aapka order ₹{amount}    │
                    │   ka hai."                 │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │   Ask for Confirmation     │
                    │  "Kya aap is order ko      │
                    │   confirm karte hain?"     │
                    └─────────────┬─────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
       [YES / Haan]         [Reschedule]           [NO / Cancel]
           │                      │                      │
           ▼                      ▼                      ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Ask Delivery    │   │ Ask Preferred    │   │ Accept Cancel    │
│  Time Slot       │   │ New Slot         │   │ Gracefully       │
│                  │   │                  │   │                  │
│ "Aapko delivery  │   │ "Aapko delivery  │   │ "Theek hai,      │
│  kis time prefer │   │  kis time prefer │   │  no problem."    │
│  hogi?"          │   │  hogi?"          │   │                  │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                       │
         ▼                      ▼                       ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Record Slot      │   │ Record New Slot  │   │ Status:          │
│ Status:          │   │ Status:          │   │ CANCELLED        │
│ CONFIRMED        │   │ RESCHEDULED      │   └────────┬─────────┘
└────────┬─────────┘   └────────┬─────────┘            │
         │                      │                       │
         └──────────────────────┴───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────────┐
                    │   Say Closing Line         │
                    │  Hindi: "Dhanyavaad,       │
                    │   aapka din achha rahe."   │
                    │  English: "Thank you,      │
                    │   have a great day."       │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │   Output Webhook JSON      │
                    │   (silently — backend)     │
                    │  {                         │
                    │    order_id,               │
                    │    status,                 │
                    │    delivery_slot,          │
                    │    call_summary            │
                    │  }                         │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │       Call Ends            │
                    └───────────────────────────┘


  ── Edge Case ──────────────────────────────────────────────────────────────
  If customer does not answer OR Bolna API errors out:
       Status → FAILED   (no follow-up unless Ops manually re-triggers)
  ────────────────────────────────────────────────────────────────────────────
```

---

## 3. Order Status Lifecycle

```
             ┌───────┐
             │ START │  (Order created via form)
             └───┬───┘
                 │
                 ▼
          ┌────────────┐
          │  PENDING   │  Saved to DB, call not yet made
          └──────┬─────┘
                 │  Bolna call triggered
                 ▼
          ┌────────────┐
          │  CALLING   │  Voice call in progress
          └──────┬─────┘
                 │
     ┌───────────┼─────────────┬─────────────┐
     │           │             │             │
     ▼           ▼             ▼             ▼
┌─────────┐ ┌──────────────┐ ┌──────────┐ ┌────────┐
│CONFIRMED│ │ RESCHEDULED  │ │CANCELLED │ │ FAILED │
│Customer │ │Customer wants│ │Customer  │ │API err │
│confirms │ │different slot│ │cancels   │ │timeout │
└────┬────┘ └──────┬───────┘ └────┬─────┘ └───┬────┘
     │             │              │            │
     ▼             ▼              ▼            │  Ops re-triggers
   [END]         [END]          [END]          │  (POST /api/trigger-call)
                                               │
                                               ▼
                                        ┌────────────┐
                                        │  CALLING   │  (retry)
                                        └────────────┘
```
