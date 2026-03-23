import { IconButton, type IconButtonProps } from "@mui/material";

export const CustomIconButton = (props: IconButtonProps) => {
  return (
    <IconButton
      {...props}
      sx={{
        transition: "all 0.2s",
        ...props.sx,
      }}
    />
  );
};
