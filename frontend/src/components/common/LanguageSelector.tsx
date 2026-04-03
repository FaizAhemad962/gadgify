import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { Box, TextField, MenuItem, IconButton } from "@mui/material";
import { Language } from "@mui/icons-material";

const LanguageSelector = ({
  color,
  bgcolor,
}: {
  color?: string;
  bgcolor?: string;
}) => {
  const { t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <IconButton style={{ color }} sx={{ p: 0, mr: 1 }}>
        <Language fontSize="small"></Language>
      </IconButton>
      <TextField
        select
        size="small"
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        sx={{
          minWidth: { xs: 80, sm: 100 },
          "& .MuiOutlinedInput-root": {
            color: color,
            fontWeight: 600,
            backgroundColor: bgcolor,
            borderRadius: 1,
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.5)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.9)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#ff9800",
            },
          },
          "& .MuiSvgIcon-root": {
            color: color,
          },
        }}
      >
        <MenuItem value="en" sx={{ fontWeight: 600 }}>
          {t("nav.languages.en")}
        </MenuItem>
        <MenuItem value="mr" sx={{ fontWeight: 600 }}>
          {t("nav.languages.mr")}
        </MenuItem>
        <MenuItem value="hi" sx={{ fontWeight: 600 }}>
          {t("nav.languages.hi")}
        </MenuItem>
      </TextField>
    </Box>
  );
};

export default LanguageSelector;
