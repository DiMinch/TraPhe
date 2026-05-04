import { Truck, ShieldCheck, Lock, Phone } from "lucide-react";

export const categories = [
  {
    id: 1,
    name: "Laptop",
    link: "/shop/laptop",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
    className: "bg-gray-100",
  },
  {
    id: 2,
    name: "Laptop Gaming",
    link: "/shop/laptop-gaming",
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60",
    className: "bg-gray-100",
  },
  {
    id: 3,
    name: "Keyboard",
    link: "/shop/keyboard",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=500&auto=format&fit=crop&q=60",
    className: "bg-gray-100",
  },
];

export const newArrivals = [
  {
    id: 1,
    name: "Laptop Gaming MSI Cyborg 15 A13UC 2082VN",
    price: 19990000,
    originalPrice: 20990000,
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop&q=60",
    isNew: true,
    discount: "-5%",
  },
  {
    id: 2,
    name: "MacBook Pro 14 M2 Pro 2023",
    price: 45990000,
    originalPrice: 48990000,
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60",
    isNew: true,
    discount: "-5%",
  },
  {
    id: 3,
    name: "Keychron K2 Pro Mechanical Keyboard",
    price: 2490000,
    originalPrice: 2990000,
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60",
    isNew: true,
    discount: "-15%",
  },
  {
    id: 4,
    name: "Logitech G Pro X Superlight",
    price: 2990000,
    originalPrice: 3500000,
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60",
    isNew: true,
    discount: "-10%",
  },
];

export const features = [
  {
    title: "Free Shipping",
    description: "Order above $200",
    icon: Truck,
  },
  {
    title: "Money-back",
    description: "30 days guarantee",
    icon: ShieldCheck,
  },
  {
    title: "Secure Payments",
    description: "Secured by Stripe",
    icon: Lock,
  },
  {
    title: "24/7 Support",
    description: "Phone and Email support",
    icon: Phone,
  },
];

export const shopCategories = [
  "All",
  "Laptop",
  "Laptop Gaming",
  "PC GVN",
  "Main, CPU, VGA",
  "Headphone",
  "Keyboard",
];

export const shopPrices = [
  "All Price",
  "0 - 1.000.000 ₫",
  "1.000.000 - 5.000.000 ₫",
  "5.000.000 - 20.000.000 ₫",
  "20.000.000 - 35.000.000 ₫",
  "35.000.000 ₫+",
];

export const shopProducts = Array(12)
  .fill(null)
  .map((_, i) => ({
    id: i + 100,
    name: `Laptop Gaming MSI Cyborg 15 A13UC 2082VN ${i + 1}`,
    price: 19990000,
    originalPrice: 20990000,
    rating: 5,
    image:
      i % 2 === 0
        ? "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1588872657578-a83a04a3a5f9?w=500&auto=format&fit=crop&q=60",
    isNew: i % 3 === 0,
    discount: i % 2 === 0 ? "-50%" : undefined,
  }));

export const productDetail = {
  id: 1,
  name: "Laptop Gaming MSI Cyborg 15 A13UC 2082VN",
  price: 19990000,
  originalPrice: 20990000,
  discount: "5%",
  description:
    "MSI Cyborg 15 A13UC 2082VN is the latest gaming laptop with high performance...",
  images: [
    "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1531297461136-82lw8420e5c9?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&auto=format&fit=crop&q=60",
  ],
  specs: [
    { label: "CPU", value: "Intel Core i5-13420H" },
    { label: "RAM", value: "8GB DDR5 5200MHz" },
    { label: "Storage", value: "512GB NVMe PCIe Gen4x4 SSD" },
    { label: "VGA", value: "NVIDIA GeForce RTX 3050 4GB GDDR6" },
    { label: "Display", value: "15.6 inch FHD (1920*1080), 144Hz, IPS-Level" },
    { label: "Battery", value: "3-Cell, 53.5 Battery (Whr)" },
    { label: "Weight", value: "1.98 kg" },
    { label: "Color", value: "Translucent Black" },
    { label: "OS", value: "Windows 11 Home" },
  ],
};

export const cartItems = [
  {
    id: 1,
    name: "Laptop Gaming MSI Cyborg 15 A13UC 2082VN",
    price: 19990000,
    quantity: 1,
    color: "Black",
    image:
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    name: "Keychron K2 Pro Mechanical Keyboard",
    price: 2490000,
    quantity: 2,
    color: "Black",
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    name: "Logitech G Pro X Superlight",
    price: 2990000,
    quantity: 1,
    color: "White",
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60",
  },
];

export const userProfile = {
  firstName: "Thu",
  lastName: "Pham Ha Anh",
  displayName: "Ha Thu",
  email: "thu.phamhaanh@gmail.com",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60",
};

export const userAddresses = [
  {
    id: 1,
    title: "Billing Address",
    name: "Ha Thu",
    phone: "(+84) 909 123 456",
    address: "123 Nguyen Van Linh, District 7, Ho Chi Minh City, Vietnam",
    isDefault: true,
  },
  {
    id: 2,
    title: "Shipping Address",
    name: "Ha Thu",
    phone: "(+84) 909 123 456",
    address: "456 Le Duan, District 1, Ho Chi Minh City, Vietnam",
    isDefault: false,
  },
];

export const userOrders = [
  {
    id: "#3456_768",
    date: "October 17, 2023",
    status: "Delivered",
    total: 12000000,
  },
  {
    id: "#3456_980",
    date: "October 11, 2023",
    status: "Processing",
    total: 3450000,
  },
  {
    id: "#3456_120",
    date: "August 24, 2023",
    status: "Delivered",
    total: 23450000,
  },
];
