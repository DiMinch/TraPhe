import { Truck, ShieldCheck, Lock, Phone } from "lucide-react";

export const categories = [
  {
    id: 1,
    name: "Laptop",
    link: "/shop/laptop",
    image: "/images/cat-laptop.png",
    className: "bg-gray-100",
  },
  {
    id: 2,
    name: "Laptop Gaming",
    link: "/shop/laptop-gaming",
    image: "/images/cat-gaming.png",
    className: "bg-gray-100",
  },
  {
    id: 3,
    name: "Keyboard",
    link: "/shop/keyboard",
    image: "/images/cat-keyboard.png",
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
    image: "/images/prod-1.png",
    isNew: true,
    discount: "-5%",
  },
  {
    id: 2,
    name: "Laptop Gaming MSI Cyborg 15 A13UC 2082VN",
    price: 19990000,
    originalPrice: 20990000,
    rating: 5,
    image: "/images/prod-2.png",
    isNew: true,
    discount: "-5%",
  },
  {
    id: 3,
    name: "Laptop Gaming MSI Cyborg 15 A13UC 2082VN",
    price: 19990000,
    originalPrice: 20990000,
    rating: 5,
    image: "/images/prod-3.png",
    isNew: true,
    discount: "-5%",
  },
  {
    id: 4,
    name: "Laptop Gaming MSI Cyborg 15 A13UC 2082VN",
    price: 19990000,
    originalPrice: 20990000,
    rating: 5,
    image: "/images/prod-4.png",
    isNew: true,
    discount: "-5%",
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
    image: "/images/prod-placeholder.png",
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
    "/images/prod-detail-1.png",
    "/images/prod-detail-2.png",
    "/images/prod-detail-3.png",
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
