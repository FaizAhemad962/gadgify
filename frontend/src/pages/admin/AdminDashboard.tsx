import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Paper, Typography, Box } from '@mui/material'
import { Inventory, ShoppingCart, People, CurrencyRupee } from '@mui/icons-material'
import { productsApi } from '../../api/products'
import { ordersApi } from '../../api/orders'

const AdminDashboard = () => {
  const { t } = useTranslation()
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  })

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: ordersApi.getAllOrders,
  })

  const stats = [
    {
      title: t('admin.totalProducts'),
      value: products?.length || 0,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: t('admin.totalOrders'),
      value: Array.isArray(orders) ? orders.length : 0,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: t('admin.pendingOrders'),
      value: Array.isArray(orders) ? orders.filter((o) => o.status === 'PENDING').length : 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: t('admin.totalRevenue'),
      value: `₹${Array.isArray(orders) ? orders.reduce((sum, o) => sum + o.total, 0).toLocaleString() : 0}`,
      icon: <CurrencyRupee sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600" sx={{ color: '#fff', mb: 4, background: 'linear-gradient(135deg, #1976d2, #ff9800)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {t('admin.dashboard')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
        {stats.map((stat, index) => (
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }, minWidth: 200 }} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                backgroundColor: '#242628',
                border: `2px solid ${stat.color}`,
                borderRadius: '12px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${stat.color}40`,
                },
              }}
            >
              <Box sx={{ color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ color: '#ff9800' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>{stat.title}</Typography>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>

      <Paper sx={{ p: 3, bgcolor: '#242628', border: '1px solid #3a3a3a', borderRadius: '12px' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#ff9800', fontWeight: '600', mb: 2.5 }}>
          {t('admin.recentOrders')}
        </Typography>
        {orders && orders.length > 0 ? (
          <Box>
            {orders.slice(0, 5).map((order) => (
              <Box
                key={order.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  px: 1,
                  borderBottom: '1px solid #3a3a3a',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '6px',
                  '&:hover': {
                    bgcolor: '#1e1e1e',
                  },
                  '&:last-child': {
                    borderBottom: 'none',
                  }
                }}
              >
                <Typography sx={{ color: '#b0b0b0' }}>Order #{order.id.slice(0, 8)}</Typography>
                <Typography sx={{ color: '#ff9800', fontWeight: '600' }}>₹{order.total.toLocaleString()}</Typography>
                <Typography sx={{ color: '#1976d2', fontWeight: '600' }}>{order.status}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ color: '#707070' }}>{t('admin.noOrders')}</Typography>
        )}
      </Paper>
    </Box>
  )
}

export default AdminDashboard
