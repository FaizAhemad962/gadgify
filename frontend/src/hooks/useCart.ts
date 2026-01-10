import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { cartApi } from '../api/cart'

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setError(null)
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to update cart'
      setError(message)
    },
  })

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      return mutation.mutateAsync({ itemId, quantity })
    },
    [mutation]
  )

  return {
    updateQuantity,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    clearError: () => setError(null),
  }
}

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setError(null)
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to remove from cart'
      setError(message)
    },
  })

  const removeFromCart = useCallback(
    async (itemId: string) => {
      return mutation.mutateAsync(itemId)
    },
    [mutation]
  )

  return {
    removeFromCart,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    clearError: () => setError(null),
  }
}

export const useClearCart = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      setError(null)
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to clear cart'
      setError(message)
    },
  })

  const clearCart = useCallback(
    async () => {
      return mutation.mutateAsync()
    },
    [mutation]
  )

  return {
    clearCart,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    clearError: () => setError(null),
  }
}
