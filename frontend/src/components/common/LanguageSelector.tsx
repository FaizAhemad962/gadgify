import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import {
  Box,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@/mui/material";
import { Check, ExpandMore, Language } from "@/mui/icons";
import { tokens } from "@/theme/theme";
import { CustomMenu, CustomMenuItem } from "@/components/ui/CustomMenu";
import { CustomButton } from "@/components/ui/CustomButton";
import { navLinkIconSx, navMenuIconSx } from "@/components/ui/navigationStyles";

const LanguageSelector = ({
  color,
  bgcolor,
}: {
  color?: string;
  bgcolor?: string;
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const languages = useMemo(
    () => [
      { value: "en", label: t("nav.languages.en") },
      { value: "mr", label: t("nav.languages.mr") },
      { value: "hi", label: t("nav.languages.hi") },
    ],
    [t],
  );

  const selectedLanguage =
    languages.find((language) =>
      (i18n.resolvedLanguage || i18n.language).startsWith(language.value),
    ) || languages[0];

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <CustomButton
        size="small"
        appVariant="ghost"
        startIcon={<Language sx={navLinkIconSx} />}
        endIcon={<ExpandMore sx={navLinkIconSx} />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        sx={{
          minWidth: { xs: 120, sm: 132 },
          justifyContent: "space-between",
          px: 1.75,
          py: 0.85,
          borderRadius: 3,
          color: color || tokens.primary,
          bgcolor: bgcolor || "rgba(30,49,89,0.06)",
          border: `1px solid ${
            color === "#fff" ? "rgba(255,255,255,0.28)" : tokens.gray200
          }`,
          textTransform: "none",
          fontWeight: 800,
          boxShadow: "none",
          "&:hover": {
            bgcolor:
              color === "#fff" ? "rgba(255,255,255,0.14)" : tokens.gray100,
            borderColor:
              color === "#fff" ? "rgba(255,255,255,0.42)" : tokens.primary,
          },
          "& .MuiButton-startIcon": { mr: 0.75 },
          "& .MuiButton-endIcon": { ml: 0.5 },
        }}
      >
        <Typography component="span" fontWeight={800} noWrap>
          {selectedLanguage.label}
        </Typography>
      </CustomButton>
      <CustomMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {languages.map((language) => {
          const isSelected = language.value === selectedLanguage.value;

          return (
            <CustomMenuItem
              key={language.value}
              selected={isSelected}
              onClick={() => changeLanguage(language.value)}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                {isSelected ? (
                  <Check sx={navMenuIconSx} />
                ) : (
                  <Language sx={navMenuIconSx} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={language.label}
                primaryTypographyProps={{ fontWeight: isSelected ? 800 : 700 }}
              />
            </CustomMenuItem>
          );
        })}
      </CustomMenu>
    </Box>
  );
};

export default LanguageSelector;
