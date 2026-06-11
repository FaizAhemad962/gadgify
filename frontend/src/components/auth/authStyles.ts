import { tokens } from "@/theme/theme";

export const authInputSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: `${tokens.radiusLg}px`,
    transition:
      "background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.9)",
    },
    "&.Mui-focused": {
      backgroundColor: tokens.white,
      boxShadow: `0 0 0 4px ${tokens.primary}1A`,
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: tokens.gray200,
  },
};
