# Global Error Notification System - Implementation Guide

## ✅ Completed Setup

The global error notification system has been successfully implemented with the following components:

### Files Created/Modified:

1. **`frontend/src/context/ErrorContext.tsx`** ✅
   - Global error state management using React Context
   - Methods: `showError()`, `showSuccess()`, `showWarning()`, `showInfo()`
   - Auto-dismiss with configurable duration
   - Error stacking support

2. **`frontend/src/hooks/useGlobalError.ts`** ✅
   - Custom hook to access ErrorContext
   - Safe usage check (throws error if used outside ErrorProvider)

3. **`frontend/src/components/GlobalSnackbar.tsx`** ✅
   - MUI Snackbar + Alert based notification display
   - Stacked notifications at top-right
   - Auto-dismiss and manual close support
   - Fully styled with theme tokens

4. **`frontend/src/App.tsx`** ✅ UPDATED
   - ErrorProvider wrapping the entire app
   - GlobalSnackbar component added after AppRoutes
   - All providers properly nested

5. **`frontend/src/api/client.ts`** ✅ UPDATED
   - Enhanced with exponential backoff retry logic
   - Automatic retries for:
     - 429 (Too Many Requests): 5 retries
     - 5xx errors: 3 retries
     - Network errors: 3 retries
   - Exponential delay: 1s, 2s, 4s, 8s, 16s, 32s (capped at 30s)

6. **Translation Keys** ✅ UPDATED
   - `en.json`: Added 11 error message keys
   - `mr.json`: Added 11 Marathi translations
   - `hi.json`: Added 11 Hindi translations
   - Keys: networkError, timeoutError, serverError, serviceUnavailable, notFound, unauthorized, forbidden, tooManyRequests, retrying, retryingNow, maxRetriesExceeded

7. **`frontend/src/utils/ErrorHandler.ts`** ✅ (Already Existed)
   - Utility methods for error classification
   - User-friendly message extraction
   - Validation error handling
   - Error type checking methods

8. **`frontend/src/examples/GlobalErrorNotificationExample.tsx`** ✅
   - Complete usage examples for different scenarios
   - Best practices and patterns
   - Integration with React Query
   - i18n support examples

## 🚀 How to Use in Your Components

### Basic Usage - React Query Mutation:

```typescript
import { useGlobalError } from "@/hooks/useGlobalError";
import { ErrorHandler } from "@/utils/ErrorHandler";
import { useMutation } from "@tanstack/react-query";

export const useAddProductMutation = () => {
  const { showError, showSuccess } = useGlobalError();

  return useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/products", data);
      return response.data;
    },
    onSuccess: () => {
      showSuccess("Product added successfully!");
    },
    onError: (error) => {
      const message = ErrorHandler.getUserFriendlyMessage(error);
      showError(message);
    },
  });
};
```

### Handling Different Error Types:

```typescript
const handleRequest = async () => {
  try {
    await apiClient.get("/endpoint");
  } catch (error) {
    if (ErrorHandler.isRateLimitError(error)) {
      showWarning("errors.tooManyRequests");
    } else if (ErrorHandler.isNetworkError(error)) {
      showError("errors.networkError");
    } else if (ErrorHandler.isServerError(error)) {
      showError("errors.serverError");
    } else if (ErrorHandler.isValidationError(error)) {
      const errors = ErrorHandler.getValidationErrors(error);
      const messages = Object.values(errors).flat().join(", ");
      showError(messages);
    } else {
      showError(ErrorHandler.getUserFriendlyMessage(error));
    }
  }
};
```

### Available Methods:

```typescript
const {
  errors, // Array of current error notifications
  showError, // Show error (red) notification
  showSuccess, // Show success (green) notification
  showWarning, // Show warning (orange) notification
  showInfo, // Show info (blue) notification
  clearError, // Clear specific error by ID
  clearAll, // Clear all errors
} = useGlobalError();
```

### Error Type Checking:

```typescript
ErrorHandler.isNetworkError(error); // Network connectivity issues
ErrorHandler.isServerError(error); // 5xx errors
ErrorHandler.isAuthError(error); // 401 Unauthorized
ErrorHandler.isAuthorizationError(error); // 403 Forbidden
ErrorHandler.isRateLimitError(error); // 429 Too Many Requests
ErrorHandler.isValidationError(error); // Form validation errors
```

## 🔄 Automatic Retry Logic

The API client now automatically handles retries with exponential backoff:

