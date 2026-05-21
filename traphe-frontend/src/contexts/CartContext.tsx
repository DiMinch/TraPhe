import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { cartService } from "@/services/cart.service";
import type { Cart, AddToCartRequest } from "@/types/cart.types";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

interface CartContextType {
  cart: Cart | null;
  count: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (data: AddToCartRequest) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = !!authService.getCurrentUser();

  const refreshCart = async () => {
    if (!isLoggedIn) {
      setCart(null);
      setCount(0);
      return;
    }
    setIsLoading(true);
    try {
      const res = await cartService.getCart();
      if (res.success && res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
      } else {
        setCart(null);
        setCount(0);
      }
    } catch (error) {
      console.error("Cart not found or empty session", error);
      setCart(null);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isLoggedIn]);

  const addToCart = async (data: AddToCartRequest) => {
    try {
      const res = await cartService.addToCart(data);
      if (res.success && res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
        toast.success("Đã thêm vào giỏ hàng");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Không thể thêm vào giỏ hàng");
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const res = await cartService.updateQuantity(cartItemId, quantity);
      if (res.success && res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
      }
    } catch (error) {
      toast.error("Không thể cập nhật giỏ hàng");
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const res = await cartService.removeItem(cartItemId);
      if (res.success && res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
        toast.success("Đã xóa khỏi giỏ hàng");
      }
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
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
        updateQuantity,
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
