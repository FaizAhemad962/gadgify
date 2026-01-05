import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Rating,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material'
import { Delete, Star } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ratingsApi, type Rating as RatingType } from '../../api/ratings'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface RatingsListProps {
  productId: string
}

export const RatingsList: React.FC<RatingsListProps> = ({ productId }) => {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['ratings', productId],
    queryFn: () => ratingsApi.getRatings(productId),
  })

  const deleteRatingMutation = useMutation({
    mutationFn: () => ratingsApi.deleteRating(productId),
    onSuccess: () => {
      alert(t('success.ratingDeleted'))
      queryClient.invalidateQueries({ queryKey: ['ratings', productId] })
    },
    onError: () => {
      alert(t('errors.failedToDeleteRating'))
    },
  })

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  const ratings = data?.ratings || []

  if (ratings.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('common.noReviews')}
        </Typography>
        {!isAuthenticated && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please login to write a review
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/login')}
            >
              Login to Review
            </Button>
          </Box>
        )}
      </Paper>
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('common.customerReviews')} ({data?.totalRatings || 0})
      </Typography>

      {ratings.map((rating: RatingType, index: number) => (
        <Box key={rating.id}>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              <Box display="flex" gap={2} flex={1}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {rating.user.name.charAt(0).toUpperCase()}
                </Avatar>

                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {rating.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(rating.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Rating
                    value={rating.rating}
                    readOnly
                    size="small"
                    icon={<Star fontSize="inherit" />}
                    emptyIcon={<Star fontSize="inherit" />}
                  />

                  {rating.comment && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {rating.comment}
                    </Typography>
                  )}
                </Box>
              </Box>

              {user?.id === rating.userId && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => deleteRatingMutation.mutate()}
                  disabled={deleteRatingMutation.isPending}
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
          </Paper>

          {index < ratings.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}
    </Box>
  )
}
