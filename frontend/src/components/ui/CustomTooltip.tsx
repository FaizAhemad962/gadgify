import { Tooltip, type TooltipProps, styled, tooltipClasses } from "@mui/material";
import { tokens } from "@/theme/theme";

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: tokens.primaryDark,
    color: theme.palette.common.white,
    boxShadow: theme.shadows[1],
    fontSize: 12,
    fontWeight: 500,
    padding: "8px 12px",
    borderRadius: "8px",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: tokens.primaryDark,
  },
}));

export const CustomTooltip = (props: TooltipProps) => {
  return <StyledTooltip arrow {...props} />;
};
