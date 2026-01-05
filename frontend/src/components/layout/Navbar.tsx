import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Button,
  Badge,
  Select,
  FormControl,
  TextField,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ShoppingCart,
  AccountCircle,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, logout, user } = useAuth()
  const { itemCount } = useCart()

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleLogout = () => {
    logout()
    handleCloseUserMenu()
    navigate('/login')
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <AppBar 
      position="sticky"
      sx={{
        background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 3,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 900,
              fontSize: '1.5rem',
              color: 'inherit',
              textDecoration: 'none',
              letterSpacing: '0.5px',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            🛍️ {t('app.title')}
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/') }}>
                <Typography textAlign="center" sx={{ fontWeight: 600 }}>🏠 {t('nav.home')}</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/products') }}>
                <Typography textAlign="center" sx={{ fontWeight: 600 }}>📱 {t('nav.products')}</Typography>
              </MenuItem>
              {isAuthenticated && (
                <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/orders') }}>
                  <Typography textAlign="center" sx={{ fontWeight: 600 }}>📦 {t('nav.orders')}</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Logo - Mobile */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 900,
              fontSize: '1.3rem',
              color: 'inherit',
              textDecoration: 'none',
              letterSpacing: '0.5px',
            }}
          >
            🛍️ {t('app.title')}
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            <Button
              onClick={() => navigate('/')}
              sx={{ 
                py: 2, 
                color: 'white', 
                display: 'block',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.3s',
                position: 'relative',
                '&:hover': { 
                  color: '#fff',
                  '&::after': {
                    width: '100%',
                  }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 10,
                  left: 0,
                  width: 0,
                  height: 3,
                  bgcolor: '#ff9800',
                  borderRadius: '2px',
                  transition: 'width 0.3s',
                }
              }}
            >
              {t('nav.home')}
            </Button>
            <Button
              onClick={() => navigate('/products')}
              sx={{ 
                py: 2, 
                color: 'white', 
                display: 'block',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.3s',
                position: 'relative',
                '&:hover': { 
                  color: '#fff',
                  '&::after': {
                    width: '100%',
                  }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 10,
                  left: 0,
                  width: 0,
                  height: 3,
                  bgcolor: '#ff9800',
                  borderRadius: '2px',
                  transition: 'width 0.3s',
                }
              }}
            >
              {t('nav.products')}
            </Button>
            {isAuthenticated && (
              <Button
                onClick={() => navigate('/orders')}
                sx={{ 
                  py: 2, 
                  color: 'white', 
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  position: 'relative',
                  '&:hover': { 
                    color: '#fff',
                    '&::after': {
                      width: '100%',
                    }
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 10,
                    left: 0,
                    width: 0,
                    height: 3,
                    bgcolor: '#ff9800',
                    borderRadius: '2px',
                    transition: 'width 0.3s',
                  }
                }}
              >
                {t('nav.orders')}
              </Button>
            )}
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                sx={{ 
                  py: 2, 
                  color: '#ff9800', 
                  display: 'block',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    color: '#fff',
                    bgcolor: 'rgba(255, 152, 0, 0.2)',
                  }
                }}
              >
                ⚙️ {t('nav.admin')}
              </Button>
            )}
          </Box>

          {/* Search Bar */}
          <TextField
            placeholder={t('products.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                navigate(`/products?search=${searchQuery}`)
              }
            }}
            variant="outlined"
            size="small"
            sx={{
              width: { xs: '100%', md: 280 },
              mr: { xs: 0, md: 2 },
              mb: { xs: 2, md: 0 },
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 1.5,
              '& .MuiOutlinedInput-root': {
                color: '#333',
                fontWeight: 500,
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: '#ff9800',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff9800',
                  borderWidth: 2,
                },
              },
              '& .MuiOutlinedInput-input::placeholder': {
                color: 'rgba(0, 0, 0, 0.5)',
                opacity: 1,
              },
            }}
          />

          {/* Language selector */}
          <FormControl size="small" sx={{ mr: 2, minWidth: 60 }}>
            <Select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{
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
                '.MuiSvgIcon-root': { color: 'white' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#ff9800',
                }
              }}
            >
              <MenuItem value="en" sx={{ fontWeight: 600 }}>EN</MenuItem>
              <MenuItem value="mr" sx={{ fontWeight: 600 }}>मर</MenuItem>
              <MenuItem value="hi" sx={{ fontWeight: 600 }}>हि</MenuItem>
            </Select>
          </FormControl>

          {/* Cart icon */}
          {isAuthenticated && (
            <IconButton
              size="large"
              onClick={() => navigate('/cart')}
              color="inherit"
              sx={{ 
                mr: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.1)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Badge badgeContent={itemCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.75rem' } }}>
                <ShoppingCart />
              </Badge>
            </IconButton>
          )}

          {/* User menu */}
          {isAuthenticated ? (
            <Box>
              <IconButton
                size="large"
                onClick={handleOpenUserMenu}
                color="inherit"
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: 1.5,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  }
                }}
              >
                <MenuItem disabled sx={{ bgcolor: '#f5f5f5' }}>
                  <Typography textAlign="center" sx={{ fontWeight: 700, color: 'text.primary' }}>👤 {user?.name}</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/orders') }} sx={{ fontWeight: 600 }}>
                  <Typography textAlign="center">📦 {t('nav.orders')}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ fontWeight: 600, color: '#d32f2f' }}>
                  <Typography textAlign="center">🚪 {t('nav.logout')}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={() => navigate('/login')}
                sx={{ 
                  color: 'white',
                  fontWeight: 700,
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {t('nav.login')}
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                sx={{ 
                  color: 'white',
                  bgcolor: '#ff9800',
                  fontWeight: 700,
                  borderRadius: 1,
                  px: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: '#f57c00',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                {t('nav.signup')}
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar
