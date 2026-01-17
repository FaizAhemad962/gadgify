// src/components/ratings/RatingsList.tsx
import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Rating as MuiRating,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material'
import { Delete, Star } from '@mui/icons-material'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  ratingsApi,
  ratingsKeys,
  type Rating as RatingType,
  type RatingResponse,
} from '../../api/ratings'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/dateFormatter'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface RatingsListProps {
  productId: string
}

export const RatingsList: React.FC<RatingsListProps> = ({
  productId,
}) => {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // ----------- QUERY -----------
  const { data, isLoading } = useQuery({
    queryKey: ratingsKeys.byProduct(productId),
    queryFn: () => ratingsApi.getRatings(productId),
  })

  // ----------- MUTATION (DELETE) -----------
  const deleteRatingMutation = useMutation({
    mutationFn: (ratingId: string) =>
      ratingsApi.deleteRating(productId, ratingId),

    // Optimistic update
    onMutate: async (ratingId) => {
      await queryClient.cancelQueries({
        queryKey: ratingsKeys.byProduct(productId),
      })

      const previous =
        queryClient.getQueryData<RatingResponse>(
          ratingsKeys.byProduct(productId)
        )

      if (previous) {
        queryClient.setQueryData<RatingResponse>(
          ratingsKeys.byProduct(productId),
          {
            ...previous,
            ratings: previous.ratings.filter(
              (r) => r.id !== ratingId
            ),
            totalRatings: previous.totalRatings - 1,
          }
        )
      }

      return { previous }
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ratingsKeys.byProduct(productId),
          context.previous
        )
      }
      alert(t('errors.failedToDeleteRating'))
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ratingsKeys.byProduct(productId),
      })
    },
  })

  // ----------- LOADING STATE -----------
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  const ratings = data?.ratings ?? []

  // ----------- EMPTY STATE -----------
  if (ratings.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('common.noReviews')}
        </Typography>

        {!isAuthenticated && (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {t('auth.loginToReview')}
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate('/login')}
            >
              {t('auth.login')}
            </Button>
          </>
        )}
      </Paper>
    )
  }

  // ----------- LIST -----------
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('common.customerReviews')} (
        {data?.totalRatings ?? 0})
      </Typography>

      {ratings.map((rating:RatingType, index) => (
        <Box key={rating.id}>
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Box
              display="flex"
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Box display="flex" gap={2} flex={1}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {rating.user.name.charAt(0).toUpperCase()}
                </Avatar>

                <Box flex={1}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mb={0.5}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                    >
                      {rating.user.name}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatDate(
                        rating.createdAt,
                        t
                      )}
                    </Typography>
                  </Box>

                  <MuiRating
                    value={rating.rating}
                    readOnly
                    size="small"
                    icon={<Star fontSize="inherit" />}
                    emptyIcon={<Star fontSize="inherit" />}
                  />

                  {rating.comment && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mt={1}
                    >
                      {rating.comment}
                    </Typography>
                  )}
                </Box>
              </Box>

              {user?.id === rating.userId && (
                <IconButton
                  size="small"
                  color="error"
                  disabled={
                    deleteRatingMutation.isPending
                  }
                  onClick={() =>
                    deleteRatingMutation.mutate(
                      rating.id
                    )
                  }
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
          </Paper>

          {index < ratings.length - 1 && (
            <Divider sx={{ my: 2 }} />
          )}
        </Box>
      ))}
    </Box>
  )
}
