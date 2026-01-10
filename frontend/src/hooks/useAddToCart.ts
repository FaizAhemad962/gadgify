import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type { AddToCartRequest } from '../types'
import { cartApi } from '../api/cart'

export const useAddToCart = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setError(null)
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to add to cart'
      setError(message)
    },
  })

  const addToCart = useCallback(
    async (data: AddToCartRequest) => {
      return mutation.mutateAsync(data)
    },
    [mutation]
  )

  return {
    addToCart,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    clearError: () => setError(null),
  }
}
