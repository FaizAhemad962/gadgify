import { Checkbox, type CheckboxProps, styled } from "@/mui/material";
import { tokens } from "@/theme/theme";
import { appIconSizes } from "./navigationStyles";

const StyledCheckbox = styled(Checkbox)<CheckboxProps>(() => ({
  color: tokens.gray400,
  "&.Mui-checked": {
    color: tokens.primary,
  },
  "&:hover": {
    backgroundColor: `${tokens.primary}10`,
  },
  "& .MuiSvgIcon-root": {
    fontSize: appIconSizes.xl,
  },
}));

export const CustomCheckbox = (props: CheckboxProps) => (
  <StyledCheckbox {...props} />
);
