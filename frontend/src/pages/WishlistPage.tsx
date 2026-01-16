import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material'
import { Delete as DeleteIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useTranslation } from 'react-i18next'

interface ProductMedia {
  url: string
  type: string
  isPrimary: boolean
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  stock: number
  media: ProductMedia[]
}

interface WishlistItem {
  id: string
  productId: string
  product: Product
}

const WishlistPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toggleWishlist } = useWishlist()
  const { addToCart, isAddingToCart } = useCart()

  // Fetch wishlist
  const { data: wishlistItems, isLoading, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await apiClient.get('/wishlist')
      return response.data as WishlistItem[]
    },
  })

  const handleRemoveFromWishlist = (productId: string) => {
    toggleWishlist(productId)
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart({ productId, quantity: 1 })
      // Optionally remove from wishlist after adding to cart
      // removeMutation.mutate(productId)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const getPrimaryImage = (media: WishlistItem['product']['media']) => {
    if (!media || !Array.isArray(media)) {
      return ''
    }
    const primaryImage = media.find(m => m.isPrimary && m.type === 'image')
    return primaryImage?.url || media.find(m => m.type === 'image')?.url || ''
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('wishlist.title', 'My Wishlist')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {[...Array(6)].map((_, index) => (
            <Box key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={24} width="80%" />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={80} height={36} />
                    <Skeleton variant="rectangular" width={80} height={36} />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('wishlist.error', 'Failed to load wishlist')}
        </Alert>
      </Box>
    )
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('wishlist.title', 'My Wishlist')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('wishlist.empty', 'Your wishlist is empty')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/products')}
        >
          {t('wishlist.browseProducts', 'Browse Products')}
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('wishlist.title', 'My Wishlist')} ({wishlistItems.length})
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {wishlistItems.map((item) => {
          const primaryImage = getPrimaryImage(item.product.media)
          const discount = item.product.originalPrice
            ? Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)
            : 0

          return (
            <Box key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={primaryImage || '/placeholder-image.jpg'}
                    alt={item.product.name}
                    sx={{ objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  />
                  {discount > 0 && (
                    <Chip
                      label={`${discount}% OFF`}
                      color="error"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                    }}
                    onClick={() => handleRemoveFromWishlist(item.product.id)}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' },
                    }}
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  >
                    {item.product.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ₹{item.product.price.toLocaleString()}
                    </Typography>
                    {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        ₹{item.product.originalPrice.toLocaleString()}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('products.stock', 'Stock')}: {item.product.stock}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAddToCart(item.product.id)}
                      disabled={isAddingToCart(item.product.id) || item.product.stock === 0}
                      fullWidth
                    >
                      {item.product.stock === 0
                        ? t('product.outOfStock', 'Out of Stock')
                        : t('wishlist.addToCart', 'Add to Cart')
                      }
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default WishlistPage