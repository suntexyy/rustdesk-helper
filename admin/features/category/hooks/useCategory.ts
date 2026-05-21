import { useQuery } from "@tanstack/react-query";
import { getCategoryById } from "../api/categoryApi";

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id),
    enabled: Boolean(id),
  });
};
