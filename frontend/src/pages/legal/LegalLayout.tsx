import { Container, Box, Typography, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { tokens } from "@/theme/theme";

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

const LegalLayout = ({ title, children }: LegalLayoutProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/")}
        sx={{
          mb: 3,
          color: tokens.primary,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          "&:hover": {
            bgcolor: `${tokens.primary}10`,
          },
        }}
      >
        {t("common.back")}
      </Button>

      <Typography
        variant="h4"
        fontWeight={800}
        gutterBottom
        sx={{ mb: 3, color: "text.primary" }}
      >
        {title}
      </Typography>
      <Box sx={{ color: "text.secondary", lineHeight: 1.9 }}>
        {children}
      </Box>
    </Container>
  );
};

export default LegalLayout;
