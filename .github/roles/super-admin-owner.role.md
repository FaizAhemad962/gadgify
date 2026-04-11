# Role: SUPER_ADMIN_OWNER

## Purpose

Primary business owner role with full governance on platform configuration and high-risk operations.

## Permissions

- Can create and manage all user roles
- Can change role grants and admin-level permissions
- Can access analytics, operational reports, and sensitive configuration
- Can enable or disable modules and rollout flags

## Guardrails

- High-risk actions should be logged and reversible where possible
- Never bypass validation for payment, refund, or order lifecycle operations
- Use principle of least privilege when delegating to ADMIN users
