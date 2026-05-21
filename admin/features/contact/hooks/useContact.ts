import { useQuery } from "@tanstack/react-query";
import { getContactById } from "../api/contactApi";

export const useContact = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: () => getContactById(id),
    enabled: options?.enabled !== false && !!id,
  });
};
