import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageContainer from "./PageContainer";
import CompareBar from "../common/CompareBar";

const Layout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <PageContainer>
          <Outlet />
        </PageContainer>
      </Box>
      <Footer />
      <CompareBar />
    </Box>
  );
};

export default Layout;
