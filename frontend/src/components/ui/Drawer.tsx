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
} from "@mui/material";
import brandIcon from "../../assets/brand-icon.png";
import { useTranslation } from "react-i18next";
import {CloseSharp } from "@mui/icons-material";

/* ---------- Types ---------- */

export type DrawerItemPosition = "top" | "center" | "end";

export type DrawerItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  position?: DrawerItemPosition;
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
    <List>
      {list.map((item) => (
        <ListItem key={item.id} disablePadding>
          <ListItemButton onClick={() => handleItemClick(item)}>
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.label} />
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
        disableScrollLock
        open={open}
        anchor={anchor}
        onClose={() => setOpen(false)}
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
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 2,
              }}
            >
              <IconButton>
                <img
                  alt={t("app.title")}
                  height={130}
                  width={100}
                  src={brandIcon}
                ></img>
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
