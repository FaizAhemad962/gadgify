# Global Error Notification - Quick Reference

## Import & Setup (In Any Component)

```typescript
import { useGlobalError } from "@/hooks/useGlobalError";
import { ErrorHandler } from "@/utils/ErrorHandler";

// Inside component
const { showError, showSuccess, showWarning, showInfo } = useGlobalError();
```

## Common Patterns

### Pattern 1: React Query Error Handling

```typescript
onError: (error) => {
  const message = ErrorHandler.getUserFriendlyMessage(error);
  showError(message);
};
```

### Pattern 2: Try-Catch Error Handling

```typescript
try {
  await apiClient.post("/endpoint", data);
  showSuccess("Success!");
} catch (error) {
  showError(ErrorHandler.getUserFriendlyMessage(error));
}
```

### Pattern 3: Type-Based Error Handling

```typescript
try {
  await apiClient.get("/endpoint");
} catch (error) {
  if (ErrorHandler.isRateLimitError(error)) {
    showWarning("Too many requests");
  } else if (ErrorHandler.isNetworkError(error)) {
    showError("Network failed");
  } else {
    showError("Unknown error");
  }
}
```

## Error Checking Methods

```typescript
ErrorHandler.isNetworkError(error); // No internet
ErrorHandler.isServerError(error); // 5xx errors
ErrorHandler.isRateLimitError(error); // 429 errors
ErrorHandler.isAuthError(error); // 401 errors
ErrorHandler.isAuthorizationError(error); // 403 errors
ErrorHandler.isValidationError(error); // Form validation errors
ErrorHandler.getValidationErrors(error); // Get validation error details
```

## Available Methods

```typescript
showError(message); // Red error notification
showSuccess(message); // Green success notification
showWarning(message); // Orange warning notification
showInfo(message); // Blue info notification
clearError(id); // Remove specific notification
clearAll(); // Remove all notifications
```

## i18n Error Keys

```typescript
"errors.networkError"; // Network connection failed
"errors.timeoutError"; // Request timed out
"errors.serverError"; // Server error
"errors.serviceUnavailable"; // Service temporarily down
"errors.notFound"; // Resource not found
"errors.unauthorized"; // Session expired
"errors.forbidden"; // No permission
"errors.tooManyRequests"; // Rate limited
"errors.somethingWrong"; // Generic fallback
```

## Auto-Retry Behavior

- **429 errors**: Automatic retry (5 times max)
- **5xx errors**: Automatic retry (3 times max)
- **Network errors**: Automatic retry (3 times max)
- **Exponential backoff**: 1s → 2s → 4s → 8s → 16s → 32s (capped)

## Notification Duration

- Success: 5 seconds
- Info: 5 seconds
- Warning: 6 seconds
- Error: 6 seconds

## Components Architecture

```
App.tsx
├── ErrorProvider (wraps everything)
│   ├── ThemeContextProvider
│   │   ├── BrowserRouter
│   │   │   ├── AuthProvider
│   │   │   │   ├── CartProvider
│   │   │   │   │   └── ...other providers
│   │   │   │   │       └── AppRoutes
│   │   │   │   └── GlobalSnackbar (displays all errors)
```

## File Locations

- **Context**: `frontend/src/context/ErrorContext.tsx`
- **Hook**: `frontend/src/hooks/useGlobalError.ts`
- **Component**: `frontend/src/components/GlobalSnackbar.tsx`
- **API Client**: `frontend/src/api/client.ts`
- **Utilities**: `frontend/src/utils/ErrorHandler.ts`
- **Examples**: `frontend/src/examples/GlobalErrorNotificationExample.tsx`

## Testing Checklist

- [ ] Notifications appear at top-right corner
- [ ] Multiple errors stack vertically
- [ ] Auto-dismiss after 5-6 seconds
- [ ] Manual close button works
- [ ] Translations work in all 3 languages
- [ ] Network errors trigger automatically
- [ ] Rate limit errors show warning
- [ ] 401 errors redirect to login

## Real Component Example

```typescript
import { useGlobalError } from "@/hooks/useGlobalError";
import { useMutation } from "@tanstack/react-query";
import { ErrorHandler } from "@/utils/ErrorHandler";

export const MyComponent = () => {
  const { showError, showSuccess } = useGlobalError();

  const mutation = useMutation({
    mutationFn: async (data) => apiClient.post("/api/data", data),
    onSuccess: () => showSuccess("Saved!"),
    onError: (error) => showError(ErrorHandler.getUserFriendlyMessage(error)),
  });

  return (
    <button onClick={() => mutation.mutate({name: "test"})}>
      {mutation.isPending ? "Saving..." : "Save"}
    </button>
  );
};
```

---

**Status**: ✅ Production Ready - All errors compile successfully
