# Code Patterns - Gadgify

(Moved from .github/CODE_PATTERNS.md)

## Frontend Patterns

### 1. Custom Hooks (Data Fetching)
Use `@tanstack/react-query` for all server state.
```typescript
export const useData = () => useQuery({ queryKey: ['key'], queryFn: fetchData });
```

### 2. API Client
Use the unified `apiClient` with `withCredentials: true`.

### 3. Forms
Use `react-hook-form` + `zod` for validation.

## Backend Patterns

### 1. Controller Structure
```typescript
export const controller = async (req, res, next) => {
  try {
    const data = await service.doWork(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
```

### 2. Prisma Usage
Use strict typing and transactions for multi-row updates.
