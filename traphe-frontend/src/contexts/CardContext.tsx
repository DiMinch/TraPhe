import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { cartService } from "@/services/cart.service";
import type { Cart } from "@/types/cart.types";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

interface CartContextType {
  cart: Cart | null;
  count: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  incrementItem: (variantId: string) => Promise<void>;
  decrementItem: (variantId: string) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = !!authService.getCurrentUser();

  const refreshCart = async () => {
    if (!isLoggedIn) return; // Nếu chưa login, có thể dùng local storage (tùy logic), ở đây giả sử chỉ call API

    setIsLoading(true);
    try {
      const res = await cartService.getCart();
      if (res.statusCode === 200 && res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
      }
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isLoggedIn]);

  const addToCart = async (variantId: string, quantity = 1) => {
    if (!isLoggedIn) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await cartService.addToCart({ productVariantId: variantId, quantity });
      await refreshCart();
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const incrementItem = async (variantId: string) => {
    try {
      const res = await cartService.incrementItem(variantId);
      if (res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
      }
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const decrementItem = async (variantId: string) => {
    try {
      const res = await cartService.decrementItem(variantId);
      if (res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
      }
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const removeItem = async (variantId: string) => {
    try {
      const res = await cartService.removeItem(variantId);
      if (res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
        toast.success("Item removed");
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
      setCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        isLoading,
        refreshCart,
        addToCart,
        incrementItem,
        decrementItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
