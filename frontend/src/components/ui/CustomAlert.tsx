import React from "react";
import { Alert, type AlertProps } from "@mui/material";

export const CustomAlert = (props: AlertProps) => {
  return (
    <Alert
      {...props}
      sx={{
        borderRadius: 2,
        ...props.sx,
      }}
    />
  );
};
