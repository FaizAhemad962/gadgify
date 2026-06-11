import { Menu, MenuItem, type MenuProps, type MenuItemProps, styled } from "@/mui/material";
import { tokens } from "@/theme/theme";
import { navIconSizes } from "./navigationStyles";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 24,
    marginTop: theme.spacing(1),
    minWidth: 220,
    overflow: "hidden",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    boxShadow:
      "0 24px 70px rgba(15, 23, 42, 0.18), 0 2px 12px rgba(15, 23, 42, 0.08)",
    border: `1px solid ${tokens.gray200}`,
    backdropFilter: "blur(18px)",
    "& .MuiMenu-list": {
      padding: "8px",
    },
  },
}));

const StyledMenuItem = styled(MenuItem)<MenuItemProps>(() => ({
  fontSize: "0.9rem",
  fontWeight: 700,
  padding: "10px 12px",
  gap: "12px",
  borderRadius: 14,
  transition: "all 0.2s ease",
  color: tokens.gray800,
  "&:hover": {
    backgroundColor: "rgba(30,49,89,0.08)",
    color: tokens.primary,
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(30,49,89,0.10)",
    color: tokens.primary,
  },
  "&.Mui-selected:hover": {
    backgroundColor: "rgba(30,49,89,0.14)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: navIconSizes.menu,
    color: "currentColor",
  },
  "&:hover .MuiSvgIcon-root": {
    color: "currentColor",
  },
}));

export const CustomMenu = (props: MenuProps) => <StyledMenu {...props} />;
export const CustomMenuItem = (props: MenuItemProps) => (
  <StyledMenuItem {...props} />
);
