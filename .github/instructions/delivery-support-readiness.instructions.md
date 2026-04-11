---
description: "Use when building delivery workflows, support operations, refunds, or post-order experiences in Gadgify."
applyTo: "backend/src/**"
---

# Delivery And Support Readiness

Prioritize production-safe workflows for post-order operations.

## Delivery Domain

- Assignment lifecycle must be explicit and validated
- State transitions should be guarded and idempotent
- Tracking endpoints should avoid leaking sensitive location history
- Service and controller method signatures must stay consistent

## Support Domain

- Ticket actions must be role-gated
- Include status transitions with clear ownership
- Keep all responses in the standard API response format

## Refund And Return Domain

- Use transactions for status + stock + payment updates
- Keep refund state machine explicit and traceable
- Avoid stock adjustments before financial confirmation

## Reliability

- Add logs on critical transitions
- Keep pagination and filters on list endpoints
- Add Joi validation for body, params, and query on all new endpoints
