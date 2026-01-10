import { Card, type CardProps } from '@mui/material'

interface CustomCardProps extends CardProps {
  isDarkTheme?: boolean
  interactive?: boolean
}

export const CustomCard = ({ 
  isDarkTheme = true, 
  interactive = false, 
  children, 
  ...props 
}: CustomCardProps) => {
  return (
    <Card
      {...props}
      sx={{
        bgcolor: isDarkTheme ? '#242628' : '#ffffff',
        color: isDarkTheme ? '#b0b0b0' : '#000000',
        border: isDarkTheme ? '1px solid #3a3a3a' : '1px solid #e0e0e0',
        borderRadius: '12px',
        transition: interactive ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        ...(interactive && {
          '&:hover': {
            boxShadow: isDarkTheme 
              ? '0 8px 16px rgba(0, 0, 0, 0.3)' 
              : '0 8px 16px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-4px)',
          },
        }),
        ...props.sx,
      }}
    >
      {children}
    </Card>
  )
}
