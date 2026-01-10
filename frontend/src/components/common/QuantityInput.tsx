import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

interface QuantityInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  min = 1,
  max = Infinity,
  onChange,
  disabled = false,
}) => {
  const handleDecrease = () => {
    if (value > min) onChange(value - 1);
  };
  const handleIncrease = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #ddd', borderRadius: 1, p: 0.5, bgcolor: '#f9f9f9' }}>
      <IconButton
        size="small"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        sx={{ '&:disabled': { opacity: 0.5 } }}
        aria-label="decrease quantity"
      >
        <Remove sx={{ fontSize: '1.2rem' }} />
      </IconButton>
      <Typography sx={{ minWidth: 35, textAlign: 'center', fontWeight: 600, color: 'text.primary' }}>
        {value}
      </Typography>
      <IconButton
        size="small"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        sx={{ '&:disabled': { opacity: 0.5 } }}
        aria-label="increase quantity"
      >
        <Add sx={{ fontSize: '1.2rem' }} />
      </IconButton>
    </Box>
  );
};

export default QuantityInput;
