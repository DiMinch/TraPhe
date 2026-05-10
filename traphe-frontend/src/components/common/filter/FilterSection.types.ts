export interface FilterParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface FilterSectionProps {
  className?: string;
  onFilterChange: (params: FilterParams) => void;
}
