import { Button, type ButtonProps, CircularProgress, Box } from '@mui/material'

interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean
  fullWidth?: boolean
}

export const CustomButton = ({ isLoading = false, disabled = false, children, ...props }: CustomButtonProps) => {
  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      sx={{
        textTransform: 'none',
        fontWeight: '600',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        ...props.sx,
      }}
    >
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} sx={{ color: 'inherit' }} />
          {children}
        </Box>
      ) : (
        children
      )}
    </Button>
  )
}
