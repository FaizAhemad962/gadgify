import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectProps,
  type FormControlProps,
} from "@mui/material";
import { tokens } from "@/theme/theme";

interface CustomSelectProps extends Omit<SelectProps, "children"> {
  label: string;
  options: { value: string | number; label: string }[];
  formControlProps?: Partial<FormControlProps>;
}

export const CustomSelect = ({
  label,
  options,
  formControlProps,
  ...props
}: CustomSelectProps) => {
  return (
    <FormControl fullWidth {...formControlProps}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        {...props}
        sx={{
          borderRadius: 2,
          ...props.sx,
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: 2,
              border: `1px solid ${tokens.gray200}`,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              fontSize: "0.875rem",
              py: 1.5,
              transition: "all 0.15s",
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
