import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "../api/categoryApi";
import {
  CreateCategoryPayload,
  CategoryResponse,
} from "../types/categoryTypes";

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<CategoryResponse, Error, CreateCategoryPayload>({
    mutationFn: (payload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
