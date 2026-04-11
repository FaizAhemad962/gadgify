---
description: "Use when implementing business logic, catalog features, pricing, or workflows for Gadgify marketplace expansion beyond electronics."
applyTo: "**"
---

# Business Goals And Product Scope

Gadgify is a family-run marketplace with two objectives:

- Help owner family members sell products online with a reliable, secure flow
- Scale from a home gadgets store into a multi-category catalog

## Target Product Categories

- Home gadgets
- Electronics
- Furniture
- Books
- Clothing: men, women, kids
- Footwear: shoes, slippers, sandals

## Implementation Rules

- Design product model and UI for category flexibility; do not hardcode to electronics-only assumptions
- Keep Maharashtra business validation where required by policy
- Preserve secure payment and order flows for all categories
- Keep role-based access clear for USER, DELIVERY_STAFF, SUPPORT_STAFF, ADMIN, SUPER_ADMIN
- Ensure category-specific filters and search remain consistent with shared product APIs

## Definition Of Done For New Features

- Backend: route -> validator -> controller -> service -> prisma
- Frontend: api function -> React Query hook -> page/component
- Validation on both frontend and backend
- i18n keys added in en/hi/mr for user-facing text
- Admin capability and auditability considered for operational features
