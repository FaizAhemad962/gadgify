import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { authApi } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { getMaharashtraCities } from '../../constants/location'
import LanguageSelector from '../../components/common/LanguageSelector'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

const SignupPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const MAHARASHTRA_CITIES = getMaharashtraCities()
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      state: t('states.maharashtra'),
    },
  })

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      login(data.token, data.user)
      navigate('/')
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || t('errors.somethingWrong'))
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    // Validate Maharashtra only
    if (data.state.toLowerCase() !== 'maharashtra') {
      setError(t('errors.maharashtraOnly'))
      return
    }

    setError('')
    const { confirmPassword, ...signupData } = data
    try {
      await signupMutation.mutateAsync(signupData)
    } catch (err: any) {
      // Error is handled in onError callback
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          top: '-100px',
          right: '-100px',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          bottom: '-50px',
          left: '-50px',
        },
      }}
    >
      {/* Language Selector */}
      <LanguageSelector variant="auth" />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            background: '#ffffff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: '#1976d2',
                mb: 1,
                fontSize: { xs: '2rem', sm: '2.5rem' },
              }}
            >
              🛍️
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
                mb: 1,
              }}
            >
              {t('auth.signup')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#707070',
                fontSize: '0.95rem',
              }}
            >
              {t('common.availableOnly')}
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                background: '#ffebee',
                color: '#c62828',
                border: '1px solid #ef5350',
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  color: '#c62828',
                },
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(onSubmit)(e)
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Name */}
              <TextField
                fullWidth
                label={t('auth.name')}
                size="small"
                placeholder={t('common.enterFullName')}
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f9f9f9',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                }}
              />

              {/* Email & Phone */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label={t('auth.email')}
                  type="email"
                  size="small"
                  placeholder={t('common.emailPlaceholder')}
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9f9f9',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label={t('auth.phone')}
                  size="small"
                  placeholder={t('common.tenDigitNumber')}
                  {...register('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9f9f9',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  }}
                />
              </Box>

              {/* Password & Confirm Password */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  size="small"
                  placeholder={t('common.minSixCharacters')}
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: '#707070',
                            '&:hover': {
                              color: '#1976d2',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9f9f9',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label={t('auth.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  size="small"
                  placeholder={t('common.reEnterPassword')}
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: '#707070',
                            '&:hover': {
                              color: '#1976d2',
                            },
                          }}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9f9f9',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  }}
                />
              </Box>

              {/* Address */}
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t('auth.address')}
                size="small"
                placeholder={t('common.streetAddress')}
                {...register('address')}
                error={!!errors.address}
                helperText={errors.address?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f9f9f9',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                      borderColor: '#1976d2',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                }}
              />

              {/* State, City, Pincode */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label={t('auth.state')}
                  size="small"
                  {...register('state')}
                  error={!!errors.state}
                  helperText={errors.state?.message || t('common.mustBeMaharashtra')}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f0f0f0',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  select
                  label={t('auth.city')}
                  size="small"
                  {...register('city')}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                  SelectProps={{
                    displayEmpty: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9f9f9',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {t('common.selectCity')}
                  </MenuItem>
                  {MAHARASHTRA_CITIES.map((city) => (
                    <MenuItem key={city.key} value={city.label}>
                      {city.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  label={t('auth.pincode')}
                  size="small"
                  placeholder={t('common.sixDigitCode')}
                  {...register('pincode')}
                  error={!!errors.pincode}
                  helperText={errors.pincode?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f9f9f9',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        borderColor: '#1976d2',
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  }}
                />
              </Box>

              {/* Submit Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={signupMutation.isPending}
                sx={{
                  background: '#ff9800',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 1.5,
                  mt: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: '#f57c00',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(255, 152, 0, 0.3)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    background: '#ccc',
                    color: '#666',
                  },
                }}
              >
                {signupMutation.isPending ? (
                  <>
                    <Typography variant="body2" component="span">
                      {t('common.creatingAccount')}...
                    </Typography>
                  </>
                ) : (
                  `✨ ${t('auth.signupButton')}`
                )}
              </Button>
            </Box>

            {/* Divider */}
            <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
              <Typography variant="caption" sx={{ color: '#a0a0a0' }}>
                {t('common.or')}
              </Typography>
              <Box sx={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            </Box>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#707070', mb: 1 }}>
                {t('auth.alreadyHaveAccount')}
              </Typography>
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: '#ff9800',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#f57c00',
                    textDecoration: 'underline',
                  },
                }}
              >
                {t('auth.login')} →
              </Link>
            </Box>
          </form>

          {/* Trust Section */}
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography sx={{ fontSize: '1.2rem', mb: 0.5 }}>📍</Typography>
              <Typography variant="caption" sx={{ color: '#707070', fontSize: '0.75rem' }}>
                {t('common.maharashtra')}
              </Typography>
            </Box>
            <Box sx={{ width: '1px', height: '30px', background: '#e0e0e0' }} />
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography sx={{ fontSize: '1.2rem', mb: 0.5 }}>🔒</Typography>
              <Typography variant="caption" sx={{ color: '#707070', fontSize: '0.75rem' }}>
                {t('common.secure')}
              </Typography>
            </Box>
            <Box sx={{ width: '1px', height: '30px', background: '#e0e0e0' }} />
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography sx={{ fontSize: '1.2rem', mb: 0.5 }}>✓</Typography>
              <Typography variant="caption" sx={{ color: '#707070', fontSize: '0.75rem' }}>
                {t('common.verified')}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default SignupPage
