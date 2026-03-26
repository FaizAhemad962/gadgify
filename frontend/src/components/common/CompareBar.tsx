import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button, Chip, Slide } from "@mui/material";
import { CompareArrows, Close } from "@mui/icons-material";
import { useCompare } from "../../context/CompareContext";
import { tokens } from "@/theme/theme";

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
        <CompareArrows sx={{ fontSize: 20 }} />
        <Chip
          label={`${compareIds.length} ${t("compare.itemsSelected")}`}
          sx={{ bgcolor: tokens.accent, color: "#fff", fontWeight: 600 }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate("/compare")}
          disabled={compareIds.length < 2}
          sx={{
            bgcolor: tokens.accent,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: tokens.accentDark },
          }}
        >
          {t("compare.compareNow")}
        </Button>
        <Button
          size="small"
          startIcon={<Close />}
          onClick={clearCompare}
          sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none" }}
        >
          {t("compare.clear")}
        </Button>
      </Box>
    </Slide>
  );
};

export default CompareBar;
