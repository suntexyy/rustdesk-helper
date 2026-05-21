import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkUpdateContactStatusApi } from "../api/contactApi";
import { ContactStatus } from "../types/contactTypes";

export const useBulkUpdateContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { ids: string[]; status: ContactStatus }>({
    mutationFn: async ({ ids, status }) => {
      // call single bulk endpoint instead of firing many requests
      await bulkUpdateContactStatusApi(ids, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
};
