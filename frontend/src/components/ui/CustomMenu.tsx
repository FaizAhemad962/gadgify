import { Menu, MenuItem, type MenuProps, type MenuItemProps, styled } from "@mui/material";
import { tokens } from "@/theme/theme";

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
    borderRadius: 12,
    marginTop: theme.spacing(1),
    minWidth: 180,
    boxShadow:
      "0px 5px 15px rgba(0,0,0,0.1), 0px 0px 1px rgba(0,0,0,0.05)",
    border: `1px solid ${tokens.gray200}`,
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
  },
}));

const StyledMenuItem = styled(MenuItem)<MenuItemProps>(({ theme }) => ({
  fontSize: "0.9rem",
  fontWeight: 500,
  padding: "10px 16px",
  gap: "12px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: tokens.gray100,
    color: tokens.accent,
  },
  "& .MuiSvgIcon-root": {
    fontSize: 20,
    color: tokens.gray500,
  },
  "&:hover .MuiSvgIcon-root": {
    color: tokens.accent,
  },
}));

export const CustomMenu = (props: MenuProps) => <StyledMenu {...props} />;
export const CustomMenuItem = (props: MenuItemProps) => (
  <StyledMenuItem {...props} />
);
