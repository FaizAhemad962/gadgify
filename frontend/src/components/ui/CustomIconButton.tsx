import { IconButton, type IconButtonProps } from '@mui/material'

interface CustomIconButtonProps extends IconButtonProps {
  isDarkTheme?: boolean
}

export const CustomIconButton = ({ isDarkTheme = true, ...props }: CustomIconButtonProps) => {
  return (
    <IconButton
      {...props}
      sx={{
        transition: 'all 0.2s',
        ...props.sx,
      }}
    />
  )
}
