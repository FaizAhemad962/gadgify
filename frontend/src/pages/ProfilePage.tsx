import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  MenuItem,
  IconButton,
  Avatar,
  Badge,
} from '@mui/material'
import { ArrowBack, Edit, Save, Cancel, CameraAlt } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { getMaharashtraCities, getCurrentCityLabel, findCityKey } from '../constants/location'
import { authApi } from '../api/auth'

const ProfilePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get cities - will update when language changes
  const MAHARASHTRA_CITIES = getMaharashtraCities()

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    state: user?.state || '',
    city: user?.city || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
  })

  // Get current language label for the city
  const currentCityLabel = getCurrentCityLabel(formData.city)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      state: user?.state || '',
      city: user?.city || '',
      address: user?.address || '',
      pincode: user?.pincode || '',
    })
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      // Validation
      if (!formData.name.trim()) {
        setError(t('common.nameRequired'))
        return
      }

      if (!formData.phone.trim()) {
        setError(t('common.phoneRequired'))
        return
      }

      if (!/^\d{10}$/.test(formData.phone)) {
        setError(t('common.invalidPhone'))
        return
      }

      if (!formData.city.trim()) {
        setError(t('common.cityRequired'))
        return
      }

      if (!formData.address.trim()) {
        setError(t('common.addressRequired'))
        return
      }

      if (!/^\d{6}$/.test(formData.pincode)) {
        setError(t('common.invalidPincode'))
        return
      }

      // Find the city key from the translated label
      const cityKey = findCityKey(formData.city)
      const cityValue = cityKey || formData.city

      // Make API call to update profile
      const response = await authApi.updateProfile({
        name: formData.name,
        phone: formData.phone,
        city: cityValue,
        address: formData.address,
        pincode: formData.pincode,
      })

      setSuccess(t('common.profileUpdateSuccess'))
      setIsEditing(false)

      // Update user in context
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        // Force page reload to update context
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('errors.somethingWrong'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('errors.invalidFileType'))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('errors.fileTooLarge'))
      return
    }

    try {
      setIsUploadingPhoto(true)
      setError(null)

      const response = await authApi.uploadProfilePhoto(file)

      setSuccess(t('common.profilePhotoUpdated'))

      // Update user in localStorage and reload
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('errors.somethingWrong'))
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  if (!user) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ color: '#1976d2' }}
        >
          {t('common.back')}
        </Button>
        <Typography variant="h4" fontWeight="700" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {t('common.profileTitle')}
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Main Profile Card */}
      <Paper
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 2,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#f9f9f9',
        }}
      >
        {/* User Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'center' },
            justifyContent: { xs: 'center', sm: 'space-between' },
            gap: { xs: 2, sm: 0 },
            mb: 4,
            pb: 3,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  size="small"
                  onClick={handlePhotoClick}
                  sx={{
                    backgroundColor: '#ff9800',
                    color: 'white',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      backgroundColor: '#f57c00',
                    },
                  }}
                >
                  {isUploadingPhoto ? (
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                  ) : (
                    <CameraAlt sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              }
            >
              <Avatar
                src={user.profilePhoto}
                alt={user.name}
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  fontWeight: 700,
                  backgroundColor: '#1976d2',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {!user.profilePhoto && user.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <Box>
              <Typography variant="h6" fontWeight="700">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Chip
                label={user.role === 'ADMIN' ? '⚙️ ' + t('common.profileRoleAdmin') : '👤 ' + t('common.profileRoleUser')}
                size="small"
                sx={{
                  mt: 1,
                  backgroundColor: user.role === 'ADMIN' ? '#ff9800' : '#1976d2',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
          <Button
            variant={isEditing ? 'outlined' : 'contained'}
            startIcon={isEditing ? <Cancel /> : <Edit />}
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isEditing ? t('common.cancel') : t('common.edit')}
          </Button>
        </Box>

        {/* Form Section */}
        <Box>
          <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
            {t('common.profilePersonalInfo')}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            {/* Name and Email Row */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label={t('auth.name')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? 'outlined' : 'filled'}
                sx={{
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: '250px',
                  '& .MuiFilledInput-root': {
                    backgroundColor: '#fafafa',
                  },
                }}
              />
              <TextField
                label={t('auth.email')}
                name="email"
                type="email"
                value={formData.email}
                disabled
                variant="filled"
                helperText={isEditing ? t('common.emailUpdateInfo') : ''}
                sx={{
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: '250px',
                  '& .MuiFilledInput-root': {
                    backgroundColor: '#fafafa',
                    cursor: 'not-allowed',
                    '&:hover': {
                      backgroundColor: '#fafafa',
                    },
                  },
                  '& .Mui-disabled': {
                    cursor: 'not-allowed',
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                  },
                }}
              />
            </Box>

            {/* Phone and State Row */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label={t('auth.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? 'outlined' : 'filled'}
                placeholder={t('common.tenDigitNumber')}
                sx={{
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: '250px',
                  '& .MuiFilledInput-root': {
                    backgroundColor: '#fafafa',
                  },
                }}
              />
              <TextField
                label={t('auth.state')}
                name="state"
                value={t('states.maharashtra')}
                disabled
                variant="filled"
                sx={{
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: '250px',
                  '& .MuiFilledInput-root': {
                    backgroundColor: '#fafafa',
                    cursor: 'not-allowed',
                    '&:hover': {
                      backgroundColor: '#fafafa',
                    },
                  },
                  '& .Mui-disabled': {
                    cursor: 'not-allowed',
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                  },
                }}
              />
            </Box>

            {/* City and Pincode Row */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                select
                label={t('auth.city')}
                name="city"
                value={currentCityLabel}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? 'outlined' : 'filled'}
                SelectProps={{
                  native: false,
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  },
                }}
                sx={{
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: '250px',
                  '& .MuiFilledInput-root': {
                    backgroundColor: '#fafafa',
                  },
                }}
              >
                {MAHARASHTRA_CITIES.map((city) => (
                  <MenuItem key={city.key} value={city.label}>
                    {city.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label={t('auth.pincode')}
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? 'outlined' : 'filled'}
                placeholder={t('common.sixDigitCode')}
                sx={{
                  flex: '1 1 calc(50% - 8px)',
                  minWidth: '250px',
                  '& .MuiFilledInput-root': {
                    backgroundColor: '#fafafa',
                  },
                }}
              />
            </Box>

            {/* Address Row */}
            <TextField
              label={t('auth.address')}
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              variant={isEditing ? 'outlined' : 'filled'}
              multiline
              rows={3}
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: '#fafafa',
                },
              }}
            />
          </Box>

          {/* Action Buttons */}
          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isLoading}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={isLoading}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isLoading ? <CircularProgress size={24} /> : t('common.save')}
              </Button>
            </Box>
          )}
        </Box>

        {/* Account Section */}
        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
            {t('common.profileAccountSettings')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="warning"
              onClick={() => navigate('/change-password')}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('common.profileChangePassword')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (window.confirm(t('common.profileConfirmLogout'))) {
                  logout()
                  navigate('/login')
                }
              }}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('nav.logout')}
            </Button>
          </Box>
        </Box>

        {/* Account Info */}
        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>{t('common.profileAccountCreated')}:</strong>{' '}
            {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>{t('common.profileUserID')}:</strong> {user.id}
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default ProfilePage
