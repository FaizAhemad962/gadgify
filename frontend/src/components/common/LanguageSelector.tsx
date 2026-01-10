import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { Box, TextField, MenuItem, Typography } from '@mui/material'

interface LanguageSelectorProps {
  variant?: 'navbar' | 'auth'
}

const LanguageSelector = ({ variant = 'navbar' }: LanguageSelectorProps) => {
  const { t } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  if (variant === 'auth') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: 600,
            }}
          >
            {t('nav.language')}:
          </Typography>
          <TextField
            select
            size="small"
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            sx={{
              width: 120,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  borderColor: '#ff9800',
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                  borderColor: '#ff9800',
                  boxShadow: '0 0 0 3px rgba(255, 152, 0, 0.1)',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
              },
              '& .MuiOutlinedInput-input': {
                color: '#1976d2',
                fontWeight: 600,
              },
            }}
          >
            <MenuItem value="en">{t('nav.languages.en')}</MenuItem>
            <MenuItem value="mr">{t('nav.languages.mr')}</MenuItem>
            <MenuItem value="hi">{t('nav.languages.hi')}</MenuItem>
          </TextField>
        </Box>
      </Box>
    )
  }

  // Navbar variant
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
      <Typography
        variant="body2"
        sx={{
          color: 'white',
          fontWeight: 600,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {t('nav.language')}:
      </Typography>
      <TextField
        select
        size="small"
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        sx={{
          minWidth: { xs: 80, sm: 120 },
          '& .MuiOutlinedInput-root': {
            color: 'white',
            fontWeight: 600,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 1,
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.9)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ff9800',
            },
          },
          '& .MuiSvgIcon-root': {
            color: 'white',
          },
        }}
      >
        <MenuItem value="en" sx={{ fontWeight: 600 }}>
          {t('nav.languages.en')}
        </MenuItem>
        <MenuItem value="mr" sx={{ fontWeight: 600 }}>
          {t('nav.languages.mr')}
        </MenuItem>
        <MenuItem value="hi" sx={{ fontWeight: 600 }}>
          {t('nav.languages.hi')}
        </MenuItem>
      </TextField>
    </Box>
  )
}

export default LanguageSelector
