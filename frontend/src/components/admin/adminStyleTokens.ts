import { tokens } from "@/theme/theme";

export const adminPageSx = {
  px: { xs: 2, md: 3 },
  py: { xs: 2, md: 3 },
} as const;

export const adminPanelSx = {
  bgcolor: tokens.white,
  border: `1px solid ${tokens.gray200}`,
  borderRadius: `${tokens.radiusXl}px`,
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.06)",
} as const;

export const adminDialogPaperSx = {
  borderRadius: `${tokens.radiusXl}px`,
  border: `1px solid ${tokens.gray200}`,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.99) 100%)",
  boxShadow: "0 28px 90px rgba(15, 23, 42, 0.24)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  maxHeight: "calc(100vh - 64px)",
} as const;

export const adminDialogTitleSx = {
  px: 3,
  py: 2.25,
  flexShrink: 0,
  color: tokens.gray900,
  fontWeight: 900,
  letterSpacing: "-0.02em",
  borderBottom: `1px solid ${tokens.gray200}`,
  background:
    "linear-gradient(135deg, rgba(27,42,74,0.06), rgba(255,107,44,0.08))",
} as const;

export const adminDialogContentSx = {
  px: 3,
  pt: "36px !important",
  pb: 3,
  flex: "1 1 auto",
  overflowY: "auto",
  bgcolor: tokens.white,
  scrollbarWidth: "thin",
  scrollbarColor: `${tokens.gray300} transparent`,
  "&::-webkit-scrollbar": {
    width: 8,
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: 999,
    backgroundColor: tokens.gray300,
  },
  "& .MuiTextField-root, & .MuiFormControl-root": {
    mt: 0.5,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: `${tokens.radiusMd}px`,
  },
} as const;

export const adminDialogActionsSx = {
  px: 3,
  py: 2,
  flexShrink: 0,
  gap: 1,
  borderTop: `1px solid ${tokens.gray200}`,
  bgcolor: tokens.gray50,
} as const;

export const adminSearchFieldSx = {
  width: { xs: "100%", sm: 360 },
  "& .MuiOutlinedInput-root": {
    borderRadius: "999px",
    bgcolor: tokens.white,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  },
} as const;
