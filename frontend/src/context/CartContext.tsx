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

  // Add to cart mutation with optimistic updates
  const addMutation = useMutation({
    mutationFn: cartApi.addItem,
    onMutate: async (newItem) => {
      // Cancel pending queries
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      
      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<Cart>(['cart'])
      
      // Optimistically update to new value
      if (previousCart) {
        const existingItem = previousCart.items.find(item => item.productId === newItem.productId)
        
        if (existingItem) {
          // Item exists, update quantity
          queryClient.setQueryData(['cart'], {
            ...previousCart,
            items: previousCart.items.map(item =>
              item.productId === newItem.productId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          })
        } else {
          // New item, add to cart (using a temporary ID)
          queryClient.setQueryData(['cart'], {
            ...previousCart,
            items: [
              ...previousCart.items,
              {
                id: `temp-${Date.now()}`,
                productId: newItem.productId,
                quantity: newItem.quantity,
                product: {} as any, // Will be overwritten on success
              },
            ],
          })
        }
      }
      
      return { previousCart }
    },
    onError: (_err, _newItem, context: any) => {
      // Revert on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }
    },
    onSuccess: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Update item mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previousCart = queryClient.getQueryData<Cart>(['cart'])
      
      if (previousCart) {
        queryClient.setQueryData(['cart'], {
          ...previousCart,
          items: previousCart.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })
      }
      
      return { previousCart }
    },
    onError: (_err, _variables, context: any) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Remove item mutation with optimistic updates
  const removeMutation = useMutation({
    mutationFn: cartApi.removeItem,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previousCart = queryClient.getQueryData<Cart>(['cart'])
      
      if (previousCart) {
        queryClient.setQueryData(['cart'], {
          ...previousCart,
          items: previousCart.items.filter(item => item.id !== itemId),
        })
      }
      
      return { previousCart }
    },
    onError: (_err, _variables, context: any) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }
    },
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
