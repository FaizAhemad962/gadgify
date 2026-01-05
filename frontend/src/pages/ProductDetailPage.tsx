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
  Card,
  CardMedia,
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
        <Box sx={{ flex: 1 }}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardMedia
              component="img"
              image={product.imageUrl || 'https://via.placeholder.com/600x400?text=Product'}
              alt={product.name}
              sx={{ width: '100%', height: 500, objectFit: 'cover', display: 'block' }}
            />
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom fontWeight="600">
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
              {t('common.productDetails')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Category: {product.category}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('common.availableStock')}: {product.stock}
            </Typography>
          </Box>

          {/* Color Selection */}
          {product.colors && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Available Colors
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product.colors.split(',').map((color: string) => (
                  <Chip
                    key={color.trim()}
                    label={color.trim()}
                    onClick={() => setSelectedColor(color.trim())}
                    color={selectedColor === color.trim() ? 'primary' : 'default'}
                    variant={selectedColor === color.trim() ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Product Video Section */}
      {product.videoUrl && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
            Product Video
          </Typography>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 aspect ratio
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <video
                src={product.videoUrl}
                controls
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Paper>
        </Box>
      )}

      {/* Ratings Section */}
      <Box sx={{ mt: 6 }}>
        <Divider sx={{ mb: 4 }} />

        {isAuthenticated && (
          <Box sx={{ mb: 4 }}>
            <RatingForm productId={id!} />
          </Box>
        )}

        <RatingsList productId={id!} />
      </Box>
    </Container>
  )
}

export default ProductDetailPage
