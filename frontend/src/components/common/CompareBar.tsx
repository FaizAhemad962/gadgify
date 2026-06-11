import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Chip, Slide } from "@/mui/material";
import { CompareArrows, Close } from "@/mui/icons";
import { useCompare } from "../../context/CompareContext";
import { tokens } from "@/theme/theme";
import { appIconSx } from "@/components/ui/navigationStyles";
import { CustomButton } from "@/components/ui/CustomButton";

const CompareBar = () => {
  const { compareIds, clearCompare } = useCompare();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (compareIds.length === 0) return null;

  return (
    <Slide direction="up" in={compareIds.length > 0}>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: tokens.gray900,
          color: "#fff",
          py: 1.5,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          zIndex: 1300,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <CompareArrows sx={appIconSx.lg} />
        <Chip
          label={`${compareIds.length} ${t("compare.itemsSelected")}`}
          sx={{ bgcolor: tokens.accent, color: "#fff", fontWeight: 600 }}
        />
        <CustomButton
          variant="contained"
          appVariant="primary"
          size="small"
          onClick={() => navigate("/compare")}
          disabled={compareIds.length < 2}
        >
          {t("compare.compareNow")}
        </CustomButton>
        <CustomButton
          size="small"
          appVariant="ghost"
          startIcon={<Close sx={appIconSx.lg} />}
          onClick={clearCompare}
          sx={{ color: "rgba(255,255,255,0.78)" }}
        >
          {t("compare.clear")}
        </CustomButton>
      </Box>
    </Slide>
  );
};

export default CompareBar;
