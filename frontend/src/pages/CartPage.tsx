import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  IconButton,
  Divider,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material'
import { Add, Remove, Delete, ShoppingCartOutlined } from '@mui/icons-material'
import { useCart } from '../context/CartContext'

const CartPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, isLoading } = useCart()

  const calculateSubtotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    await updateQuantity(itemId, newQuantity)
  }

  const handleRemove = async (itemId: string) => {
    await removeFromCart(itemId)
  }

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>{t('common.loading')}</Typography>
      </Container>
    )
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCartOutlined sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          {t('cart.empty')}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          {t('cart.continueShopping')}
        </Button>
      </Container>
    )
  }

  const subtotal = calculateSubtotal()
  const shipping = subtotal > 5000 ? 0 : 100
  const total = subtotal + shipping

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="600">
        {t('cart.title')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: { md: 2 } }}>
          {cart.items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0 }}>
                  <CardMedia
                    component="img"
                    image={item.product.imageUrl || 'https://via.placeholder.com/150'}
                    alt={item.product.name}
                    sx={{ height: 200, width: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
                      <Box sx={{ maxWidth: '50%', minWidth: 0 }}>
                        <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                          {item.product.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            wordBreak: 'break-word', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical' 
                          }}
                        >
                          {item.product.description}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          ₹{item.product.price.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto', flexShrink: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Remove />
                          </IconButton>
                          <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 500 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => handleRemove(item.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>

        <Box sx={{ flex: { md: 1 } }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              {t('checkout.orderSummary')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{t('cart.subtotal')}</Typography>
                <Typography>₹{subtotal.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{t('checkout.shipping')}</Typography>
                <Typography>
                  {shipping === 0 ? t('common.free') : `₹${shipping}`}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">{t('cart.total')}</Typography>
              <Typography variant="h6" color="primary">
                ₹{total.toLocaleString()}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate('/checkout')}
            >
              {t('cart.proceedToCheckout')}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/products')}
            >
              {t('cart.continueShopping')}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  )
}

export default CartPage
