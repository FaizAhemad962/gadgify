import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
  Grid,
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

const ProductsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  })

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

  const filteredProducts = products?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{t('errors.somethingWrong')}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="600">
        {t('products.title')}
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder={t('products.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card sx={{ height: 520, width: 360, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={product.imageUrl || 'https://via.placeholder.com/300x240?text=Product'}
                    alt={product.name}
                    sx={{ objectFit: 'cover', cursor: 'pointer', width: 360, display: 'block' }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  />
                  <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 360 }}>
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
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No products found
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  )
}

export default ProductsPage