- **429 (Too Many Requests)**: Retries up to 5 times
- **5xx (Server Errors)**: Retries up to 3 times
- **Network Errors**: Retries up to 3 times
- **Timeout**: Retries with exponential backoff

**You don't need to handle retries manually** - they're handled transparently by the client.

## 🎨 UI Features

- **Stacked Notifications**: Multiple errors display together at top-right
- **Auto-Dismiss**: Errors automatically close after 5-6 seconds
- **Manual Close**: Users can click X to close immediately
- **MUI Components**: Uses native MUI Snackbar and Alert components
- **Theme Integration**: Respects current theme colors and tokens
- **i18n Support**: All error messages automatically translated

## 📋 Error Notification Duration

- Success messages: 5 seconds
- Info messages: 5 seconds
- Warning messages: 6 seconds
- Error messages: 6 seconds
- Custom duration: Can be specified when calling `showError(message, severity, duration)`

## 🌍 Internationalization

All error messages support 3 languages:

**English (en.json):**

- errors.networkError
- errors.timeoutError
- errors.serverError
- errors.serviceUnavailable
- errors.notFound
- errors.unauthorized
- errors.forbidden
- errors.tooManyRequests

**Marathi (mr.json):** Same keys with Marathi translations
**Hindi (hi.json):** Same keys with Hindi translations

Use i18n keys directly in your error calls:

```typescript
showError("errors.networkError"); // Will be automatically translated
```

## ✨ Best Practices

1. **Always use useGlobalError hook** for error handling in components
2. **Use ErrorHandler utility** to check error types before showing messages
3. **Provide context** - show which action failed, not just generic errors
4. **Use appropriate severity** - error, warning, info, success
5. **Leverage retry logic** - API client handles it, no need for manual retries
6. **Test in all languages** - verify translations work correctly
7. **Handle loading states** - show loading while API calls are in progress
8. **Clear errors when needed** - use `clearError()` or `clearAll()` when appropriate

## 🧪 Testing the Implementation

1. Open your frontend in development mode
2. Import `useGlobalError` in a test component
3. Call `showError("Test error message")`
4. Verify MUI Snackbar appears at top-right with Alert component
5. Test auto-dismiss and manual close
6. Test stacking by calling multiple errors

## 📊 Integration with Existing Code

The global error notification system works with:

- ✅ React Query (mutations and queries)
- ✅ Form submissions
- ✅ API calls with axios
- ✅ All existing error handling
- ✅ i18n translations
- ✅ MUI theme system
- ✅ All page/component types

## 🔍 Troubleshooting

**Notifications not showing?**

- Ensure ErrorProvider wraps your component tree in App.tsx
- Verify GlobalSnackbar component is placed in App.tsx
- Check browser console for TypeScript errors

**Translations not working?**

- Verify error keys exist in en.json, mr.json, hi.json
- Ensure useTranslation() hook is used if passing i18n keys
- Check that ErrorProvider is inside language context

**Retries not happening?**

- Verify apiClient is being used (not fetch)
- Check network tab for retry attempts
- Verify error status matches retry conditions

## 📚 Files Reference

- Global Error Context: `frontend/src/context/ErrorContext.tsx`
- Error Hook: `frontend/src/hooks/useGlobalError.ts`
- Notification UI: `frontend/src/components/GlobalSnackbar.tsx`
- API Client: `frontend/src/api/client.ts`
- Error Utility: `frontend/src/utils/ErrorHandler.ts`
- Examples: `frontend/src/examples/GlobalErrorNotificationExample.tsx`
- Main App: `frontend/src/App.tsx`

## ✅ Verification Checklist

- [x] ErrorContext.tsx created and no compilation errors
- [x] useGlobalError.ts hook created and working
- [x] GlobalSnackbar.tsx component created with MUI components
- [x] App.tsx updated with ErrorProvider and GlobalSnackbar
- [x] API client enhanced with retry logic
- [x] Translation keys added to en.json, mr.json, hi.json
- [x] ErrorHandler utility available with all methods
- [x] Example component created for reference
- [x] No TypeScript compilation errors
- [x] Ready for integration into existing components

## 🎯 Next Steps

1. **Start using in components**: Import useGlobalError and replace console errors
2. **Test with real API calls**: Try network errors, timeouts, rate limits
3. **Verify translations**: Test with all 3 languages (English, Marathi, Hindi)
4. **Update mutation handlers**: Add error handling to all React Query mutations
5. **Test rate limiting**: Verify 429 errors trigger retry logic
6. **Monitor in production**: Track which errors are most common

---

**System is ready for production use! All components are compiled without errors.**
