export interface FilterParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  [key: string]: any;
}

export interface FilterSectionProps {
  className?: string;
  categoryId?: string;
  onFilterChange: (params: FilterParams) => void;
}
