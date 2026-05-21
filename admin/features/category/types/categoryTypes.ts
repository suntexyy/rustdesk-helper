export interface Category {
  _id: string;
  title: string;
  example: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  status: string;
  data: {
    categories: Category[];
  };
}

export interface CategoryResponse {
  status: string;
  data: {
    category: Category;
  };
}

export interface CreateCategoryPayload {
  title: string;
  example: string;
  color: string;
}

export interface UpdateCategoryPayload {
  title?: string;
  example?: string;
  color?: string;
}
