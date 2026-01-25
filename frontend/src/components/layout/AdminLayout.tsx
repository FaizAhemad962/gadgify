import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box sx={{ p: 2, mb: 8, minHeight: "80vh" }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
