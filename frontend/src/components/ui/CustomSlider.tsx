import { Slider, type SliderProps, styled } from "@mui/material";
import { tokens } from "@/theme/theme";

const StyledSlider = styled(Slider)<SliderProps>(() => ({
  color: tokens.accent,
  height: 6,
  padding: "13px 0",
  "& .MuiSlider-thumb": {
    height: 20,
    width: 20,
    backgroundColor: "#fff",
    border: `2px solid ${tokens.accent}`,
    "&:hover": {
      boxShadow: "0 0 0 8px rgba(255, 107, 44, 0.16)",
    },
    "&.Mui-active": {
      boxShadow: "0 0 0 14px rgba(255, 107, 44, 0.16)",
    },
  },
  "& .MuiSlider-track": {
    height: 6,
    borderRadius: 3,
  },
  "& .MuiSlider-rail": {
    color: tokens.gray200,
    opacity: 1,
    height: 6,
    borderRadius: 3,
  },
  "& .MuiSlider-valueLabel": {
    lineHeight: 1.2,
    fontSize: 12,
    background: "unset",
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: "50% 50% 50% 0",
    backgroundColor: tokens.accent,
    transformOrigin: "bottom left",
    transform: "translate(50%, -100%) rotate(-45deg) scale(0)",
    "&:before": { display: "none" },
    "&.MuiSlider-valueLabelOpen": {
      transform: "translate(50%, -100%) rotate(-45deg) scale(1)",
    },
    "& > *": {
      transform: "rotate(45deg)",
    },
  },
}));

export const CustomSlider = (props: SliderProps) => <StyledSlider {...props} />;
