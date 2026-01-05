import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
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
      {/* Header Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" gutterBottom fontWeight="700" sx={{ color: 'text.primary' }}>
          {t('products.title')}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Discover our amazing collection of electronics and gadgets
        </Typography>
        
        {/* Categories Filter */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 3 }}>
          <Chip
            label={t('products.allProducts')}
            onClick={handleClearCategory}
            variant={!selectedCategory ? 'filled' : 'outlined'}
            color={!selectedCategory ? 'primary' : 'default'}
            sx={{ cursor: 'pointer', fontWeight: 600 }}
          />
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
              sx={{ cursor: 'pointer', fontWeight: 500 }}
            />
          ))}
        </Box>
      </Box>

      {/* Active Category Badge */}
      {selectedCategory && (
        <Box sx={{ mb: 3 }}>
          <Chip
            label={`📁 ${t(`categories.${selectedCategory}`)}`}
            onDelete={handleClearCategory}
            color="primary"
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      )}

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" color="text.secondary">
            {t('common.loading') || 'Loading products...'}
          </Typography>
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
            gap: 3.5
          }}>
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.slice(0, displayCount).map((product) => (
                <Card 
                  key={product.id} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden', 
                    height: '100%',
                    border: '1px solid #eee',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  {/* Product Image */}
                  <Box
                    sx={{ 
                      cursor: 'pointer', 
                      height: 260, 
                      m: 0, 
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <LazyImage
                      src={product.imageUrl || 'https://via.placeholder.com/300x260?text=Product'}
                      alt={product.name}
                      height={240}
                      objectFit="contain"
                    />
                  </Box>

                  {/* Product Info */}
                  <CardContent sx={{ p: 3, pt: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Product Name */}
                    <Box
                      onClick={() => navigate(`/products/${product.id}`)}
                      sx={{ cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.7 } }}
                    >
                      <Typography 
                        variant="h6"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontWeight: 700,
                          color: 'text.primary',
                          lineHeight: 1.4,
                        }}
                      >
                        {product.name}
                      </Typography>
                    </Box>

                    {/* Star Rating */}
                    {!!product?.totalRatings && product.totalRatings > 0 && (
                      <Box>
                        <StarRating
                          rating={product.averageRating || 0}
                          totalRatings={product.totalRatings}
                          size="small"
                        />
                      </Box>
                    )}

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.6,
                        fontSize: '0.9rem',
                      }}
                    >
                      {product.description}
                    </Typography>

                    {/* Price and Stock */}
                    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700, fontSize: '1.3rem' }}>
                        ₹{product.price.toLocaleString()}
                      </Typography>
                      {product.stock > 0 ? (
                        <Chip 
                          label={t('products.stock')} 
                          sx={{ 
                            bgcolor: '#4caf50', 
                            color: 'white', 
                            fontWeight: 600,
                            height: 28,
                          }} 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          label={t('products.outOfStock')} 
                          sx={{ 
                            bgcolor: '#f44336', 
                            color: 'white', 
                            fontWeight: 600,
                            height: 28,
                          }} 
                          size="small" 
                        />
                      )}
                    </Box>
                  </CardContent>

                  {/* Action Buttons */}
                  <CardActions sx={{ p: 2, gap: 1.5, display: 'flex', flexDirection: 'row' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ShoppingCart sx={{ fontSize: '1.1rem' }} />}
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      sx={{ fontWeight: 600, py: 1.2, flex: 1 }}
                    >
                      {t('products.addToCart')}
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleBuyNow(product.id)}
                      disabled={product.stock === 0}
                      sx={{ 
                        fontWeight: 600, 
                        py: 1.2,
                        flex: 1,
                        bgcolor: '#ff9800',
                        '&:hover': {
                          bgcolor: '#f57c00',
                        },
                      }}
                    >
                      {t('products.buyNow')}
                    </Button>
                  </CardActions>
                </Card>
            ))
            ) : (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 12 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  {t('common.noProductsFound')}
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={handleClearCategory}
                  sx={{ fontWeight: 600 }}
                >
                  Clear Filters
                </Button>
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
                py: 5,
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
