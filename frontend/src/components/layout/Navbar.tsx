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
  useMediaQuery,
  Stack,
} from '@mui/material'
import LanguageIcon from "@mui/icons-material/Language";

import BrandIcon from '../../assets/brand-icon.png'

import {
  Menu as MenuIcon,
  ShoppingCart,
  AccountCircle,
  Favorite,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import LanguageSelector from '../common/LanguageSelector'
import { theme } from '@/theme/theme'
import { AppDrawer, type DrawerItem } from '../ui/Drawer'

const Navbar = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, logout, user } = useAuth()
  const { itemCount } = useCart()
  const { wishlistItems } = useWishlist();
  // check width using mui breakpoints
 const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)

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
  
const drawerItems: DrawerItem[] = [
  {
    id: 'home',
    label: t('nav.home'),
    icon: '🏠',
    position: 'center',
    onClick: () => navigate('/'),
  } satisfies DrawerItem,

  ...(isAdmin
    ? [
        {
          id: 'admin',
          label: 'Dashboard',
          icon: '⚙️',
          position: 'center',
          onClick: () => navigate('/admin'),
        } satisfies DrawerItem,
      ]
    : []),

  {
    id: 'products',
    label: t('nav.products'),
    icon: '📱',
    position: 'center',
    onClick: () => navigate('/products'),
  } satisfies DrawerItem,

  ...(isAuthenticated
    ? [
        {
          id: 'orders',
          label: 'My Orders',
          icon: '📦',
          position: 'center',
          onClick: () => navigate('/orders'),
        } satisfies DrawerItem,
      ]
    : []),

  ...(isAuthenticated
    ? [
        {
          id: 'wishlist',
          label: 'My Wishlist',
          icon: (
            <Favorite
              color="error"
              sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }}
            />
          ),
          position: 'center',
          onClick: () => navigate('/wishlist'),
        } satisfies DrawerItem,
      ]
    : []),

  ...(isAuthenticated
    ? [
        {
          id: 'cart',
          label: 'My Cart',
          icon: (
            <ShoppingCart
              color="success"
              sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }}
            />
          ),
          position: 'center',
          onClick: () => navigate('/cart'),
        } satisfies DrawerItem,
      ]
    : []),
];



  return (
    <AppBar 
      position="sticky"
      sx={{
        background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1100,
        ...(isMobile ? { padding: '8px' } : {}),
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
              display: { xs: 'none', md: 'flex',alignItems:'center' },
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
             <img alt='gadgify' style={{width:'80px', height:'100px'}} src={BrandIcon} />  {t('app.title')}
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            
      <AppDrawer endContent = {<Stack  px={2} direction={"row"} alignItems={'center'}><LanguageIcon sx={{ fontSize: '1.2rem' }} /> <LanguageSelector /></Stack>} items={drawerItems} brand={{ icon:  <img alt='gadgify' style={{width:'80px', height:'100px'}} src={BrandIcon} />  , title: 'Gadgify', onClick: () => navigate('/') }} trigger ={<IconButton
              size="small"
              aria-label="menu"
            >
              <MenuIcon sx={{ fontSize: '1.5rem' ,color:'white'}} />
            </IconButton>} />

            <Menu
            disableScrollLock
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
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
              visibility: { xs: 'hidden', md: 'hidden' },
              // display: { xs: 'none', md: 'none',alignItems:'center' },
              flexGrow: 1,
              fontWeight: 900,
              fontSize: '1.2rem',
              color: 'inherit',
              textDecoration: 'none',
              letterSpacing: '0.5px',
            }}
          >
            <img alt='gadgify' style={{width:'80px', height:'30px'}} src={BrandIcon} /> 
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
          <Box sx={{display: { xs: 'none', md: 'flex' }}}>
            <LanguageSelector  color='white' bgcolor='' />
          </Box>

          {/* Wishlist icon */}
          {isAuthenticated && (
            <IconButton
              size="small"
              onClick={() => navigate('/wishlist')}
              color="inherit"
              sx={{ 
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'scale(1.1)',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Badge badgeContent={wishlistItems.length} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.65rem' } }}>
                <Favorite sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }} />
              </Badge>
            </IconButton>
          )}

          {/* Cart icon */}
          {isAuthenticated && (
            <IconButton
              size="small"
              onClick={() => navigate('/cart')}
              color="inherit"
              sx={{  
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
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <AccountCircle sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }} />
              </IconButton>
              <Menu
              disableScrollLock
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
