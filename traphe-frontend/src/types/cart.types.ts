/**
 * TraPhe Cart Types — F&B domain (drinks with size/options/toppings + merchandise)
 */

export interface ToppingSelection {
  toppingId: string;
  quantity: number;
}

export interface ToppingInfo {
  toppingId: string;
  toppingName: string;
  extraPrice: number;
  quantity: number;
}

export interface CartItem {
  id: string;

  // Menu item info
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl: string;
  isDrink: boolean;
  status: string;

  // Size info (drinks only)
  menuItemSizeId: string | null;
  sizeName: string | null;

  // Customization
  selectedOptions: Record<string, string> | null;
  selectedToppings: ToppingInfo[];
  note: string | null;

  // Pricing
  quantity: number;
  unitPrice: number;
  subtotal: number;

  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface AddToCartRequest {
  menuItemId: string;
  menuItemSizeId?: string;
  quantity?: number;
  note?: string;
  selectedOptions?: Record<string, string>;
  selectedToppings?: { toppingId: string; quantity: number }[];
}

export interface UpdateCartRequest {
  quantity: number;
}
