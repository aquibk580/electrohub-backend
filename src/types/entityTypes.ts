export interface Review {
    id: number;
    rating: number;
    content: string;
    user: User;
    productId: number;
    product: Product;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface User {
    userId: number;
    name: string;
    pfp?: string;
    email?: string;
    phone?: string;
    address?: string;
    gender?: "Male" | "Female" | "Other";
    reviews: Review[];
    orders: Array<Order>;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Admin {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Category {
    name: string;
    imageUrl: string;
    products: Product[];
    createdAt: Date;
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    offerPercentage: number;
    stock: number;
    categoryName: string;
    status: string;
    productInfo: { brand: string; details: { key: string; value: string }[] };
    images: { id: number; url: string }[];
    reviews: Array<Review> | [];
    averageRating: number;
    seller: Seller;
    orderItems: OrderItem[];
    _count: {
      orderItems: number;
    };
    createAt: Date;
    updatedAt: Date;
  }
  
  export interface Detail {
    key: string;
    value: string;
  }
  
  export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    status: string;
    paymentStatus: "Completed" | "Pending";
    product: Product;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Order {
    id: number;
    userId: number;
    user: User;
    total: number;
    createdAt: Date;
    updatedAt: Date;
    orderItems: OrderItem[];
  }
  
  export interface Seller {
    id: number;
    name: string;
    email: string;
    password: string;
    address: string;
    pfp: string;
    phone: string;
    answer: string;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    userType: "Seller" | "User";
    createdAt: Date;
    updatedAt: Date;
  }
  