# Architecture & Context - Gadgify

(Moved from .github/PROJECT_CONTEXT.md)

## Executive Summary
Gadgify is a full-stack e-commerce platform for electronics in Maharashtra, India.

## Technical Architecture
- **Frontend**: React 19, MUI 7, React Query, React Hook Form, i18next.
- **Backend**: Express 5, Prisma 5, PostgreSQL.
- **Security**: JWT httpOnly cookies, CSRF protection, sanitization, rate limiting.

## Layers
1. **Frontend**: UI components -> React Query Hooks -> API Client.
2. **Backend**: Routes -> Middlewares -> Controllers -> Services -> Prisma.

## Key Constraints
- Maharashtra-only validation.
- Secure session management.
- Multi-category scalability.
