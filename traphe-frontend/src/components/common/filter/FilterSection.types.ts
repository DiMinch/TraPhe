export interface FilterParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  [key: string]: any;
}

export interface FilterSectionProps {
  className?: string;
  onFilterChange: (params: FilterParams) => void;
}
