import { SpiceLevel } from './enums';

export interface Specification {
  id: string;
  name: string;
  price: number;
}

export interface SpecificationInput {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  isRecommended: boolean;
  spiceLevel: SpiceLevel;
  isVegetarian: boolean;
  specifications: Specification[];
  createdAt: number;
  updatedAt: number;
}

export interface MenuItemInput {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  isRecommended: boolean;
  spiceLevel: SpiceLevel;
  isVegetarian: boolean;
  specifications: SpecificationInput[];
}
