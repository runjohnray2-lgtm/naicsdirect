# NAICSDirect Agent Operating Contract

## Mission
Finish the existing NAICSDirect product and get it to a verified, sellable state. Do not expand scope unless a missing capability blocks the real customer journey.

## Source of truth
Before changing code, inspect the repository and the live product behavior. Do not assume an earlier agent's status report is correct.

## Chief-of-Staff pattern
Treat work as a small team with explicit roles:

1. **Chief of Staff / Orchestrator** — owns the finish line, decomposes work, assigns bounded tasks, tracks blockers, and rejects scope drift.
2. **Builder** — makes the smallest code change needed for one bounded outcome.
3. **Verifier** — independently proves the behavior works. The verifier must not treat the builder's explanation as evidence.
4. **Reviewer** — checks blast radius, regressions, security/auth/payment implications, and unnecessary complexity.
5. **Release check** — confirms the deployed/live behavior, not merely a local code change.

A single agent may perform multiple roles sequentially when separate agents are unavailable, but it must explicitly switch roles and re-check from a fresh perspective.

## Finish line
NAICSDirect is not "done" because code compiled or a PR merged. It is done only when the real customer journey is verified end-to-end:

- visitor can understand the product and pricing
- user can sign up / sign in
- user can define their business categories/capabilities
- category/NAICS selection is usable and searchable
- relevant opportunities can be discovered and opened
- saved/workflow features needed by the current product function correctly
- plan selection and Stripe checkout work
- paid entitlement is reflected in the account
- billing/account management works
- cancellation path works
- critical errors are not present in the live flow

If any item is not implemented in the current product, determine whether it is a true launch blocker before adding it.

## Task contract
Every task must have:

- **Goal** — one observable customer or system outcome
- **Boundary** — what is allowed to change
- **Proof** — how a verifier can demonstrate success
- **Regression checks** — adjacent behavior that must remain intact

Prefer small independently verifiable tasks over large rewrites.

## Required workflow
For defects:

1. Reproduce the failure first.
2. Trace the relevant code/data path.
3. Make the smallest correct fix.
4. Run repository checks.
5. Independently verify the behavior.
6. Verify the deployed/live result when deployment is part of the task.
7. Record remaining known risk; do not call the task complete while a known blocker remains.

For features or structural changes:

1. Ground in current code and current customer journey.
2. Confirm the feature is required for the existing finish line.
3. Sketch the smallest interface/data change before implementation.
4. Implement in a bounded change.
5. Verify behavior and regressions.

## Verification rules
- "I changed the code" is not proof.
- "Build passed" is not proof of customer behavior.
- Screenshots/status messages are supporting evidence, not a substitute for exercising the flow.
- Payment/auth/subscription changes require explicit end-to-end verification of the affected lifecycle.
- Never fabricate a successful test, deployment, payment, email, database write, or user journey.

Repository checks currently available:

```bash
npm run build
```

Use other checks that actually exist in the repository. Do not claim a test suite passed if none exists.

## Scope control
Until launch readiness is achieved:

- no speculative new features
- no redesign for aesthetics alone
- no broad refactor unless current structure blocks a verified fix
- no replacing working systems because another stack is fashionable
- no adding AI features merely because AI is available

Capture non-blocking ideas separately and return to the finish line.

## Autonomy and approvals
Routine, reversible implementation and testing may proceed without asking for approval.

Stop for approval before:

- spending money or enabling paid services
- changing pricing or public commercial promises
- sending consequential external communications not already authorized
- destructive production-data changes
- irreversible/high-impact migrations
- legal/contractual commitments
- exposing credentials, private financial data, or sensitive customer data

## Parallelism
Parallelize only work that has clean boundaries. Avoid multiple agents modifying the same files or shared schema at the same time unless coordination is explicit.

Good parallel work:
- one agent reproduces checkout failure while another maps account/billing lifecycle
- one agent audits opportunity/category UX while another inspects indexing/SEO
- one builder implements while an independent verifier prepares the test path

Bad parallel work:
- several agents independently rewriting the same auth/payment flow
- multiple agents making schema changes without one owner

## Handoff format
At the end of every run report only:

- completed and verified
- changed but not yet verified
- genuine blockers
- next concrete task

Do not inflate progress with planning, research, or code edits that have not produced a verified outcome.
