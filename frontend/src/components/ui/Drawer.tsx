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
  width?: number;
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
  width = 280,
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
    <List sx={{ px: 1, py: 1 }}>
      {list.map((item) => (
        <ListItem key={item.id} disablePadding>
          <ListItemButton
            selected={item.selected}
            onClick={() => handleItemClick(item)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 46,
              color: item.selected ? "primary.main" : "text.primary",
              "&.Mui-selected": {
                bgcolor: "rgba(255, 107, 44, 0.12)",
              },
              "&.Mui-selected:hover": {
                bgcolor: "rgba(255, 107, 44, 0.18)",
              },
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: item.selected ? "primary.main" : "text.secondary",
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: item.selected ? 700 : 600,
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
              borderTopRightRadius: anchor === "left" ? 20 : 0,
              borderBottomRightRadius: anchor === "left" ? 20 : 0,
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.22)",
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
          }}
        >
          {/* ---------- BRAND ---------- */}
          <>
            <Box
              sx={{
                height: 112,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 2,
                background:
                  "linear-gradient(135deg, rgba(27,42,74,0.06), rgba(255,107,44,0.08))",
              }}
            >
              <IconButton aria-label={t("app.title")}>
                <BrandMark size={56} showText textColor="text.primary" />
              </IconButton>
              <IconButton onClick={() => setOpen(false)} aria-label="menu">
                <CloseSharp />
              </IconButton>
            </Box>
            <Divider />
          </>

          {/* ---------- TOP ITEMS ---------- */}
          {topItems.length > 0 && (
            <>
              {renderItems(topItems)}
              <Divider />
            </>
          )}

          {/* ---------- CENTER ITEMS ---------- */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {renderItems(centerItems)}
          </Box>

          {/* ---------- END ITEMS ---------- */}
          {(endItems.length > 0 || endContent) && (
            <Box sx={{ mt: "auto" }}>
              <Divider />
              {endItems.length > 0 && renderItems(endItems)}
              {endContent}
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};
