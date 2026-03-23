import {
  Dialog,
  type DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import { tokens } from "@/theme/theme";

interface CustomDialogProps extends Omit<DialogProps, "children"> {
  title: string;
  contentNode: React.ReactNode;
  actions?: React.ReactNode;
  onClose: () => void;
}

export const CustomDialog = ({
  title,
  contentNode,
  actions,
  onClose,
  ...props
}: CustomDialogProps) => {
  return (
    <Dialog
      {...props}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: tokens.white,
          backgroundImage: "none",
          border: `1px solid ${tokens.gray200}`,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: tokens.primary,
          fontWeight: 600,
          borderBottom: `1px solid ${tokens.gray200}`,
          fontSize: "1.25rem",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: tokens.white,
          backgroundImage: "none",
        }}
      >
        <Box sx={{ mt: 2 }}>{contentNode}</Box>
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            borderTop: `1px solid ${tokens.gray200}`,
            p: 2,
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};
