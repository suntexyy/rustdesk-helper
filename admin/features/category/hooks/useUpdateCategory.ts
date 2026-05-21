import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategory } from "../api/categoryApi";
import {
  CategoryResponse,
  UpdateCategoryPayload,
} from "../types/categoryTypes";

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CategoryResponse,
    Error,
    {
      id: string;
      payload: UpdateCategoryPayload;
    }
  >({
    mutationFn: ({ id, payload }) => updateCategory(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
    },
  });
};
