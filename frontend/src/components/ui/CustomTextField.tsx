import { TextField, type TextFieldProps } from '@mui/material'

interface CustomTextFieldProps extends TextFieldProps {
  isDarkTheme?: boolean
}

export const CustomTextField = ({ isDarkTheme = true, ...props }: CustomTextFieldProps) => {
  const darkThemeStyles = isDarkTheme ? {
    '& .MuiOutlinedInput-root': {
      color: '#b0b0b0',
      bgcolor: '#242628',
      '& fieldset': { borderColor: '#3a3a3a' },
      '&:hover fieldset': { borderColor: '#1976d2' },
      '&.Mui-focused fieldset': { borderColor: '#1976d2' },
    },
    '& .MuiInputBase-input::placeholder': { color: '#707070', opacity: 1 },
    '& .MuiInputLabel-root': { color: '#b0b0b0', '&.Mui-focused': { color: '#1976d2' } },
    '& .MuiFormHelperText-root': { color: '#707070' },
  } : {}

  return (
    <TextField
      {...props}
      sx={{
        ...darkThemeStyles,
        ...props.sx,
      }}
    />
  )
}
