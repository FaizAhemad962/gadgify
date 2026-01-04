import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material'
import { ShoppingCart } from '@mui/icons-material'
import { productsApi } from '../api/products'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import LazyImage from '../components/common/LazyImage'
import { StarRating } from '../components/common/StarRating'

const PRODUCTS_PER_PAGE = 12

const ProductsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE)
  const loaderRef = useRef<HTMLDivElement>(null)

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleClearCategory = () => {
    setSelectedCategory(null)
    setSearchParams({})
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products?.map(p => p.category) || []))

  // Read category from URL on mount
  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && filteredProducts && displayCount < filteredProducts.length) {
          setDisplayCount((prev) => prev + PRODUCTS_PER_PAGE)
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [displayCount, filteredProducts])

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(PRODUCTS_PER_PAGE)
  }, [searchQuery, selectedCategory])

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    try {
      await addToCart({ productId, quantity: 1 })
      // Toast notification would go here
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleBuyNow = async (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    await handleAddToCart(productId)
    navigate('/cart')
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{t('errors.somethingWrong')}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="600">
        {t('products.title')}
      </Typography>

      {selectedCategory && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`${t('products.category')}: ${t(`categories.${selectedCategory}`)}`}
            onDelete={handleClearCategory}
            color="primary"
            sx={{ mr: 1 }}
          />
        </Box>
      )}

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder={t('products.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          sx={{ flex: 1, minWidth: 250 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={t(`categories.${category}`)}
              onClick={() => {
                setSelectedCategory(category)
                setSearchParams({ category })
              }}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              color={selectedCategory === category ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)', 
              lg: 'repeat(4, 1fr)' 
            },
            gap: 3 
          }}>
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.slice(0, displayCount).map((product) => (
                <Card key={product.id} sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
                  <Box
                    sx={{ cursor: 'pointer', height: 240 }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <LazyImage
                      src={product.imageUrl || 'https://via.placeholder.com/300x240?text=Product'}
                      alt={product.name}
                      height={240}
                      objectFit="cover"
                    />
                  </Box>
                  <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography 
                        variant="h6"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          height: 32,
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          height: 40,
                          mb: 1.5,
                        }}
                      >
                        {product.description}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        ₹{product.price.toLocaleString()}
                      </Typography>
                      {product.stock > 0 ? (
                        <Chip label={t('products.stock')} color="success" size="small" />
                      ) : (
                        <Chip label={t('products.outOfStock')} color="error" size="small" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ShoppingCart />}
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      {t('products.addToCart')}
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleBuyNow(product.id)}
                      disabled={product.stock === 0}
                    >
                      {t('products.buyNow')}
                    </Button>
                  </CardActions>
                </Card>
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                {t('common.noProductsFound')}
              </Typography>
            </Box>
          )}
          </Box>

          {/* Infinite scroll loader */}
          {filteredProducts && displayCount < filteredProducts.length && (
            <Box
              ref={loaderRef}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 4,
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default ProductsPage
