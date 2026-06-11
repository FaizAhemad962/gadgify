import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { ordersApi } from "../api/orders";
import { invalidateCartData, invalidateOrderData } from "@/lib/queryInvalidation";

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (order) => {
      invalidateCartData(queryClient);
      invalidateOrderData(queryClient, order?.id);
      setError(null);
    },
    onError: (err: Error | unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to place order";
      setError(message);
    },
  });

  const placeOrder = useCallback(
    async (data: Record<string, unknown>) => {
      // Type assertion - ordersApi.create will validate the data structure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mutation.mutateAsync(data as any);
    },
    [mutation],
  );

  return {
    placeOrder,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    data: mutation.data,
    clearError: () => setError(null),
  };
};
