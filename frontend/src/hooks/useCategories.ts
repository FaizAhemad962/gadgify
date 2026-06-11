import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/api/categories";
import type { Category } from "@/api/categories";
import { queryKeys } from "@/lib/queryKeys";

export interface CategoryWithIcon extends Category {
  iconNode?: React.ReactNode;
}

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.getAll(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};
