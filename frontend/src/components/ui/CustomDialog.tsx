import {
  Dialog,
  type DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material'

interface CustomDialogProps extends Omit<DialogProps, 'children'> {
  title: string
  content: React.ReactNode
  actions?: React.ReactNode
  isDarkTheme?: boolean
  onClose: () => void
}

export const CustomDialog = ({
  title,
  content,
  actions,
  isDarkTheme = false,
  onClose,
  ...props
}: CustomDialogProps) => {
  return (
    <Dialog
      {...props}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: isDarkTheme ? '#242628' : '#ffffff',
          backgroundImage: 'none',
          border: isDarkTheme ? '1px solid #3a3a3a' : '1px solid #e0e0e0',
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle
        sx={{
          color: isDarkTheme ? '#ff9800' : '#1976d2',
          fontWeight: '600',
          borderBottom: isDarkTheme ? '1px solid #3a3a3a' : '1px solid #e0e0e0',
          fontSize: '1.3rem',
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: isDarkTheme ? '#242628' : '#ffffff',
          backgroundImage: 'none',
          color: isDarkTheme ? '#b0b0b0' : '#000000',
        }}
      >
        <Box sx={{ mt: 2 }}>
          {content}
        </Box>
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            bgcolor: isDarkTheme ? '#242628' : '#ffffff',
            borderTop: isDarkTheme ? '1px solid #3a3a3a' : '1px solid #e0e0e0',
            p: 2,
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  )
}
