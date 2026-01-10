import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  IconButton,
  Divider
} from '@mui/material'
import { Add, Remove, Delete, ShoppingCartOutlined } from '@mui/icons-material'
import QuantityInput from '../components/common/QuantityInput'
import { useCart } from '../context/CartContext'

const CartPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, isLoading } = useCart()

  const calculateSubtotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => {
      const price = item.product?.price || 0
      return sum + price * item.quantity
    }, 0)
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
      <Typography variant="h4" gutterBottom fontWeight="700" sx={{ mb: 4, color: 'text.primary' }}>
        {t('cart.title')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: { md: 2 } }}>
          {cart.items.map((item) => (
            <Paper key={item.id} sx={{ mb: 3, p: 0, overflow: 'hidden', border: '1px solid #eee' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, p: 2 }}>
                {/* Product Image */}
                <Box sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 180,
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={item.product.imageUrl || 'https://via.placeholder.com/180'}
                      alt={item.product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '8px',
                      }}
                    />
                  </Box>
                </Box>

                {/* Product Details */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                      {item.product.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.product.description}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      ₹{(item.product.price || 0).toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Quantity and Remove */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between', mt: 2 }}>
                    <QuantityInput
                      value={item.quantity}
                      min={1}
                      max={item.product.stock}
                      onChange={q => handleQuantityChange(item.id, q)}
                      disabled={isLoading}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      ₹{((item.product.price || 0) * item.quantity).toLocaleString()}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => handleRemove(item.id)}
                      sx={{ ml: 'auto' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Order Summary */}
        <Box sx={{ flex: { md: 1 } }}>
          <Paper sx={{ p: 3.5, position: 'sticky', top: 20, border: '1px solid #eee' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', mb: 2.5 }}>
              {t('checkout.orderSummary')}
            </Typography>
            <Divider sx={{ my: 2.5 }} />

            {/* Price Breakdown */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>{t('cart.subtotal')}</Typography>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>₹{subtotal.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>{t('checkout.shipping')}</Typography>
                <Typography sx={{ fontWeight: 600, color: shipping === 0 ? '#4caf50' : 'text.primary' }}>
                  {shipping === 0 ? (
                    <Box component="span" sx={{ color: '#4caf50' }}>{t('common.freeShippingLabel')}</Box>
                  ) : (
                    `₹${shipping}`
                  )}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2.5 }} />

            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3.5, alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>{t('cart.total')}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary' }}>
                ₹{total.toLocaleString()}
              </Typography>
            </Box>

            {/* Checkout Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => navigate('/checkout')}
              sx={{ 
                mb: 2, 
                fontWeight: 700, 
                py: 1.5, 
                bgcolor: '#ff9800',
                '&:hover': {
                  bgcolor: '#f57c00',
                }
              }}
            >
              {t('cart.proceedToCheckout')}
            </Button>

            {/* Continue Shopping Button */}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/products')}
              sx={{ fontWeight: 600, py: 1.3, color: '#1976d2', borderColor: '#1976d2' }}
            >
              {t('cart.continueShopping')}
            </Button>

            {/* Trust Signals */}
            <Box sx={{ mt: 3.5, pt: 2.5, borderTop: '1px solid #eee' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', display: 'block', mb: 2 }}>
                {t('common.whyShopWithUs')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '1.1rem' }}>🚚</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    {t('common.fastAndFreeShipping')} {subtotal > 500 ? '✓' : t('common.aboveAmount')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '1.1rem' }}>🔒</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    {t('common.securepayment')} SSL {t('common.sslEncrypted').split('and')[0]}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '1.1rem' }}>↩️</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    {t('common.easySevenDayReturns')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  )
}

export default CartPage
