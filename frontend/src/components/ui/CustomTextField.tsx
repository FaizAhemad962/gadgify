import { TextField, type TextFieldProps } from "@mui/material";

export const CustomTextField = (props: TextFieldProps) => {
  return <TextField {...props} sx={[props.sx ?? {}]} />;
};
