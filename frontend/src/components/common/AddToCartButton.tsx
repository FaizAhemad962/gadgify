import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'contained' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  onAdded?: () => void;
  children?: React.ReactNode;
}

export const AddToCartButton = ({
  productId,
  quantity = 1,
  disabled = false,
  fullWidth = false,
  variant = 'outlined',
  size = 'small',
  onAdded,
  children,
}: AddToCartButtonProps) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await addToCart({ productId, quantity });
      if (onAdded) onAdded();
    } catch (e) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<ShoppingCart sx={{ fontSize: '1.1rem' }} />}
      onClick={handleClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      sx={{ fontWeight: 600, py: 1.2 }}
    >
      {loading ? <CircularProgress size={20} /> : children || t('products.addToCart')}
    </Button>
  );
};

export default AddToCartButton;
