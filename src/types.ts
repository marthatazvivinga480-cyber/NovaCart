export type ProductCategory =
  | "Jewellery"
  | "Ladies’ Wear"
  | "Kids’ Wear"
  | "Sneakers"
  | "Denim Jeans"
  | "Phones";
export type Category = "All" | ProductCategory;
export type SortOrder = "relevance" | "low" | "high" | "newest" | "rated";
export type Panel =
  "cart" | "studio" | "account" | "orders" | "wishlist" | "checkout";
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
  tag: string;
  description: string;
  rating?: number;
  createdAt?: number;
}
export type Cart = Record<string, number>;
export type ModalState = Panel | Product | null;
export interface ProductFilters {
  category: Category;
  query: string;
  sort: SortOrder;
}
