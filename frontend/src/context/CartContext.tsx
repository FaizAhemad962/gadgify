import { createContext, useContext, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api/cart'
import type { Cart, AddToCartRequest } from '../types'
import { useAuth } from './AuthContext'

interface CartContextType {
  cart: Cart | null
  itemCount: number
  isLoading: boolean
  addToCart: (data: AddToCartRequest) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Fetch cart data
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
    enabled: isAuthenticated,
    staleTime: 0,
  })

  // Add to cart mutation
  const addMutation = useMutation({
    mutationFn: cartApi.addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: cartApi.removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const addToCart = async (data: AddToCartRequest) => {
    await addMutation.mutateAsync(data)
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    await updateMutation.mutateAsync({ itemId, quantity })
  }

  const removeFromCart = async (itemId: string) => {
    await removeMutation.mutateAsync(itemId)
  }

  const clearCart = async () => {
    await clearMutation.mutateAsync()
  }

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0

  const value = {
    cart: cart || null,
    itemCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
