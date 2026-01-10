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
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ShoppingCart,
  AccountCircle,
  Search,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import LanguageSelector from '../common/LanguageSelector'

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

  return (
    <AppBar 
      position="sticky"
      sx={{
        background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 0.5, sm: 2 } }}>
        <Toolbar disableGutters sx={{ 
          minHeight: { xs: 56, md: 64 }, 
          gap: { xs: 0.5, md: 1 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
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
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="small"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{ p: 0.5, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
            >
              <MenuIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
              PaperProps={{
                sx: { 
                  mt: 0.5,
                  minWidth: 200,
                  borderRadius: 1.5,
                  zIndex: 1301,
                }
              }}
            >
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/') }} sx={{ py: 1.2 }}>
                <Typography textAlign="center" sx={{ fontWeight: 600 }}>🏠 {t('nav.home')}</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/products') }} sx={{ py: 1.2 }}>
                <Typography textAlign="center" sx={{ fontWeight: 600 }}>📱 {t('nav.products')}</Typography>
              </MenuItem>
              {isAuthenticated && (
                <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/orders') }} sx={{ py: 1.2 }}>
                  <Typography textAlign="center" sx={{ fontWeight: 600 }}>📦 {t('nav.orders')}</Typography>
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/admin') }} sx={{ py: 1.2, color: '#ff9800' }}>
                  <Typography textAlign="center" sx={{ fontWeight: 700 }}>⚙️ {t('nav.admin')}</Typography>
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
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 900,
              fontSize: '1.2rem',
              color: 'inherit',
              textDecoration: 'none',
              letterSpacing: '0.5px',
            }}
          >
            🛍️ Gadgify
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

          {/* Language selector */}
          <LanguageSelector variant="navbar" />

          {/* Cart icon */}
          {isAuthenticated && (
            <IconButton
              size="small"
              onClick={() => navigate('/cart')}
              color="inherit"
              sx={{  mr: 2,
                p: 0.5,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.1)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Badge badgeContent={itemCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.65rem' } }}>
                <ShoppingCart sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }} />
              </Badge>
            </IconButton>
          )}

          {/* User menu */}
          {isAuthenticated ? (
            <Box>
              <IconButton
                size="small"
                onClick={handleOpenUserMenu}
                color="inherit"
                sx={{
                  p: 0.5,
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <AccountCircle sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }} />
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
                    mt: 0.5,
                    zIndex: 1301,
                  }
                }}
              >
                <MenuItem disabled sx={{ bgcolor: '#f5f5f5' }}>
                  <Typography textAlign="center" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>👤 {user?.name}</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile') }} sx={{ fontWeight: 600, py: 1 }}>
                  <Typography textAlign="center" sx={{ fontSize: '0.9rem' }}>👁️ {t('nav.profile')}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ fontWeight: 600, color: '#d32f2f', py: 1 }}>
                  <Typography textAlign="center" sx={{ fontSize: '0.9rem' }}>🚪 {t('nav.logout')}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, alignItems: 'center' }}>
              <Button
                onClick={() => navigate('/login')}
                size="small"
                sx={{ 
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', md: '1rem' },
                  px: { xs: 0.75, md: 1.5 },
                  py: { xs: 0.5, md: 1 },
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
                size="small"
                sx={{ 
                  color: 'white',
                  bgcolor: '#ff9800',
                  fontWeight: 700,
                  fontSize: { xs: '0.75rem', md: '1rem' },
                  borderRadius: 1,
                  px: { xs: 0.75, md: 2 },
                  py: { xs: 0.5, md: 1 },
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
