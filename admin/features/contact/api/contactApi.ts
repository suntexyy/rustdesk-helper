import { safeFetch } from "@/features/lib/apiClient";
import {
  ContactsResponse,
  GetContactsParams,
  ContactResponse,
  UpdateContactStatusPayload,
  BulkUpdateStatusResponse,
} from "../types/contactTypes";

export const getContacts = async (params?: GetContactsParams) => {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.status) query.append("status", params.status);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return safeFetch<ContactsResponse>(`/api/contact${queryString}`);
};

export const getContactById = async (id: string) => {
  return safeFetch<ContactResponse>(`/api/contact/${id}`);
};

export const updateContactStatus = async (
  id: string,
  payload: UpdateContactStatusPayload,
) => {
  return safeFetch<ContactResponse>(`/api/contact/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteContact = async (id: string) => {
  return safeFetch<void>(`/api/contact/${id}`, {
    method: "DELETE",
  });
};

// new bulk status endpoint
export const bulkUpdateContactStatusApi = async (
  ids: string[],
  status: UpdateContactStatusPayload,
) => {
  return safeFetch<BulkUpdateStatusResponse>(`/api/contact/status/bulk`, {
    method: "PATCH",
    body: JSON.stringify({ ids, status: status.status }),
  });
};
