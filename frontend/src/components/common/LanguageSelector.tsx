import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import {
  Box,
  ListItemIcon,
  ListItemText,
  Typography,
  type SxProps,
  type Theme,
} from "@/mui/material";
import { Check, ExpandMore, Language } from "@/mui/icons";
import { tokens } from "@/theme/theme";
import { CustomMenu, CustomMenuItem } from "@/components/ui/CustomMenu";
import { CustomButton } from "@/components/ui/CustomButton";
import { navLinkIconSx, navMenuIconSx } from "@/components/ui/navigationStyles";

type LanguageSelectorTone = "light" | "dark" | "surface";

type LanguageSelectorProps = {
  tone?: LanguageSelectorTone;
  compact?: boolean;
  fullWidth?: boolean;
  color?: string;
  bgcolor?: string;
  sx?: SxProps<Theme>;
};

const LanguageSelector = ({
  tone,
  compact = false,
  fullWidth = false,
  color,
  bgcolor,
  sx,
}: LanguageSelectorProps) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const resolvedTone: LanguageSelectorTone =
    tone || (color === "#fff" ? "dark" : "surface");
  const isDarkTone = resolvedTone === "dark";

  const languages = useMemo(
    () => [
      { value: "en", label: t("nav.languages.en"), shortLabel: "EN" },
      { value: "mr", label: t("nav.languages.mr"), shortLabel: "MR" },
      { value: "hi", label: t("nav.languages.hi"), shortLabel: "HI" },
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
    <Box sx={{ display: "flex", alignItems: "center", width: fullWidth ? "100%" : "auto" }}>
      <CustomButton
        size="small"
        appVariant="ghost"
        startIcon={<Language sx={navLinkIconSx} />}
        endIcon={
          <ExpandMore
            sx={{
              ...navLinkIconSx,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 160ms ease",
            }}
          />
        }
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? "language-selector-menu" : undefined}
        sx={{
          minWidth: compact ? 104 : { xs: 118, sm: 136 },
          width: fullWidth ? "100%" : "auto",
          justifyContent: "space-between",
          px: compact ? 1.25 : 1.75,
          py: compact ? 0.75 : 0.9,
          borderRadius: "999px",
          color: color || (isDarkTone ? tokens.white : tokens.primary),
          bgcolor:
            bgcolor ||
            (isDarkTone ? "rgba(255,255,255,0.10)" : tokens.white),
          border: `1px solid ${
            isDarkTone ? "rgba(255,255,255,0.28)" : tokens.gray200
          }`,
          fontWeight: 800,
          boxShadow: "none",
          backdropFilter: isDarkTone ? "blur(10px)" : "none",
          "&:hover": {
            bgcolor:
              isDarkTone ? "rgba(255,255,255,0.16)" : tokens.gray50,
            borderColor:
              isDarkTone ? "rgba(255,255,255,0.42)" : tokens.primary,
            color: color || (isDarkTone ? tokens.white : tokens.primaryDark),
          },
          ...(open && {
            bgcolor: isDarkTone ? "rgba(255,255,255,0.18)" : tokens.gray50,
            borderColor: isDarkTone
              ? "rgba(255,255,255,0.5)"
              : tokens.primary,
          }),
          "& .MuiButton-startIcon": {
            mr: compact ? 0.5 : 0.75,
            color: "currentColor",
          },
          "& .MuiButton-endIcon": {
            ml: compact ? 0.25 : 0.5,
            color: "currentColor",
          },
          ...sx,
        }}
      >
        <Typography
          component="span"
          variant="body2"
          fontWeight={800}
          noWrap
          sx={{ lineHeight: 1.2 }}
        >
          {compact ? selectedLanguage.shortLabel : selectedLanguage.label}
        </Typography>
      </CustomButton>
      <CustomMenu
        id="language-selector-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              minWidth: anchorEl?.offsetWidth || (compact ? 180 : 220),
            },
          },
        }}
      >
        {languages.map((language) => {
          const isSelected = language.value === selectedLanguage.value;

          return (
            <CustomMenuItem
              key={language.value}
              selected={isSelected}
              onClick={() => changeLanguage(language.value)}
              sx={{
                justifyContent: "space-between",
                "&.Mui-selected": {
                  bgcolor: `${tokens.primary}12`,
                  color: tokens.primary,
                },
              }}
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
                secondary={language.shortLabel}
                primaryTypographyProps={{
                  fontWeight: isSelected ? 800 : 700,
                  color: "inherit",
                }}
                secondaryTypographyProps={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: isSelected ? tokens.primary : tokens.gray500,
                }}
              />
            </CustomMenuItem>
          );
        })}
      </CustomMenu>
    </Box>
  );
};

export default LanguageSelector;
