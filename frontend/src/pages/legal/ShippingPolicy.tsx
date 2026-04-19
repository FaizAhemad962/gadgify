import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LegalLayout from "./LegalLayout";

const ShippingPolicy = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout title={t("legal.shippingPolicy.title")}>
      <Typography paragraph>{t("legal.shippingPolicy.para1")}</Typography>

      <Typography paragraph>{t("legal.shippingPolicy.para2")}</Typography>

      <Typography paragraph>{t("legal.shippingPolicy.para3")}</Typography>
    </LegalLayout>
  );
};

export default ShippingPolicy;
