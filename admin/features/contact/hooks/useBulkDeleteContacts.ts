import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteContact } from "../api/contactApi";

export const useBulkDeleteContacts = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => deleteContact(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
