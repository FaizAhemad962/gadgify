import { Alert, type AlertProps } from '@mui/material'

interface CustomAlertProps extends AlertProps {
  isDarkTheme?: boolean
}

export const CustomAlert = ({ isDarkTheme = true, ...props }: CustomAlertProps) => {
  const darkThemeStyles = isDarkTheme && props.severity === 'error' ? {
    bgcolor: 'rgba(244, 67, 54, 0.1)',
    color: '#ef5350',
    border: '1px solid rgba(244, 67, 54, 0.3)',
  } : isDarkTheme && props.severity === 'success' ? {
    bgcolor: 'rgba(76, 175, 80, 0.1)',
    color: '#81c784',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  } : isDarkTheme && props.severity === 'warning' ? {
    bgcolor: 'rgba(255, 152, 0, 0.1)',
    color: '#ffb74d',
    border: '1px solid rgba(255, 152, 0, 0.3)',
  } : isDarkTheme ? {
    bgcolor: 'rgba(33, 150, 243, 0.1)',
    color: '#64b5f6',
    border: '1px solid rgba(33, 150, 243, 0.3)',
  } : {}

  return (
    <Alert
      {...props}
      sx={{
        ...darkThemeStyles,
        ...props.sx,
      }}
    />
  )
}
