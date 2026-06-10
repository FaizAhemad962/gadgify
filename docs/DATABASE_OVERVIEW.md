# Database — Gadgify

Database technology

- PostgreSQL (primary)
- Prisma 5 as the ORM and schema/migration tool

Schema & migrations

- Prisma schema under `backend/prisma/schema.prisma`
- Run migrations locally with: `npx prisma migrate dev --name <name>`
- Use `npx prisma studio` for a quick GUI during development

Connection strings

- `DATABASE_URL` in backend env files points to the database; use separate production credentials on Azure.
- `DIRECT_URL` optional for direct connections without pooling.

Best practices

- Use Prisma transactions for multi-step DB operations (orders, payments).
- Seed test data with `npm run seed` if a seeding script exists.
- Keep migrations small and descriptive; review before applying to production.

Backups & scaling

- For production (Azure/Postgres managed): configure automated backups and read replicas as needed.
- Monitor slow queries and add indices where necessary.

Useful files

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
