import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  Inventory,
  ShoppingCart,
  ExitToApp,
  Home,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

const drawerWidth = 240
const collapsedWidth = 70

const AdminLayout = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const toggleDrawer = () => {
    setOpen(!open)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { text: t('nav.home'), icon: <Home />, path: '/' },
    { text: t('admin.dashboard'), icon: <Dashboard />, path: '/admin' },
    { text: t('admin.products'), icon: <Inventory />, path: '/admin/products' },
    { text: t('admin.orders'), icon: <ShoppingCart />, path: '/admin/orders' },
  ]

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a1a' }}>
      <Toolbar sx={{ justifyContent: open ? 'space-between' : 'center', bgcolor: '#0f1419', borderBottom: '1px solid #333' }}>
        {open && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #1976d2, #ff9800)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('app.title')}
          </Typography>
        )}
        <IconButton onClick={toggleDrawer} sx={{ color: '#ff9800' }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to={item.path}
              sx={{ 
                justifyContent: open ? 'initial' : 'center', 
                px: 2,
                mx: 1,
                borderRadius: '8px',
                color: '#a0a0a0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#1976d2',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                  transform: 'translateX(4px)'
                },
                '&.active': {
                  bgcolor: '#1976d2',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: '#333', my: 2 }} />
      <List>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton 
            onClick={handleLogout}
            sx={{ 
              justifyContent: open ? 'initial' : 'center', 
              px: 2,
              mx: 1,
              borderRadius: '8px',
              color: '#a0a0a0',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#ff5252',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
                transform: 'translateX(4px)'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }}>
              <ExitToApp />
            </ListItemIcon>
            {open && <ListItemText primary={t('nav.logout')} />}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)` },
          ml: { sm: `${open ? drawerWidth : collapsedWidth}px` },
          transition: 'width 0.3s, margin 0.3s',
          bgcolor: '#1976d2',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {!open && (
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {t('app.title')} - {t('nav.admin')}
            </Typography>
          )}
          {open && <Box sx={{ flexGrow: 1 }} />}
          <FormControl size="small" sx={{ minWidth: 70 }}>
            <Select
              value={i18n.language || 'mr'}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
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
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: open ? drawerWidth : collapsedWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s' }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#1a1a1a',
              borderRight: '1px solid #333',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: open ? drawerWidth : collapsedWidth,
              transition: 'width 0.3s',
              overflowX: 'hidden',
              bgcolor: '#1a1a1a',
              borderRight: '1px solid #333',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : collapsedWidth}px)` },
          transition: 'width 0.3s',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}

export default AdminLayout
