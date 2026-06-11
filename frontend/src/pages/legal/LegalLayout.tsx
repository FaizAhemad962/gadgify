import { Container, Box, Typography } from "@/mui/material";
import { ArrowBack } from "@/mui/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@/components/ui/CustomButton";

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
}

const LegalLayout = ({ title, children }: LegalLayoutProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <CustomButton
        appVariant="secondary"
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate("/")}
        sx={{ mb: 3 }}
      >
        {t("common.back")}
      </CustomButton>

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
