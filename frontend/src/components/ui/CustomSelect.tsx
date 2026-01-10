import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectProps,
  type FormControlProps,
} from '@mui/material'

interface CustomSelectProps extends Omit<SelectProps, 'children'> {
  label: string
  options: { value: string | number; label: string }[]
  isDarkTheme?: boolean
  formControlProps?: Partial<FormControlProps>
}

export const CustomSelect = ({
  label,
  options,
  isDarkTheme = true,
  formControlProps,
  ...props
}: CustomSelectProps) => {
  return (
    <FormControl fullWidth {...formControlProps}>
      <InputLabel sx={{ color: isDarkTheme ? '#b0b0b0' : '#000000' }}>
        {label}
      </InputLabel>
      <Select
        label={label}
        {...props}
        sx={{
          color: isDarkTheme ? '#b0b0b0' : '#000000',
          bgcolor: isDarkTheme ? '#242628' : '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDarkTheme ? '#3a3a3a' : '#e0e0e0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
          },
          '.MuiSvgIcon-root': { color: isDarkTheme ? '#b0b0b0' : '#000000' },
          ...props.sx,
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: isDarkTheme ? '#1e1e1e' : '#ffffff',
              border: isDarkTheme ? '1px solid #3a3a3a' : '1px solid #e0e0e0',
              boxShadow: isDarkTheme
                ? '0 4px 16px rgba(0, 0, 0, 0.4)'
                : '0 4px 16px rgba(0, 0, 0, 0.1)',
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              bgcolor: isDarkTheme ? '#1e1e1e' : '#ffffff',
              color: isDarkTheme ? '#b0b0b0' : '#000000',
              fontSize: '0.875rem',
              py: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: isDarkTheme ? '#1976d2' : '#e3f2fd',
                color: isDarkTheme ? '#fff' : '#1976d2',
              },
              '&.Mui-selected': {
                bgcolor: isDarkTheme ? '#1565c0' : '#bbdefb',
                color: isDarkTheme ? '#fff' : '#1976d2',
                fontWeight: '600',
                '&:hover': {
                  bgcolor: isDarkTheme ? '#0d47a1' : '#90caf9',
                },
              },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
