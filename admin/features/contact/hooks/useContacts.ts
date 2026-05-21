import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getContacts } from "../api/contactApi";
import { ContactStatus } from "../types/contactTypes";

export const useContacts = (initialLimit = 20) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [status, setStatus] = useState<ContactStatus | undefined>(undefined);

  const query = useQuery({
    queryKey: ["contacts", { page, limit, status }],
    queryFn: () => getContacts({ page, limit, status }),
  });

  return {
    ...query,
    page,
    setPage,
    limit,
    setLimit,
    status,
    setStatus,
  };
};
