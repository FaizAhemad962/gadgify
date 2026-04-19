import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeContextProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CouponProvider } from "./context/CouponContext";
import { WishlistProvider } from "./context/WishlistContext";
import { SearchProvider } from "./context/SearchContext";
import { CompareProvider } from "./context/CompareContext";
import { ErrorProvider } from "./context/ErrorContext";
import ScrollToTop from "./components/ScrollToTop";
import GlobalSnackbar from "./components/GlobalSnackbar";
import AppRoutes from "./routes/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <ThemeContextProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
              <CartProvider>
                <CouponProvider>
                  <WishlistProvider>
                    <SearchProvider>
                      <CompareProvider>
                        <AppRoutes />
                        <GlobalSnackbar />
                      </CompareProvider>
                    </SearchProvider>
                  </WishlistProvider>
                </CouponProvider>
              </CartProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeContextProvider>
      </ErrorProvider>
    </QueryClientProvider>
  );
}

export default App;
