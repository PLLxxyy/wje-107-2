import { SpiceLevel } from './enums';

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
}
