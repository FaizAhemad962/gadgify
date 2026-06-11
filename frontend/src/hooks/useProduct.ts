import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { Product } from "../types";
import { productsApi } from "../api/products";
import { invalidateProductData } from "@/lib/queryInvalidation";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) =>
      productsApi.create(data),
    onSuccess: () => {
      invalidateProductData(queryClient);
      setError(null);
    },
    onError: (err: Error | unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to create product";
      setError(message);
    },
  });

  const createProduct = useCallback(
    async (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      return mutation.mutateAsync(data);
    },
    [mutation],
  );

  return {
    createProduct,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    data: mutation.data,
    clearError: () => setError(null),
  };
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productsApi.update(id, data),
    onSuccess: (_, variables) => {
      invalidateProductData(queryClient, variables.id);
      setError(null);
    },
    onError: (err: Error | unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to update product";
      setError(message);
    },
  });

  const updateProduct = useCallback(
    async (id: string, data: Partial<Product>) => {
      return mutation.mutateAsync({ id, data });
    },
    [mutation],
  );

  return {
    updateProduct,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    data: mutation.data,
    clearError: () => setError(null),
  };
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: (_, productId) => {
      invalidateProductData(queryClient, productId);
      setError(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to delete product";
      setError(message);
    },
  });

  const deleteProduct = useCallback(
    async (id: string) => {
      return mutation.mutateAsync(id);
    },
    [mutation],
  );

  return {
    deleteProduct,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    clearError: () => setError(null),
  };
};
