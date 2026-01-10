import { Chip, type ChipProps } from '@mui/material'

interface CustomChipProps extends ChipProps {
  isDarkTheme?: boolean
}

export const CustomChip = ({ isDarkTheme = true, ...props }: CustomChipProps) => {
  return (
    <Chip
      {...props}
      sx={{
        bgcolor: isDarkTheme ? '#1976d2' : '#e3f2fd',
        color: isDarkTheme ? '#fff' : '#1976d2',
        ...props.sx,
      }}
    />
  )
}
