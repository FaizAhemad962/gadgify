import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Paper, Typography, Box } from '@mui/material'
import { Inventory, ShoppingCart, People, AttachMoney } from '@mui/icons-material'
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
      value: orders?.length || 0,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: t('admin.pendingOrders'),
      value: orders?.filter((o) => o.status === 'PENDING').length || 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: t('admin.totalRevenue'),
      value: `₹${orders?.reduce((sum, o) => sum + o.total, 0).toLocaleString() || 0}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="600">
        {t('admin.dashboard')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {stats.map((stat, index) => (
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }, minWidth: 200 }} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: stat.color,
                color: 'white',
              }}
            >
              {stat.icon}
              <Box>
                <Typography variant="h4" fontWeight="600">
                  {stat.value}
                </Typography>
                <Typography variant="body2">{stat.title}</Typography>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
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
                  py: 2,
                  borderBottom: '1px solid #eee',
                }}
              >
                <Typography>Order #{order.id.slice(0, 8)}</Typography>
                <Typography>₹{order.total.toLocaleString()}</Typography>
                <Typography color="primary">{order.status}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">{t('admin.noOrders')}</Typography>
        )}
      </Paper>
    </Box>
  )
}

export default AdminDashboard
