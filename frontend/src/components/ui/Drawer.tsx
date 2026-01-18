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
} from "@mui/material";

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
  brand,
  items,
  width = 280,
  anchor = "left",
  open: controlledOpen,
  onOpenChange,
  trigger,
  closeOnItemClick = true,
  endContent
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

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
    (i) => !i.position || i.position === "center"
  );
  const endItems = items.filter((i) => i.position === "end");

  return (
    <>
      {trigger && (
        <Box onClick={() => setOpen(true)} sx={{ display: "inline-flex" }}>
          {trigger}
        </Box>
      )}

      <Drawer disableScrollLock open={open} anchor={anchor} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width,
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ---------- BRAND ---------- */}
          {brand && (
            <>
              <Box
                onClick={brand.onClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 2,
                  cursor: brand.onClick ? "pointer" : "default",
                }}
              >
                {brand.icon}
                {brand.title && (
                  <Box sx={{ fontWeight: 600, fontSize: 18 }}>
                    {brand.title}
                  </Box>
                )}
              </Box>
              <Divider />
            </>
          )}

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
  <Box sx={{mt:'auto'}}>
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
