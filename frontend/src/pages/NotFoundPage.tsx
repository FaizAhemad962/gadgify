import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ErrorOutline } from "@mui/icons-material";

const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container sx={{ py: 8, textAlign: "center" }}>
      <ErrorOutline sx={{ fontSize: 100, color: "text.secondary", mb: 2 }} />
      <Typography variant="h3" gutterBottom fontWeight="600">
        {t("notFound.title")}
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        {t("notFound.heading")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("notFound.description")}
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        {t("notFound.button")}
      </Button>
    </Container>
  );
};

export default NotFoundPage;
