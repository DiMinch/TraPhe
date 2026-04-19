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
