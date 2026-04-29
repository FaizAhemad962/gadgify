import { Tabs, Tab, type TabsProps, type TabProps, styled } from "@mui/material";
import { tokens } from "@/theme/theme";

const StyledTabs = styled(Tabs)<TabsProps>(({ theme }) => ({
  minHeight: 48,
  "& .MuiTabs-indicator": {
    height: 3,
    borderRadius: "3px 3px 0 0",
    backgroundColor: tokens.accent,
  },
}));

const StyledTab = styled(Tab)<TabProps>(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  minHeight: 48,
  transition: "all 0.2s ease",
  "&.Mui-selected": {
    color: tokens.accent,
  },
  "&:hover": {
    color: tokens.accentLight,
    opacity: 1,
  },
}));

export const CustomTabs = (props: TabsProps) => <StyledTabs {...props} />;
export const CustomTab = (props: TabProps) => <StyledTab disableRipple {...props} />;
