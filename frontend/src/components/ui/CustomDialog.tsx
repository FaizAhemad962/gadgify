import React from "react";
import {
  Dialog,
  type DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@/mui/material";
import {
  adminDialogActionsSx,
  adminDialogContentSx,
  adminDialogPaperSx,
  adminDialogTitleSx,
} from "@/components/admin/adminStyleTokens";

interface CustomDialogProps extends DialogProps {
  title: string;
  actions?: React.ReactNode;
  onClose: () => void;
}

export const CustomDialog = ({
  title,
  children,
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
          ...adminDialogPaperSx,
        },
      }}
    >
      <DialogTitle
        sx={{
          ...adminDialogTitleSx,
          fontSize: "1.25rem",
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent
        sx={{
          ...adminDialogContentSx,
        }}
      >
        <Box>{children}</Box>
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            ...adminDialogActionsSx,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};
