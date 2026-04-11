import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-data-grid",
      "@emotion/react",
      "@emotion/styled",
    ],
  },
  build: {
    // Code splitting configuration for lazy-loaded sections
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-mui": ["@mui/material", "@mui/icons-material"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-i18n": ["i18next", "react-i18next"],
          // Section chunks (lazy-loaded)
          "section-flash-sale": ["src/components/sections/FlashSale.tsx"],
          "section-best-sellers": ["src/components/sections/BestSellers.tsx"],
          "section-featured-brands": [
            "src/components/sections/FeaturedBrands.tsx",
          ],
          "section-faq": ["src/components/sections/FAQ.tsx"],
          "section-how-it-works": ["src/components/sections/HowItWorks.tsx"],
          "section-payment-security": [
            "src/components/sections/PaymentSecurity.tsx",
          ],
          "section-seasonal-collections": [
            "src/components/sections/SeasonalCollections.tsx",
          ],
          "section-customer-highlights": [
            "src/components/sections/CustomerHighlights.tsx",
          ],
        },
      },
    },
    // Increase chunk size warning limit since we're optimizing
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
