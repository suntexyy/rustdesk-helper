export type ContactStatus = "unread" | "read" | "replied";

export interface Contact {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedContacts {
  contacts: Contact[];
  total: number;
  page: number;
  totalPages: number;
}

export interface GetContactsParams {
  page?: number;
  limit?: number;
  status?: ContactStatus;
}

export interface ContactsResponse {
  status: string;
  data: PaginatedContacts;
}

export interface ContactResponse {
  status: string;
  data: {
    contact: Contact;
  };
}

export interface UpdateContactStatusPayload {
  status: ContactStatus;
}

// shape returned by the new bulk status endpoint
export interface BulkUpdateStatusResponse {
  status: string;
  data: {
    modified: number;
  };
}
