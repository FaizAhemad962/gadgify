import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
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
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ShoppingCart,
  AccountCircle,
  KeyboardArrowDown,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { productsApi } from '../../api/products'
import type { Product } from '../../types'
import LazyImage from '../common/LazyImage'
import { StarRating } from '../common/StarRating'

const CATEGORIES = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Smartwatches',
  'Headphones',
  'Cameras',
  'Gaming',
  'Accessories',
  'Home Appliances',
  'Audio',
  'Wearables',
]

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, logout, user } = useAuth()
  const { itemCount } = useCart()

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null)
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  // Get categories that have products
  const availableCategories = CATEGORIES.filter(cat => productsByCategory[cat]?.length > 0)

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
            <Box
              sx={{ position: 'relative' }}
              onMouseEnter={() => {
                setShowMegaMenu(true)
                setSelectedCategory(availableCategories[0] || null)
              }}
              onMouseLeave={() => {
                setShowMegaMenu(false)
                setSelectedCategory(null)
              }}
            >
              <Button
                onClick={() => navigate('/products')}
                endIcon={<KeyboardArrowDown />}
                sx={{ my: 2, color: 'white', display: 'flex' }}
              >
                {t('nav.products')}
              </Button>
              
              {/* Mega Menu */}
              {showMegaMenu && (
                <Paper
                  sx={{
                    position: 'fixed',
                    top: 64,
                    left: 0,
                    right: 0,
                    width: '100vw',
                    boxShadow: 3,
                    zIndex: 1300,
                    display: 'flex',
                    maxHeight: '70vh',
                  }}
                >
                  {/* Categories Sidebar */}
                  <Box
                    sx={{
                      width: 250,
                      borderRight: 1,
                      borderColor: 'divider',
                      bgcolor: 'grey.50',
                      overflowY: 'auto',
                      py: 2,
                    }}
                  >
                    {availableCategories.map((category) => (
                      <Box
                        key={category}
                        sx={{
                          px: 3,
                          py: 1.5,
                          cursor: 'pointer',
                          bgcolor: selectedCategory === category ? 'primary.main' : 'transparent',
                          color: selectedCategory === category ? 'white' : 'text.primary',
                          '&:hover': {
                            bgcolor: selectedCategory === category ? 'primary.dark' : 'grey.200',
                          },
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                        onMouseEnter={() => setSelectedCategory(category)}
                        onClick={() => {
                          setShowMegaMenu(false)
                          navigate(`/products?category=${category}`)
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {t(`categories.${category}`)}
                        </Typography>
                        <Typography variant="caption">
                          ({productsByCategory[category]?.length || 0})
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Products Display */}
                  <Box
                    sx={{
                      flex: 1,
                      p: 3,
                      overflowY: 'auto',
                    }}
                  >
                    {selectedCategory && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {t(`categories.${selectedCategory}`)}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setShowMegaMenu(false)
                              navigate(`/products?category=${selectedCategory}`)
                            }}
                          >
                            View All ({productsByCategory[selectedCategory]?.length || 0})
                          </Button>
                        </Box>
                        
                        <Grid container spacing={2}>
                          {(productsByCategory[selectedCategory] || []).slice(0, 8).map((product) => (
                            <Grid item xs={12} sm={6} md={3} key={product.id}>
                              <Card
                                sx={{
                                  cursor: 'pointer',
                                  height: '100%',
                                  '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-4px)',
                                    transition: 'all 0.2s',
                                  },
                                }}
                                onClick={() => {
                                  setShowMegaMenu(false)
                                  navigate(`/products/${product.id}`)
                                }}
                              >
                                <LazyImage
                                  src={product.imageUrl}
                                  alt={product.name}
                                  height={140}
                                  objectFit="cover"
                                />
                                <CardContent sx={{ p: 2 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 500,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      minHeight: 40,
                                      mb: 1,
                                    }}
                                  >
                                    {product.name}
                                  </Typography>
                                  {product.totalRatings && product.totalRatings > 0 ? (
                                    <Box sx={{ mb: 1 }}>
                                      <StarRating
                                        rating={product.averageRating || 0}
                                        totalRatings={product.totalRatings}
                                        size="small"
                                      />
                                    </Box>
                                  ) : null}
                                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                    ₹{product.price.toLocaleString()}
                                  </Typography>
                                  {product.stock > 0 ? (
                                    <Typography variant="caption" color="success.main">
                                      In Stock
                                    </Typography>
                                  ) : (
                                    <Typography variant="caption" color="error">
                                      Out of Stock
                                    </Typography>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>
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
