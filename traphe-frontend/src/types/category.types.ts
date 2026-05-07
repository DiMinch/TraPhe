export interface CategorySpec {
  id: string;
  specKey: string;
  specName: string;
  isRequired: boolean;
  dataType: string;
  options: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  imageUrl?: string;
  specs: CategorySpec[];
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

export interface CreateCategorySpecRequest {
  categoryId: string;
  specKey: string;
  specName: string;
  isRequired: boolean;
  dataType: string;
  options?: string[];
}
