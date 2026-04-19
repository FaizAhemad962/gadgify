import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LegalLayout from "./LegalLayout";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout title={t("legal.privacyPolicy.title")}>
      <Typography paragraph>{t("legal.privacyPolicy.para1")}</Typography>

      <Typography paragraph>{t("legal.privacyPolicy.para2")}</Typography>

      <Typography paragraph>{t("legal.privacyPolicy.para3")}</Typography>

      <Typography paragraph>{t("legal.privacyPolicy.para4")}</Typography>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
