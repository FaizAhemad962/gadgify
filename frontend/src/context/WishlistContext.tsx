import React, { createContext, useContext, useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import { useAuth } from "./AuthContext";

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    stock: number;
    media: Array<{
      url: string;
      type: string;
      isPrimary: boolean;
    }>;
  };
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isError: boolean;
  isToggling: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { isAuthenticated } = useAuth();

  // Track which products are currently being toggled
  const [togglingProducts, setTogglingProducts] = useState<Set<string>>(
    new Set(),
  );

  const isToggling = useCallback(
    (productId: string) => {
      return togglingProducts.has(productId);
    },
    [togglingProducts],
  );

  // Fetch wishlist on mount
  const { isLoading, isError, data } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const response = await apiClient.get("/wishlist");
      // Don't set state here - let the mutations handle state updates
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Update wishlistItems when data is loaded, but only if we don't have temp items
  React.useEffect(() => {
    if (data) {
      setWishlistItems((prev) => {
        const hasTempItems = prev.some((item) => item.id.startsWith("temp-"));
        return hasTempItems ? prev : data;
      });
    }
  }, [data]);

  // Add to wishlist mutation
  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiClient.post("/wishlist", { productId });
      return response.data;
    },
    onSuccess: (newItem) => {
      // Add the new item to the wishlist
      setWishlistItems((prev) => [...prev, newItem]);
    },
  });

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiClient.delete(`/wishlist/${productId}`);
    },
    onSuccess: (_, productId) => {
      // Remove the item from state
      setWishlistItems((prev) =>
        prev.filter((item) => item.productId !== productId),
      );
    },
  });

  const addToWishlist = useCallback(
    async (productId: string) => {
      try {
        await addMutation.mutateAsync(productId);
      } catch (error) {
        console.error("Failed to add to wishlist:", error);
        throw error;
      }
    },
    [addMutation],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      try {
        await removeMutation.mutateAsync(productId);
      } catch (error) {
        console.error("Failed to remove from wishlist:", error);
        throw error;
      }
    },
    [removeMutation],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (togglingProducts.has(productId)) {
        return; // Already toggling this product
      }

      setTogglingProducts((prev) => new Set(prev).add(productId));

      try {
        const isCurrentlyInWishlist = wishlistItems.some(
          (item) => item.productId === productId,
        );

        if (isCurrentlyInWishlist) {
          await removeMutation.mutateAsync(productId);
        } else {
          await addMutation.mutateAsync(productId);
        }
      } catch (error) {
        console.error("Wishlist toggle failed:", error);
        throw error;
      } finally {
        setTogglingProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [wishlistItems, togglingProducts, addMutation, removeMutation],
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlistItems.some((item) => item.productId === productId);
    },
    [wishlistItems],
  );

  const value: WishlistContextType = {
    wishlistItems,
    isLoading,
    isError,
    isToggling,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    return {
      wishlistItems: [],
      isLoading: false,
      isError: false,
      isToggling: () => false,
      addToWishlist: async () => {},
      removeFromWishlist: async () => {},
      toggleWishlist: async () => {},
      isInWishlist: () => false,
    };
  }
  return context;
};
