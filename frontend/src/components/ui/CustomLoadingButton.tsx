import { Button, CircularProgress, type ButtonProps } from '@mui/material'

type CustomLoadingButtonProps = ButtonProps & {
  isLoading?: boolean
}

export const CustomLoadingButton = ({
  isLoading = false,
  disabled = false,
  children,
  ...props
}: CustomLoadingButtonProps) => {
  const loading = isLoading

  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : props.startIcon}
      sx={{
        textTransform: 'none',
        fontWeight: '600',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...props.sx,
      }}
    >
      {children}
    </Button>
  )
}
