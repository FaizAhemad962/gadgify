import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageContainer from "./PageContainer";
import CompareBar from "../common/CompareBar";
import ScrollToTopButton from "../ScrollToTopButton";
import { useAuth } from "../../context/AuthContext";

const Layout = () => {
  const { isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  // Determine if this is an admin/super-admin accessing the layout
  const isAdminRole = isAdmin || isSuperAdmin;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Navbar - shared across all roles */}
      <Navbar />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: isAdminRole ? "auto" : "100vh",
        }}
      >
        {/* USER LAYOUT - with PageContainer */}
        {!isAdminRole && isAuthenticated ? (
          <PageContainer>
            <Outlet />
          </PageContainer>
        ) : null}

        {/* ADMIN LAYOUT - with admin-specific styling */}
        {isAdminRole && isAuthenticated ? (
          <Box
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: 3,
              maxWidth: 1400,
              mx: "auto",
              width: "100%",
              mb: 8,
              minHeight: "80vh",
            }}
          >
            <Outlet />
          </Box>
        ) : null}

        {/* PUBLIC ROUTE (no auth) - full page width */}
        {!isAuthenticated ? (
          <PageContainer>
            <Outlet />
          </PageContainer>
        ) : null}
      </Box>

      {/* CompareBar - shown for all authenticated users */}
      {isAuthenticated && <CompareBar />}

      {/* Scroll to top button - shown on all pages */}
      <ScrollToTopButton />

      {/* Footer - shared across all roles */}
      <Footer />
    </Box>
  );
};

export default Layout;
