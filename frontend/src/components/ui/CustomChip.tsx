import { Chip, type ChipProps } from "@mui/material";
import { tokens } from "@/theme/theme";

export const CustomChip = (props: ChipProps) => {
  return (
    <Chip
      {...props}
      sx={{
        bgcolor: `${tokens.primary}14`,
        color: tokens.primary,
        fontWeight: 600,
        ...props.sx,
      }}
    />
  );
};
