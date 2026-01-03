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
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {t('app.title')}
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              color="inherit"
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
                <Typography textAlign="center">{t('nav.home')}</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/products') }}>
                <Typography textAlign="center">{t('nav.products')}</Typography>
              </MenuItem>
              {isAuthenticated && (
                <MenuItem onClick={() => { handleCloseNavMenu(); navigate('/orders') }}>
                  <Typography textAlign="center">{t('nav.orders')}</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Mobile logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            {t('app.title')}
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              onClick={() => navigate('/')}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              {t('nav.home')}
            </Button>
            <Button
              onClick={() => navigate('/products')}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              {t('nav.products')}
            </Button>
            {isAuthenticated && (
              <Button
                onClick={() => navigate('/orders')}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {t('nav.orders')}
              </Button>
            )}
            {isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {t('nav.admin')}
              </Button>
            )}
          </Box>

          {/* Language selector */}
          <FormControl size="small" sx={{ mr: 2, minWidth: 70 }}>
            <Select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '.MuiSvgIcon-root': { color: 'white' },
              }}
            >
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="mr">मर</MenuItem>
              <MenuItem value="hi">हि</MenuItem>
            </Select>
          </FormControl>

          {/* Cart icon */}
          {isAuthenticated && (
            <IconButton
              size="large"
              onClick={() => navigate('/cart')}
              color="inherit"
              sx={{ mr: 2 }}
            >
              <Badge badgeContent={itemCount} color="error">
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
              >
                <MenuItem disabled>
                  <Typography textAlign="center">{user?.name}</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/orders') }}>
                  <Typography textAlign="center">{t('nav.orders')}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">{t('nav.logout')}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              <Button
                onClick={() => navigate('/login')}
                sx={{ color: 'white' }}
              >
                {t('nav.login')}
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                sx={{ color: 'white' }}
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
