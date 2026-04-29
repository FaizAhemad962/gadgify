import { Radio, type RadioProps, styled } from "@mui/material";
import { tokens } from "@/theme/theme";

const StyledRadio = styled(Radio)<RadioProps>(() => ({
  color: tokens.gray400,
  "&.Mui-checked": {
    color: tokens.accent,
  },
  "&:hover": {
    backgroundColor: `${tokens.accent}10`,
  },
  "& .MuiSvgIcon-root": {
    fontSize: 24,
  },
}));

export const CustomRadio = (props: RadioProps) => <StyledRadio {...props} />;
