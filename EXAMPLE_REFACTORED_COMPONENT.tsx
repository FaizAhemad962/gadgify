import { useState } from 'react'
import { useAddToCart } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Typography, Card, CardContent, CardActions } from '@mui/material'
import { ShoppingCart } from '@mui/icons-material'
import { CustomButton } from '@/components/ui'
import { CustomAlert } from '@/components/ui'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

/**
 * REFACTORED: ProductCard Component
 * 
 * Changes:
 * 1. Replaced direct MUI Button import with CustomButton
 * 2. Replaced manual loading state with useAddToCart hook
 * 3. Removed manual error state management
 * 4. Added automatic error display and clearing
 * 
 * Benefits:
 * - No code duplication for button styling
 * - Better UX with loading states
 * - Automatic error handling
 * - Type-safe API calls
 */
export const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart, isPending, error, clearError } = useAddToCart()
  const [showError, setShowError] = useState(false)

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      setShowError(true)
      await addToCart({ productId: product.id, quantity: 1 })
      // Success - show toast notification
      // This would be integrated with a toast service
    } catch (err) {
      // Error is automatically captured in 'error' state
      // User will see error message below
    }
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    // Navigate to checkout with product
    navigate('/checkout', { state: { product } })
  }

  return (
    <>
      {/* Error Display */}
      {showError && error && (
        <CustomAlert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            setShowError(false)
            clearError()
          }}
        >
          {error}
        </CustomAlert>
      )}

      {/* Product Card */}
      <Card
        sx={{
          bgcolor: '#242628',
          color: '#b0b0b0',
          border: '1px solid #3a3a3a',
          borderRadius: '12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-4px)',
          },
        }}
      >
        {/* Product Image */}
        <Box
          sx={{
            width: '100%',
            height: 200,
            bgcolor: '#1e1e1e',
            backgroundImage: `url(${product.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px 12px 0 0',
          }}
        />

        {/* Product Content */}
        <CardContent sx={{ pb: 1 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#e0e0e0',
              fontWeight: '600',
              mb: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.name}
          </Typography>

          <Typography variant="body2" sx={{ color: '#707070', mb: 1, height: 40, overflow: 'hidden' }}>
            {product.description}
          </Typography>

          {/* Price & Stock */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                color: '#ff9800',
                fontWeight: '700',
              }}
            >
              ₹{product.price.toLocaleString()}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: product.stock > 0 ? '#4caf50' : '#f44336',
                fontWeight: '600',
              }}
            >
              {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
            </Typography>
          </Box>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ gap: 1, p: 2, pt: 0 }}>
          {/* Add to Cart Button - Now with loading state */}
          <CustomButton
            variant="outlined"
            color="primary"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            isLoading={isPending}  {/* ✨ NEW: Loading state handled automatically */}
            disabled={product.stock === 0}
            fullWidth
          >
            {t('products.addToCart')}
          </CustomButton>

          {/* Buy Now Button */}
          <CustomButton
            variant="contained"
            color="primary"
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            fullWidth
          >
            {t('products.buyNow')}
          </CustomButton>
        </CardActions>
      </Card>
    </>
  )
}

/**
 * BEFORE: Old Implementation (for reference)
 * 
 * const ProductCard = ({ product }: ProductCardProps) => {
 *   const [loading, setLoading] = useState(false)
 *   const [error, setError] = useState<string | null>(null)
 * 
 *   const handleAddToCart = async () => {
 *     setLoading(true)
 *     setError(null)
 *     try {
 *       await addToCart({ productId: product.id, quantity: 1 })
 *     } catch (err: any) {
 *       setError(err.message)
 *     } finally {
 *       setLoading(false)
 *     }
 *   }
 * 
 *   return (
 *     <>
 *       {error && (
 *         <Alert onClose={() => setError(null)}>
 *           {error}
 *         </Alert>
 *       )}
 *       <Card>
 *         ...
 *         <Button
 *           disabled={loading}
 *           onClick={handleAddToCart}
 *           sx={{...lots of styling...}}
 *         >
 *           {loading ? 'Loading...' : 'Add to Cart'}
 *         </Button>
 *       </Card>
 *     </>
 *   )
 * }
 * 
 * Issues:
 * - Manual state management for loading and error
 * - Button styling repeated in every component
 * - No automatic cache invalidation
 * - Manual error display/clearing logic
 * - More code, more bugs
 */
