import { CircularProgress, type ButtonProps } from '@/mui/material'
import { CustomButton, type CustomButtonVariant } from './CustomButton'

type CustomLoadingButtonProps = ButtonProps & {
  isLoading?: boolean
  appVariant?: CustomButtonVariant
}

export const CustomLoadingButton = ({
  isLoading = false,
  disabled = false,
  children,
  ...props
}: CustomLoadingButtonProps) => {
  const loading = isLoading

  return (
    <CustomButton
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : props.startIcon}
      sx={{
        ...props.sx,
      }}
    >
      {children}
    </CustomButton>
  )
}
