import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardMedia,
} from '@mui/material'
import { ShoppingCart, ArrowBack } from '@mui/icons-material'
import { productsApi } from '../api/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  })

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (product) {
      await addToCart({ productId: product.id, quantity: 1 })
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    await handleAddToCart()
    navigate('/cart')
  }

  if (isLoading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{t('errors.somethingWrong')}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={product.imageUrl || 'https://via.placeholder.com/600x400?text=Product'}
              alt={product.name}
              sx={{ width: '100%', height: 'auto' }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom fontWeight="600">
            {product.name}
          </Typography>

          <Box sx={{ mb: 3 }}>
            {product.stock > 0 ? (
              <Chip label={`${t('products.stock')}: ${product.stock}`} color="success" />
            ) : (
              <Chip label={t('products.outOfStock')} color="error" />
            )}
          </Box>

          <Typography variant="h5" color="primary" gutterBottom fontWeight="600">
            ₹{product.price.toLocaleString()}
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
            {product.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{ flex: 1 }}
            >
              {t('products.addToCart')}
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              sx={{ flex: 1 }}
            >
              {t('products.buyNow')}
            </Button>
          </Box>

          <Box sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Product Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Category: {product.category}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Stock: {product.stock}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ProductDetailPage
