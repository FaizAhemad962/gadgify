import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LegalLayout from "./LegalLayout";

const RefundPolicy = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout title={t("legal.refundPolicy.title")}>
      <Typography paragraph>{t("legal.refundPolicy.para1")}</Typography>

      <Typography paragraph>{t("legal.refundPolicy.para2")}</Typography>

      <Typography paragraph>{t("legal.refundPolicy.para3")}</Typography>

      <Typography paragraph>{t("legal.refundPolicy.para4")}</Typography>
    </LegalLayout>
  );
};

export default RefundPolicy;
