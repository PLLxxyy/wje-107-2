export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  color: string;
  icon: string;
}

export interface CategoryInput {
  name: string;
  sortOrder: number;
  color: string;
  icon: string;
}
