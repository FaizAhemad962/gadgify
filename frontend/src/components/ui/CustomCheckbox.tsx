import { Checkbox, type CheckboxProps, styled } from "@mui/material";
import { tokens } from "@/theme/theme";

const StyledCheckbox = styled(Checkbox)<CheckboxProps>(({ theme }) => ({
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

export const CustomCheckbox = (props: CheckboxProps) => (
  <StyledCheckbox {...props} />
);
