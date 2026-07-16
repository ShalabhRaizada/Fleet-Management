# Fleet Sales AI — Voice-First Sales Enablement Platform

An AI-native **Revenue Operating System** for road-freight logistics sales. The salesperson speaks — while driving, walking, or after a customer meeting — and AI converts the conversation into structured CRM data, opportunities, quotation requests, approvals, contracts, routes, forecasts and follow-ups.

## Repository layout

```
server/   Express + TypeScript API — domain model, workflows, AI agents, JSON persistence
web/      React + Vite mobile-first PWA — voice UI (Web Speech API), one-thumb navigation
```

## Quick start

```bash
# API (port 4000)
cd server && npm install && npm run dev

# Web app (port 5173, proxies /api to the server)
cd web && npm install && npm run dev
```

Open http://localhost:5173 on a phone-sized viewport. Tap the mic (Chrome/Edge/Safari support Web Speech) or type in the command bar — every voice command also works as text (criterion 14).

> **Both processes must be running.** The web app proxies `/api` to the server on port 4000 — if you see "API server not reachable", start the server first.

**AI agents:** put a key in `server/.env` (loaded automatically on startup). Two providers are supported:

- **Anthropic Claude** — `ANTHROPIC_API_KEY=sk-ant-...` (model `claude-opus-4-8`, adaptive thinking)
- **Google Gemini** — `GEMINI_API_KEY=...` (default model `gemini-2.5-pro`, override with `GEMINI_MODEL`)

If both keys are set, Claude is used; force a provider with `AI_PROVIDER=claude` or `AI_PROVIDER=gemini`. Without any key the platform runs fully on its deterministic rule-based engines — every workflow still works. Check which provider is active at `http://localhost:4000/api/health`.

```bash
cd server
cp .env.example .env     # then edit: add your ANTHROPIC_API_KEY or GEMINI_API_KEY
npm run dev
```

Exported environment variables work too. Requires Node.js ≥ 20.12.

## Try these voice commands

| Say… | What happens |
|---|---|
| "Plan my day. Visit Tata Steel at Jamshedpur. Then UltraTech at Kharagpur. Lunch with JSW. Evening Teams call with Pepsi." | Detects customers, meeting types, sequence; blocks calendar with travel estimates, agendas and reminders |
| "Open Tata Steel" | Account snapshot with opportunities |
| "Create opportunity for Tata Steel" | Starts the discovery interview — AI asks follow-up questions instead of showing forms |
| "Add lane Chennai to Pune, 600 tons per month" | Structured lane + volume capture |
| "Customer wants LNG" / "Customer rejected EV" | Sustainability qualification |
| "Estimate monthly fleet" | Vehicle/trailer/trip requirement from lane + volume |
| "Ask Network Planning to prepare a quotation for Chennai to Pune, 600 metric tons per month, using LNG tractors. Include a backhaul option." | Creates a planning request with **all qualification data auto-attached**, routes it with SLA, returns route economics, fleet requirement, cost per trip/km/ton/ton-km and a recommended price range |
| "Send this quotation to Finance for validation" | Finance review with margin, credit-risk and working-capital analysis + AI recommendation |
| "Ask for a five-percent discount" | Commercial approval workflow |
| "Send this contract to Legal" | Legal review workflow |
| "Send the approved quotation to the customer and propose a meeting on Friday" | **Blocked until Finance approves.** Once approved: drafts the email, shows recipient/subject/body/attachments/validity preview — send is a separate explicit confirmation |
| "Add this new lane to the existing customer contract" | Contract amendment — applies as a **new version**; history is never overwritten |
| "What is blocking the Tata Steel opportunity?" | Deal-room AI: pending approvals, missing backhaul, credit-term risk, SLA breaches |
| "Ask Tata Steel for more lanes" | Growth scan: backhaul, LNG/EV conversion, dedicated fleet, multi-drop, contract expansion |
| "Schedule follow-up" / "Email summary" | Follow-ups and drafted communications |

## Architecture

### Backend (`server/`)

- **Domain model** (`src/domain/types.ts`) — Accounts, Contacts, Opportunities (lanes, volume, sustainability, commercial qualification), Meetings/DayPlans, and the full collaboration model: `InternalTeam`, `CollaborationRequest/Message`, `QuotationRequest/Version`, `CostingVersion`, `ApprovalRule/Step/Decision`, `FinanceReview`, `CommercialApproval`, `LegalReview`, `Contract/Version/Amendment/Lane/RateCard`, `CustomerCommunication`, `InternalCommunication`, `DealRoom*`, `CustomerGrowthOpportunity`, `FollowUp`, `Escalation`, `ServiceLevelAgreement`, `WorkflowSLA`, `Notification`, `AuditEvent`.
- **Voice pipeline** — `services/intent.ts` (deterministic parser for the command grammar) → `services/conversation.ts` (orchestrates workflows, keeps conversational context, switches voice↔text losslessly) → Claude agents for anything free-form.
- **Workflows** — `quotation.ts` (Network Planning request + planning outputs + versioned quotations/costings), `approvals.ts` (Finance/Commercial/Legal with append-only `ApprovalDecision` history and the **external-send gate**), `contracts.ts` (immutable version chain; amendments append, never overwrite), `communications.ts` (draft → preview → confirm send; auto follow-up), `growth.ts`, `dealRoom.ts` (one room per opportunity, blocker detection), `inbox.ts` (unified actionable inbox), `sla.ts` (reminder → escalation sweep), `commandCentre.ts` (leadership metrics).
- **AI agents** (`src/ai/`) — Conversation, Sales Coach, Logistics Expert, Pricing Advisor, Sustainability Advisor, CRM, Route Optimizer, Calendar, Email, Proposal. Shared prompts (`prompts.ts`) with pluggable providers: Claude `claude-opus-4-8` with adaptive thinking (`claude.ts`) or Google Gemini (`gemini.ts`), selected in `agents.ts` by whichever key is configured; graceful rule-based fallback offline.
- **Persistence** — JSON file store (`data/db.json`) with append-only audit log; swap for a real database behind the `Store` class. Integration-ready: all workflows are exposed as a REST API for Salesforce/Dynamics/HubSpot sync.

### Frontend (`web/`)

Voice-first PWA: persistent voice/text bar on every screen, large-mic Home, Conversation screen with live transcription and suggestion chips, Customers, Pipeline, AI Deal Room (health/blockers/tabs/voice actions), Calendar, Collaboration Inbox (approve / approve-with-condition / return / reject by tap), and the Revenue Command Centre.

## Acceptance criteria coverage

All 15 collaboration acceptance criteria are implemented and covered by `server/test/workflows.test.ts` (16 tests):

1. Quotation request entirely by voice ✅  2. Qualification data auto-attached ✅  3. Structured planning response ✅  4. Finance approve/reject/conditional ✅  5. External quotations blocked before approvals ✅  6. All communications recorded against the opportunity ✅  7. Growth scan for existing customers ✅  8. Contract changes create new versions, never overwrite ✅  9. One AI Deal Room per opportunity ✅  10. AI blocker detection + next actions ✅  11. SLA breach → reminder → escalation ✅  12. Immutable approval/audit trails ✅  13. Mobile one-thumb voice-first UI ✅  14. Voice↔text switching without losing context ✅  15. AI customer communication always previewable before send ✅

```bash
cd server && npm test
```
