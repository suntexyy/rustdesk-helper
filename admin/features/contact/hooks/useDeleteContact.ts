import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteContact } from "../api/contactApi";

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteContact(id),
    onSuccess: () => {
      // Ensure we fetch the updated list after deletion
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
