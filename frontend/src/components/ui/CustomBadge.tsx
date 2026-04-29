import { Badge, type BadgeProps, styled } from "@mui/material";
import { tokens } from "@/theme/theme";

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    fontWeight: 700,
    border: `1.5px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
    height: 18,
    minWidth: 18,
  },
  "& .MuiBadge-colorSuccess": {
    backgroundColor: tokens.success,
  },
  "& .MuiBadge-colorError": {
    backgroundColor: tokens.error,
  },
  "& .MuiBadge-colorWarning": {
    backgroundColor: tokens.warning,
    color: tokens.black,
  },
}));

export const CustomBadge = (props: BadgeProps) => {
  return <StyledBadge {...props} />;
};
