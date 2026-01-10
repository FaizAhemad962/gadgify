import { createContext, useContext, useRef, type ReactNode } from 'react'
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
    // Avoid immediate refetch resets while rapidly mutating
    staleTime: 5 * 1000,
    refetchOnWindowFocus: false,
  })

  // Buffer rapid add-to-cart clicks per product to coalesce into one mutation
  const addBufferRef = useRef<Record<string, { quantity: number; timer: ReturnType<typeof setTimeout> | null }>>({})

  // Add to cart mutation with optimistic updates
  const addMutation = useMutation({
    mutationFn: cartApi.addItem,
    // No need for optimistic update here; we perform instant UI updates in the buffer scheduler
    onError: (_err, _newItem) => {
      // Optional: could rollback via a stored snapshot if desired
    },
    onSuccess: (serverCart) => {
      // Sync cache directly with server response to avoid refetch flashes/reset
      queryClient.setQueryData(['cart'], serverCart)
    },
  })

  // Schedule buffered add to cart for rapid clicks
  const scheduleBufferedAdd = (productId: string, quantity: number) => {
    const existing = addBufferRef.current[productId]

    if (existing) {
      existing.quantity += quantity
      if (existing.timer) clearTimeout(existing.timer as any)
    } else {
      addBufferRef.current[productId] = { quantity, timer: null }
    }

    const timer = setTimeout(async () => {
      const buffered = addBufferRef.current[productId]
      delete addBufferRef.current[productId]
      try {
        await addMutation.mutateAsync({ productId, quantity: buffered.quantity })
      } catch {
        // If server rejects, we could optionally rollback UI here
      }
    }, 250)

    addBufferRef.current[productId].timer = timer

    const current = queryClient.getQueryData<Cart>(['cart'])
    if (current) {
      const items = current.items ?? []
      const existingItem = items.find(i => i.productId === productId)
      if (existingItem) {
        queryClient.setQueryData(['cart'], {
          ...current,
          items: items.map(i =>
            i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
          ),
        })
      } else {
        queryClient.setQueryData(['cart'], {
          ...current,
          items: [
            ...items,
            { id: `temp-${Date.now()}`,
              productId,
              quantity,
              product: {} as any },
          ],
        })
      }
    } else {
      queryClient.setQueryData(['cart'], {
        items: [
          { id: `temp-${Date.now()}`,
            productId,
            quantity,
            product: {} as any },
        ],
      } as unknown as Cart)
    }
  }

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
    if (!isAuthenticated) {
      throw new Error('Please sign in to add items to cart')
    }
    scheduleBufferedAdd(data.productId, data.quantity)
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

  const itemCount = (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0)

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
