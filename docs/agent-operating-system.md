# NAICSDirect Agent Operating System

This document translates the multi-agent engineering ideas from Lauren Tan's public Cursor/pstack workflow into a repo-specific operating system for NAICSDirect.

## Core principle
More agents are useful only after the work is verifiable. Throughput without verification creates faster failure.

The operating loop is:

**Goal -> Ground -> Build -> Verify -> Review -> Live check -> Next task**

The Chief of Staff owns the loop and does not accept a builder's self-report as completion.

## Team

### 1. Chief of Staff
Owns the product finish line.

Responsibilities:
- inspect current product state before assigning work
- maintain the prioritized launch-blocker list
- break work into bounded, independently verifiable tasks
- keep agents from adding nonessential features
- prevent conflicting parallel edits
- require evidence before moving a task to complete
- escalate only genuine approval blockers

### 2. Customer Journey Agent
Acts like a real prospective customer, not an engineer.

Primary path:
1. land on site
2. understand value proposition
3. inspect pricing
4. register/sign in
5. configure business categories/capabilities
6. find relevant federal opportunities
7. open/save/work an opportunity using current product features
8. select a plan
9. complete checkout
10. confirm paid access
11. manage billing/account
12. cancel and confirm resulting access state

Outputs:
- exact failing step
- reproduction steps
- screenshot/log evidence when available
- severity: blocker / serious / cosmetic

### 3. Builder Agent
Receives one bounded task at a time.

Required input:
- observable goal
- reproduction or desired behavior
- allowed files/subsystems when known
- proof required

Rules:
- inspect before editing
- smallest correct change
- no unrelated cleanup
- no new feature unless necessary for the stated outcome
- surface schema/auth/payment blast radius before changing it

### 4. Verification Agent
Independent from the builder's reasoning.

Verification sequence:
- reproduce original failure or baseline behavior
- exercise the changed behavior
- test nearby regression paths
- run available repository checks
- if deployed, exercise the live path

The verifier may reject a task even when code looks correct.

### 5. Security / Payments Reviewer
Required for authentication, Stripe, entitlements, billing, sensitive user data, and admin permissions.

Checks:
- authorization boundaries
- webhook/event lifecycle assumptions
- duplicate/idempotent event handling where relevant
- entitlement consistency
- secret exposure
- unsafe client-side trust
- cancellation/update edge cases

### 6. Release Agent
Owns the last mile.

A task is not released because a commit exists. Release evidence must state:
- what commit/change is intended
- whether build/CI passed
- whether deployment completed
- exact live behavior tested
- known residual risk

## Launch blocker queue
The Chief of Staff should keep one queue ordered by customer impact:

1. Cannot discover/understand product
2. Cannot register/sign in
3. Cannot configure business profile/categories
4. Cannot discover/use opportunities
5. Cannot choose/pay for plan
6. Paid entitlement incorrect
7. Account/billing/cancellation broken
8. Serious trust/security/data issue
9. Conversion/clarity issue
10. Cosmetic improvement

Do not work category 9 or 10 while a known item in 1-8 blocks launch, unless it is required to verify the blocker.

## Task card template

```text
TASK:
GOAL:
WHY THIS BLOCKS LAUNCH:
REPRO / CURRENT STATE:
BOUNDARY:
PROOF OF SUCCESS:
REGRESSION CHECKS:
OWNER:
STATUS: queued | building | verifying | live-check | complete | blocked
```

## Definition of done
A task is complete only when:
- required behavior exists
- repository checks relevant to the change pass
- an independent verification step succeeds
- live behavior is checked when the task changes production-facing behavior
- no known launch-blocking regression was introduced

A product-level "finished" status requires the full customer journey in `AGENTS.md` to pass.

## Overnight / unattended work contract
Use unattended execution only for bounded, reversible work.

Before starting:
- write the goal
- write exact stop conditions
- define allowed areas/files
- define verification evidence
- prohibit spending, production-data deletion, pricing/public promise changes, secret exposure, or irreversible migrations

During execution:
- each worker owns one task
- failures create a blocker record rather than being hidden
- a verifier checks each completed worker task
- uncertain/high-impact work is parked for approval

Morning handoff:

```text
VERIFIED COMPLETE:
- ...

CHANGED, NOT VERIFIED:
- ...

BLOCKED:
- ...

FAILED/REVERTED:
- ...

NEXT HIGHEST-VALUE TASK:
- ...
```

## Ray-specific finish mode
When the owner says **NAICSDirect FINISH MODE**, interpret it as:

- NAICSDirect is the only build priority
- inspect live/repo state first
- identify launch blockers privately
- execute the highest-value blocker immediately
- do not stop after producing a plan
- do not invent new features
- verify every claimed fix
- ask only for sign-in/CAPTCHA, spending, consequential submission, destructive/high-impact action, or a decision that genuinely cannot be inferred
- continue until a genuine blocker is reached

## Why this structure exists
The system is designed to prevent the failure mode where an AI agent edits code, describes the edit confidently, and moves on before proving that the customer-facing result works.

The objective is not maximum agent count. The objective is enough structure that additional agents can safely run in parallel without multiplying unverified work.
