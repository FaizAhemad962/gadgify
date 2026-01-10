import { LoadingButton, LoadingButtonProps } from '@mui/lab'

interface CustomLoadingButtonProps extends LoadingButtonProps {
  isLoading?: boolean
}

export const CustomLoadingButton = ({ 
  isLoading = false, 
  loading = isLoading,
  disabled = false, 
  children, 
  ...props 
}: CustomLoadingButtonProps) => {
  return (
    <LoadingButton
      {...props}
      loading={loading}
      disabled={disabled || loading}
      sx={{
        textTransform: 'none',
        fontWeight: '600',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ...props.sx,
      }}
    >
      {children}
    </LoadingButton>
  )
}
