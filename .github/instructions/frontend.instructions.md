---
description: "Use when writing React components, pages, hooks, or frontend API calls for Gadgify. Covers MUI 7, React Query, Hook Form, Zod, and i18next patterns."
applyTo: "frontend/src/**"
---

# Frontend Development Rules

## Component Structure

- Use functional components with TypeScript interfaces for props
- Colocate types at top of file or in a shared `types/` folder
- Export components as default, hooks as named exports

## Data Fetching

- ALL server data via React Query (`useQuery`, `useMutation`)
- Never use `useState`+`useEffect` for API data
- API functions go in `frontend/src/api/` — hooks wrap them in `frontend/src/hooks/`
- Invalidate related queries after mutations

## Forms

- React Hook Form + `@hookform/resolvers/zod` for all forms
- Define Zod schemas next to form components or in a `schemas/` file
- Show MUI `helperText` for field errors

## i18n

- `const { t } = useTranslation();` in every component with user-facing text
- Keys in `frontend/src/i18n/locales/{en,mr,hi}.json`
- Never hardcode strings shown to users

## Styling

- Use MUI `sx` prop or `styled()` — no raw CSS files
- Use theme tokens (`theme.palette`, `theme.spacing`) — no magic numbers
- Responsive: use MUI breakpoints (`{ xs: ..., md: ... }`)

## Error Handling

- React Query `onError` for API errors
- Show `Snackbar` or `Alert` for user-facing errors
- Never `console.log` in production code — use `console.error` only for unexpected failures
