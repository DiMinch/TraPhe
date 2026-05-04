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
  parentId?: string;
  parentName?: string;
  specs: CategorySpec[];
  relatedCategoryIds: string[];
}

export interface DisplayCategory extends Category {
  image: string;
  className?: string;
  link: string;
}
