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

const MAHARASHTRA_CITIES = [
  'Mumbai',
  'Pune',
  'Nagpur',
  'Nashik',
  'Aurangabad',
  'Solapur',
  'Kolhapur',
  'Thane',
  'Navi Mumbai',
  'Other',
]

const SignupPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      state: 'Maharashtra',
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

  const onSubmit = (data: SignupFormData) => {
    // Validate Maharashtra only
    if (data.state.toLowerCase() !== 'maharashtra') {
      setError(t('errors.maharashtraOnly'))
      return
    }

    setError('')
    const { confirmPassword, ...signupData } = data
    signupMutation.mutate(signupData)
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="600">
          {t('auth.signup')}
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          {t('common.availableOnly')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label={t('auth.name')}
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label={t('auth.email')}
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                fullWidth
                label={t('auth.phone')}
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label={t('auth.confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('auth.address')}
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label={t('auth.state')}
                {...register('state')}
                error={!!errors.state}
                helperText={errors.state?.message || t('common.mustBeMaharashtra')}
                InputProps={{
                  readOnly: true,
                }}
              />

              <TextField
                fullWidth
                select
                label={t('auth.city')}
                {...register('city')}
                error={!!errors.city}
                helperText={errors.city?.message}
                SelectProps={{
                  displayEmpty: true,
                }}
              >
                <MenuItem value="" disabled>
                  {t('common.selectCity')}
                </MenuItem>
                {MAHARASHTRA_CITIES.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label={t('auth.pincode')}
                {...register('pincode')}
                error={!!errors.pincode}
                helperText={errors.pincode?.message}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? t('common.creatingAccount') : t('auth.signupButton')}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                {t('auth.login')}
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  )
}

export default SignupPage
