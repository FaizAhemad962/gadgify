import * as React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from "@/mui/material";
import { useTranslation } from "react-i18next";
import { CloseSharp } from "@/mui/icons";
import BrandMark from "../common/BrandMark";
import { tokens } from "@/theme/theme";
import { navDrawerIconSx, navIconSizes } from "./navigationStyles";

/* ---------- Types ---------- */

export type DrawerItemPosition = "top" | "center" | "end";

export type DrawerItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  position?: DrawerItemPosition;
  selected?: boolean;
};

export interface AppDrawerProps {
  brand?: {
    icon?: React.ReactNode;
    title?: string;
    onClick?: () => void;
  };
  items: DrawerItem[];
  width?: number | string;
  anchor?: "left" | "right" | "top" | "bottom";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  closeOnItemClick?: boolean;
  endContent?: React.ReactNode;
}

/* ---------- Component ---------- */

export const AppDrawer: React.FC<AppDrawerProps> = ({
  items,
  width = tokens.drawerWidth,
  anchor = "left",
  open: controlledOpen,
  onOpenChange,
  trigger,
  closeOnItemClick = true,
  endContent,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const { t } = useTranslation();
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  };

  const handleItemClick = (item?: DrawerItem) => {
    item?.onClick?.();
    if (closeOnItemClick) setOpen(false);
  };

  const renderItems = (list: DrawerItem[]) => (
    <List sx={{ px: 1.25, py: 1 }}>
      {list.map((item) => (
        <ListItem key={item.id} disablePadding>
          <ListItemButton
            selected={item.selected}
            onClick={() => handleItemClick(item)}
            sx={{
              borderRadius: "999px",
              mb: 0.75,
              minHeight: 48,
              px: 1.75,
              color: item.selected ? tokens.primary : "rgba(255,255,255,0.9)",
              border: "1px solid transparent",
              transition:
                "background-color 180ms ease, color 180ms ease, border-color 180ms ease",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255,255,255,0.14)",
              },
              "&.Mui-selected": {
                bgcolor: "rgba(255,255,255,0.94)",
                borderColor: "rgba(255,255,255,0.32)",
              },
              "&.Mui-selected:hover": {
                bgcolor: tokens.white,
              },
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: 42,
                  color: item.selected ? tokens.primaryLight : "rgba(255,255,255,0.76)",
                  "& .MuiSvgIcon-root": navDrawerIconSx,
                  "& .MuiBadge-root .MuiSvgIcon-root": navDrawerIconSx,
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: item.selected ? 800 : 700,
                fontSize: "0.95rem",
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  const topItems = items.filter((i) => i.position === "top");
  const centerItems = items.filter(
    (i) => !i.position || i.position === "center",
  );
  const endItems = items.filter((i) => i.position === "end");

  return (
    <>
      {trigger && (
        <Box onClick={() => setOpen(true)} sx={{ display: "inline-flex" }}>
          {trigger}
        </Box>
      )}

      <Drawer
        closeAfterTransition
        open={open}
        anchor={anchor}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderTopRightRadius: anchor === "left" ? 24 : 0,
              borderBottomRightRadius: anchor === "left" ? 24 : 0,
              maxWidth: "100vw",
              overflow: "hidden",
              bgcolor: "transparent",
              boxShadow: "0 28px 90px rgba(15, 23, 42, 0.34)",
            },
          },
        }}
      >
        <Box
          sx={{
            width,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            color: tokens.white,
            background:
              "linear-gradient(180deg, rgba(15,27,48,0.98), rgba(27,42,74,0.95) 48%, rgba(15,27,48,0.98))",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          {/* ---------- BRAND ---------- */}
          <>
            <Box
              sx={{
                minHeight: 96,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 2,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,107,44,0.14))",
                borderBottom: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <IconButton
                aria-label={t("app.title")}
                sx={{
                  borderRadius: 3,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                <BrandMark size={56} showText textColor={tokens.white} />
              </IconButton>
              <IconButton
                onClick={() => setOpen(false)}
                aria-label="menu"
                sx={{
                  color: tokens.white,
                  border: "1px solid rgba(255,255,255,0.18)",
                  bgcolor: "rgba(255,255,255,0.08)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
                }}
              >
                <CloseSharp sx={{ fontSize: navIconSizes.drawer }} />
              </IconButton>
            </Box>
          </>

          {/* ---------- TOP ITEMS ---------- */}
          {topItems.length > 0 && (
            <>
              {renderItems(topItems)}
              <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
            </>
          )}

          {/* ---------- CENTER ITEMS ---------- */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {renderItems(centerItems)}
          </Box>

          {/* ---------- END ITEMS ---------- */}
          {(endItems.length > 0 || endContent) && (
            <Box sx={{ mt: "auto" }}>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
              {endItems.length > 0 && renderItems(endItems)}
              {endContent}
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};
