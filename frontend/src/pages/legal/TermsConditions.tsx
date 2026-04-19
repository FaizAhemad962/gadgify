import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LegalLayout from "./LegalLayout";

const TermsConditions = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout title={t("legal.termsConditions.title")}>
      <Typography paragraph>{t("legal.termsConditions.para1")}</Typography>

      <Typography paragraph>{t("legal.termsConditions.para2")}</Typography>

      <Typography paragraph>{t("legal.termsConditions.para3")}</Typography>

      <Typography paragraph>{t("legal.termsConditions.para4")}</Typography>
    </LegalLayout>
  );
};

export default TermsConditions;
