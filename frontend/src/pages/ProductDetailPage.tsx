import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Divider,
} from '@mui/material'
import { ShoppingCart, ArrowBack } from '@mui/icons-material'
import { productsApi } from '../api/products'
import { ratingsApi } from '../api/ratings'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { StarRating } from '../components/common/StarRating'
import { RatingForm } from '../components/product/RatingForm'
import { RatingsList } from '../components/product/RatingsList'
import { ProductCarousel } from '../components/product/ProductCarousel'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [selectedColor, setSelectedColor] = useState<string>('')

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  })

  const { data: ratingsData } = useQuery({
    queryKey: ['ratings', id],
    queryFn: () => ratingsApi.getRatings(id!),
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
        {t('common.backToProducts')}
      </Button>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Product Carousel */}
          <ProductCarousel
            items={[
              {
                type: 'image',
                url: product.imageUrl || 'https://via.placeholder.com/400x400?text=Product',
                alt: product.name,
              },
              ...(product.videoUrl
                ? [
                    {
                      type: 'video' as const,
                      url: product.videoUrl,
                      alt: 'Product Video',
                    },
                  ]
                : []),
            ]}
          />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="700" sx={{ color: 'text.primary', mb: 2 }}>
              {product.name}
            </Typography>

            {ratingsData && ratingsData.totalRatings > 0 && (
              <Box sx={{ mb: 2 }}>
                <StarRating
                  rating={ratingsData.averageRating}
                  totalRatings={ratingsData.totalRatings}
                  size="medium"
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" color="primary" fontWeight="700">
              ₹{product.price.toLocaleString()}
            </Typography>
            {product.stock > 0 ? (
              <Chip label={`${t('products.stock')}: ${product.stock}`} sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 600 }} />
            ) : (
              <Chip label={t('products.outOfStock')} sx={{ bgcolor: '#f44336', color: '#fff', fontWeight: 600 }} />
            )}
          </Box>

          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 2, fontSize: '1rem' }}>
            {product.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{ flex: 1, fontWeight: 600 }}
            >
              {t('products.addToCart')}
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              sx={{ flex: 1, fontWeight: 600, bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
            >
              {t('products.buyNow')}
            </Button>
          </Box>

          {/* Product Info Sections */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eee' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                ✓ {t('common.fastDelivery')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                {t('products.freeDeliveryAbove')}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #eee' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                ✓ {t('products.securePayment')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                {t('products.safeCheckout')}
              </Typography>
            </Paper>
          </Box>

          {/* Color Selection */}
          {product.colors && (
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ color: 'text.primary', mb: 2 }}>
                {t('products.availableColors')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {product.colors.split(',').map((color: string) => (
                  <Chip
                    key={color.trim()}
                    label={color.trim()}
                    onClick={() => setSelectedColor(color.trim())}
                    color={selectedColor === color.trim() ? 'primary' : 'default'}
                    variant={selectedColor === color.trim() ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer', fontWeight: 500 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Product Video Section - Removed as carousel handles video */}

      {/* Ratings Section */}
      <Box sx={{ mt: 8 }}>
        <Divider sx={{ mb: 6, borderColor: '#ddd' }} />
        <Typography variant="h5" gutterBottom fontWeight="700" sx={{ color: 'text.primary', mb: 4 }}>
          Customer Reviews
        </Typography>

        {isAuthenticated && (
          <Box sx={{ mb: 6 }}>
            <RatingForm productId={id!} />
          </Box>
        )}

        <RatingsList productId={id!} />
      </Box>
    </Container>
  )
}

export default ProductDetailPage
