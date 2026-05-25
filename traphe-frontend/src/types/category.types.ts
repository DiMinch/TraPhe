export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  imageUrl?: string;
  relatedCategoryIds: string[];
}

export interface DisplayCategory extends Category {
  image: string;
  className?: string;
  link: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
  relatedCategoryIds?: string[];
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string;
  relatedCategoryIds?: string[];
}
