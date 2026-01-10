import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { ordersApi } from '../api/orders'

export const usePlaceOrder = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setError(null)
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to place order'
      setError(message)
    },
  })

  const placeOrder = useCallback(
    async (data: any) => {
      return mutation.mutateAsync(data)
    },
    [mutation]
  )

  return {
    placeOrder,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    data: mutation.data,
    clearError: () => setError(null),
  }
}
