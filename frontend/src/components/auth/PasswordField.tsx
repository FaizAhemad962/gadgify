import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TextFieldProps } from "@/mui/material";
import { IconButton, InputAdornment, TextField } from "@/mui/material";
import { Visibility, VisibilityOff } from "@/mui/icons";
import { tokens } from "@/theme/theme";
import { authInputSx } from "./authStyles";

type PasswordFieldProps = Omit<TextFieldProps, "type" | "InputProps">;

const PasswordField = ({ sx, ...props }: PasswordFieldProps) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setVisible((current) => !current)}
              edge="end"
              size="small"
              aria-label={
                visible ? t("auth.hidePassword") : t("auth.showPassword")
              }
              sx={{
                color: tokens.gray500,
                "&:hover": { color: tokens.primary },
              }}
            >
              {visible ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={[authInputSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    />
  );
};

export default PasswordField;
