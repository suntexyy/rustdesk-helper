import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateContactStatus } from "../api/contactApi";
import { ContactStatus, ContactResponse } from "../types/contactTypes";

export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ContactResponse,
    Error,
    { id: string; status: ContactStatus }
  >({
    mutationFn: ({ id, status }) => updateContactStatus(id, { status }),
    onSuccess: (_, variables) => {
      // Invalidate the contacts list block so it updates
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      // Invalidate the specific contact if someone currently viewing it
      queryClient.invalidateQueries({ queryKey: ["contact", variables.id] });
    },
  });
};
