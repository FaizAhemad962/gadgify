import React, { useState } from 'react'
import {
  Box,
  TextField,
  Typography,
  Rating,
  Paper,
} from '@/mui/material'
import { Star } from '@/mui/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ratingsApi, type CreateRatingData } from '../../api/ratings'
import { useTranslation } from 'react-i18next'
import { invalidateProductData } from '@/lib/queryInvalidation'
import { queryKeys } from '@/lib/queryKeys'
import { CustomButton } from '@/components/ui/CustomButton'
import { tokens } from '@/theme/theme'

interface RatingFormProps {
  productId: string
}

export const RatingForm: React.FC<RatingFormProps> = ({ productId }) => {
  const { t } = useTranslation()
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()

  const createRatingMutation = useMutation({
    mutationFn: (data: CreateRatingData) =>
      ratingsApi.createRating(productId, data),
    onSuccess: () => {
      alert(t('success.ratingSubmitted'))
      setRating(5)
      setComment('')
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.ratings(productId),
      })
      invalidateProductData(queryClient, productId)
    },
    onError: () => {
      alert(t('errors.failedToSubmitRating'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createRatingMutation.mutate({ rating, comment: comment.trim() || undefined })
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: `${tokens.radiusXl}px`,
        border: `1px solid ${tokens.gray200}`,
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(250,250,249,0.78))',
        boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Typography variant="h6" fontWeight={800} gutterBottom>
        {t('common.writeReview')}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <Typography component="legend" gutterBottom>
            {t('common.yourRating')} *
          </Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(_, value) => setRating(value || 5)}
            size="large"
            icon={<Star fontSize="inherit" />}
            emptyIcon={<Star fontSize="inherit" />}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Review (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          inputProps={{ maxLength: 500 }}
          helperText={`${comment.length}/500`}
          sx={{ mb: 2 }}
        />

        <CustomButton
          type="submit"
          appVariant="primary"
          disabled={createRatingMutation.isPending}
        >
          {createRatingMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </CustomButton>
      </form>
    </Paper>
  )
}
