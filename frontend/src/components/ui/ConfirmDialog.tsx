import { CustomDialog } from "./CustomDialog";
import { CustomButton } from "./CustomButton";
import { Typography, Box } from "@mui/material";
import { WarningAmber as WarningIcon } from "@mui/icons-material";
import { tokens } from "@/theme/theme";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  type?: "danger" | "info";
}

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  type = "info",
}: ConfirmDialogProps) => {
  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <CustomButton onClick={onClose} disabled={loading}>
            {cancelText}
          </CustomButton>
          <CustomButton
            variant="contained"
            color={type === "danger" ? "error" : "primary"}
            onClick={onConfirm}
            isLoading={loading}
          >
            {confirmText}
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mt: 1 }}>
        {type === "danger" && (
          <WarningIcon sx={{ color: tokens.error, fontSize: 32 }} />
        )}
        <Typography variant="body1">{message}</Typography>
      </Box>
    </CustomDialog>
  );
};
