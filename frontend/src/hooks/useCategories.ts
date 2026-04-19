import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/api/categories";
import type { Category } from "@/api/categories";

export interface CategoryWithIcon extends Category {
  icon?: React.ReactNode;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
