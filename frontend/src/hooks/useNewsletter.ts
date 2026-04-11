import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { newsletterApi } from "../api/newsletters";
import axios from "axios";

export const useNewsletterSubscribe = () => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (email: string) => newsletterApi.subscribe(email),
    onSuccess: (data) => {
      setError(null);
      setMessage(data.message || "Successfully subscribed to newsletter");
    },
    onError: (err: unknown) => {
      let errorMessage = "Failed to subscribe to newsletter";

      if (axios.isAxiosError(err)) {
        // Extract error message from API response
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setMessage(null);
    },
  });

  const subscribe = useCallback(
    async (email: string) => {
      return mutation.mutateAsync(email);
    },
    [mutation],
  );

  return {
    subscribe,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    message,
    clearError: () => setError(null),
    clearMessage: () => setMessage(null),
  };
};

export const useNewsletterUnsubscribe = () => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (email: string) => newsletterApi.unsubscribe(email),
    onSuccess: (data) => {
      setError(null);
      setMessage(data.message || "Successfully unsubscribed from newsletter");
    },
    onError: (err: unknown) => {
      let errorMessage = "Failed to unsubscribe from newsletter";

      if (axios.isAxiosError(err)) {
        // Extract error message from API response
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setMessage(null);
    },
  });

  const unsubscribe = useCallback(
    async (email: string) => {
      return mutation.mutateAsync(email);
    },
    [mutation],
  );

  return {
    unsubscribe,
    isPending: mutation.isPending,
    error,
    isError: mutation.isError,
    message,
    clearError: () => setError(null),
    clearMessage: () => setMessage(null),
  };
};
