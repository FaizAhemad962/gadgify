import React from 'react'
import { Box, Typography } from '@mui/material'
import { Star, StarHalf, StarBorder } from '@mui/icons-material'

interface StarRatingProps {
  rating: number
  totalRatings?: number
  size?: 'small' | 'medium' | 'large'
  showNumber?: boolean
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalRatings,
  size = 'medium',
  showNumber = true,
}) => {
  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24,
  }

  const iconSize = sizeMap[size]

  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          sx={{ fontSize: iconSize, color: '#FFC107' }}
        />
      )
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          sx={{ fontSize: iconSize, color: '#FFC107' }}
        />
      )
    }

    // Empty stars
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarBorder
          key={`empty-${i}`}
          sx={{ fontSize: iconSize, color: '#FFC107' }}
        />
      )
    }

    return stars
  }

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Box display="flex" alignItems="center">
        {renderStars()}
      </Box>
      {showNumber && (
        <>
          <Typography variant="body2" fontWeight="bold">
            {rating.toFixed(1)}
          </Typography>
          {totalRatings !== undefined && (
            <Typography variant="body2" color="text.secondary">
              ({totalRatings})
            </Typography>
          )}
        </>
      )}
    </Box>
  )
}
