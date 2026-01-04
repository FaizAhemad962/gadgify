import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Rating,
  Paper,
} from '@mui/material'
import { Star } from '@mui/icons-material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ratingsApi, type CreateRatingData } from '../../api/ratings'
import { useTranslation } from 'react-i18next'

interface RatingFormProps {
  productId: string
}

export const RatingForm: React.FC<RatingFormProps> = ({ productId }) => {
  const { t } = useTranslation()
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()

  const createRatingMutation = useMutation({
    mutationFn: (data: CreateRatingData) =>
      ratingsApi.createRating(productId, data),
    onSuccess: () => {
      alert(t('success.ratingSubmitted'))
      setRating(5)
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['ratings', productId] })
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
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={createRatingMutation.isPending}
        >
          {createRatingMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </Paper>
  )
}
