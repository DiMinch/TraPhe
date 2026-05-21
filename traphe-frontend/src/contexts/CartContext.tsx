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
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface CartContextType {
  cart: Cart | null;
  count: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (data: AddToCartRequest) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openLoginPrompt: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = !!authService.getCurrentUser();

  const openLoginPrompt = () => {
    setIsLoginPromptOpen(true);
  };

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

  const addToCart = async (data: AddToCartRequest): Promise<boolean> => {
    if (!authService.getCurrentUser()) {
      openLoginPrompt();
      return false;
    }
    try {
      const res = await cartService.addToCart(data);
      if (res.success && res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.clear();
        openLoginPrompt();
      } else {
        toast.error(error.response?.data?.message || "Không thể thêm vào giỏ hàng");
      }
      return false;
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!authService.getCurrentUser()) {
      openLoginPrompt();
      return;
    }
    try {
      const res = await cartService.updateQuantity(cartItemId, quantity);
      if (res.success && res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.clear();
        openLoginPrompt();
      } else {
        toast.error("Không thể cập nhật giỏ hàng");
      }
    }
  };

  const removeItem = async (cartItemId: string) => {
    if (!authService.getCurrentUser()) {
      openLoginPrompt();
      return;
    }
    try {
      const res = await cartService.removeItem(cartItemId);
      if (res.success && res.data) {
        setCart(res.data);
        setCount(res.data.totalItems);
        toast.success("Đã xóa khỏi giỏ hàng");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.clear();
        openLoginPrompt();
      } else {
        toast.error("Không thể xóa sản phẩm");
      }
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
        openLoginPrompt,
      }}
    >
      {children}

      <Dialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
        <DialogContent className="bg-white border-[#EFE5D3] max-w-sm sm:max-w-md p-6 rounded-2xl shadow-xl">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#F5EAD8] rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-6 h-6 text-[#5C3317]" />
            </div>
            <DialogTitle className="font-serif text-2xl font-bold text-[#2C1A0E]">
              Yêu cầu đăng nhập
            </DialogTitle>
            <DialogDescription className="font-sans text-[#5C4A3C] mt-2 text-sm leading-relaxed">
              Vui lòng đăng nhập tài khoản TraPhe để thêm món vào giỏ hàng và sử dụng đầy đủ các tính năng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsLoginPromptOpen(false)}
              className="flex-grow border-[#D4C9BC] hover:border-[#A0622A] hover:bg-[#F5EAD8] text-[#4A3F35] font-medium h-11 rounded-xl cursor-pointer"
            >
              Để sau
            </Button>
            <Button
              onClick={() => {
                setIsLoginPromptOpen(false);
                navigate("/sign-in");
              }}
              className="flex-grow bg-[#5C3317] hover:bg-[#2C1A0E] text-white font-medium h-11 rounded-xl cursor-pointer"
            >
              Đăng nhập ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
