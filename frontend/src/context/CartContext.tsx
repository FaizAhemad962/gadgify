import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart";
import type { Cart, AddToCartRequest } from "../types";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  isAddingToCart: (productId: string) => boolean;
  addToCart: (data: AddToCartRequest) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [pendingProducts, setPendingProducts] = useState<Set<string>>(
    new Set(),
  );

  // Fetch cart data
  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.get,
    enabled: isAuthenticated,
    // Avoid immediate refetch resets while rapidly mutating
    staleTime: 5 * 1000,
    refetchOnWindowFocus: false,
  });

  // Buffer rapid add-to-cart clicks per product to coalesce into one mutation
  const addBufferRef = useRef<
    Record<
      string,
      {
        quantity: number;
        timer: ReturnType<typeof setTimeout> | null;
        promise?: Promise<void>;
      }
    >
  >({});

  // Add to cart mutation with optimistic updates
  const addMutation = useMutation({
    mutationFn: cartApi.addItem,
    onError: (_err: Error | unknown) => {
      // Refetch to get correct state on error
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onSuccess: (serverCart) => {
      // Sync cache directly with server response to avoid refetch flashes/reset
      queryClient.setQueryData(["cart"], serverCart);
    },
  });

  // Schedule buffered add to cart for rapid clicks
  const scheduleBufferedAdd = (
    productId: string,
    quantity: number,
  ): Promise<void> => {
    const existing = addBufferRef.current[productId];

    if (existing?.promise) {
      // If already scheduled, return the existing promise and accumulate quantity
      existing.quantity += quantity;
      if (existing.timer) clearTimeout(existing.timer);

      const timer = setTimeout(async () => {
        const buffered = addBufferRef.current[productId];
        if (!buffered) return;

        delete addBufferRef.current[productId];

        try {
          await addMutation.mutateAsync({
            productId,
            quantity: buffered.quantity,
          });
        } catch (error) {
          // If server rejects, refetch to get correct state
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          throw error;
        } finally {
          setPendingProducts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      }, 500);

      addBufferRef.current[productId].timer = timer;
      return existing.promise;
    }

    // First click - create new buffer entry
    setPendingProducts((prev) => new Set(prev).add(productId));
    addBufferRef.current[productId] = { quantity, timer: null };

    // Only do optimistic update for the first click
    const current = queryClient.getQueryData<Cart>(["cart"]);
    if (current) {
      const items = current.items ?? [];
      const existingItem = items.find((i) => i.productId === productId);
      if (existingItem) {
        queryClient.setQueryData(["cart"], {
          ...current,
          items: items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          ),
        });
      } else {
        queryClient.setQueryData(["cart"], {
          ...current,
          items: [
            ...items,
            {
              id: `temp-${Date.now()}-${productId}`,
              productId,
              quantity,
              product: {} as Record<string, unknown>,
            },
          ],
        });
      }
    } else {
      queryClient.setQueryData(["cart"], {
        items: [
          {
            id: `temp-${Date.now()}-${productId}`,
            productId,
            quantity,
            product: {} as Record<string, unknown>,
          },
        ],
      } as unknown as Cart);
    }

    // Create a promise that resolves when the mutation completes
    const promise = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(async () => {
        const buffered = addBufferRef.current[productId];
        if (!buffered) {
          reject(new Error("Buffer was cleared"));
          return;
        }

        delete addBufferRef.current[productId];

        try {
          await addMutation.mutateAsync({
            productId,
            quantity: buffered.quantity,
          });
          resolve();
        } catch (error) {
          // If server rejects, refetch to get correct state
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          reject(error);
        } finally {
          setPendingProducts((prev) => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }
      }, 500);

      addBufferRef.current[productId].timer = timer;
    });

    addBufferRef.current[productId].promise = promise;
    return promise;
  };

  // Update item mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

      if (previousCart) {
        queryClient.setQueryData(["cart"], {
          ...previousCart,
          items: previousCart.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        });
      }

      return { previousCart };
    },
    onError: (
      _err: Error | unknown,
      _variables: { itemId: string; quantity: number },
      _onMutateResult: { previousCart?: Cart } | undefined,
    ) => {
      const context = _onMutateResult as { previousCart?: Cart } | undefined;
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Remove item mutation with optimistic updates
  const removeMutation = useMutation({
    mutationFn: cartApi.removeItem,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

      if (previousCart) {
        queryClient.setQueryData(["cart"], {
          ...previousCart,
          items: previousCart.items.filter((item) => item.id !== itemId),
        });
      }

      return { previousCart };
    },
    onError: (
      _err: Error | unknown,
      _variables: string,
      context: { previousCart?: Cart } | undefined,
    ) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const addToCart = async (data: AddToCartRequest) => {
    if (!isAuthenticated) {
      throw new Error("Please sign in to add items to cart");
    }
    scheduleBufferedAdd(data.productId, data.quantity);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    await updateMutation.mutateAsync({ itemId, quantity });
  };

  const removeFromCart = async (itemId: string) => {
    await removeMutation.mutateAsync(itemId);
  };

  const clearCart = async () => {
    await clearMutation.mutateAsync();
  };

  const itemCount = (cart?.items ?? []).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const value = {
    cart: cart || null,
    itemCount,
    isLoading,
    isAddingToCart: (productId: string) => pendingProducts.has(productId),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    // Return a default context if provider is not found (for development/edge cases)
    return {
      cart: null,
      itemCount: 0,
      isLoading: false,
      isAddingToCart: () => false,
      addToCart: async () => {
        throw new Error("useCart must be used within a CartProvider");
      },
      updateQuantity: async () => {
        throw new Error("useCart must be used within a CartProvider");
      },
      removeFromCart: async () => {
        throw new Error("useCart must be used within a CartProvider");
      },
      clearCart: async () => {
        throw new Error("useCart must be used within a CartProvider");
      },
    } as CartContextType;
  }
  return context;
};
