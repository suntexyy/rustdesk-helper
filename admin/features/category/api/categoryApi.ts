import { safeFetch } from "@/features/lib/apiClient";
import {
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/categoryTypes";

export const getCategories = async () => {
  return safeFetch<CategoriesResponse>(`/api/category`);
};

export const getCategoryById = async (id: string) => {
  return safeFetch<CategoryResponse>(`/api/category/${id}`);
};

export const createCategory = async (payload: CreateCategoryPayload) => {
  return safeFetch<CategoryResponse>(`/api/category`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateCategory = async (
  id: string,
  payload: UpdateCategoryPayload,
) => {
  return safeFetch<CategoryResponse>(`/api/category/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteCategory = async (id: string) => {
  return safeFetch<void>(`/api/category/${id}`, {
    method: "DELETE",
  });
};
