---
description: "Use when editing the Prisma schema, creating migrations, or writing database queries for Gadgify."
applyTo: "backend/prisma/**"
---

# Prisma & Database Rules

## Schema Changes

1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Run `npx prisma generate` to update the client

## Naming Conventions

- Models: PascalCase singular (`User`, `Product`, `OrderItem`)
- Fields: camelCase (`createdAt`, `totalPrice`, `isActive`)
- Enums: UPPER_SNAKE_CASE values (`PENDING`, `DELIVERED`, `CANCELLED`)

## Relationships

- Always define both sides of relations
- Use `@relation` with explicit field names
- Add `onDelete` cascade/restrict as appropriate

## Best Practices

- Add `@default(now())` to `createdAt`, `@updatedAt` to `updatedAt`
- Use `Decimal` for money fields — never `Float`
- Add indexes on frequently queried fields (`@@index`)
- Add unique constraints where needed (`@@unique`, `@unique`)
