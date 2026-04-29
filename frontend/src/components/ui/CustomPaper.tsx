import { Paper, type PaperProps, styled } from "@mui/material";
import { tokens } from "@/theme/theme";

const StyledPaper = styled(Paper)<PaperProps & { subtle?: boolean }>(
  ({ theme, subtle }) => ({
    padding: theme.spacing(3),
    borderRadius: 16,
    boxShadow: subtle ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
    border: `1px solid ${tokens.gray100}`,
    backgroundColor: tokens.white,
    ...(subtle && {
      backgroundColor: tokens.gray50,
      border: `1px dashed ${tokens.gray300}`,
    }),
  }),
);

interface CustomPaperProps extends PaperProps {
  subtle?: boolean;
}

export const CustomPaper = ({ subtle, ...props }: CustomPaperProps) => {
  return <StyledPaper subtle={subtle} {...props} />;
};
