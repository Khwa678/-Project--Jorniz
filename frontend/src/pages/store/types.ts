export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category_id?: string;
  stock?: number;
  rating?: number;
  reward_coins_earn?: number;
}

export interface ProductDetailsResponse {
  product: MarketplaceProduct;
  related_products?: MarketplaceProduct[];
  frequently_bought_together?: MarketplaceProduct[];
}

export interface ShoppingCartItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  image_url?: string;
  description?: string;
  stock?: number;
  reward_coins_earn?: number;
}

export interface ShoppingCartSummary {
  items: ShoppingCartItem[];
  total: number;
  hu_coins_balance: number;
  max_coins_redeemable?: number;
  max_coin_discount?: number;
  estimated_coin_discount?: number;
}

export interface MarketplaceCheckoutResult {
  message: string;
  order_id: string;
  total_amount: number;
  coins_spent: number;
  coins_discount: number;
  coins_earned: number;
  gateway_spent: number;
  status: string;
  new_hu_coins: number;
}

export interface MarketplaceOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  name?: string;
  image_url?: string;
  description?: string;
}

export interface MarketplaceOrder {
  id: string;
  user_id?: string;
  total_amount: number;
  wallet_spent?: number;
  gateway_spent?: number;
  coins_spent?: number;
  coins_discount?: number;
  coins_earned?: number;
  status: string;
  refund_status?: string;
  shipping_address?: string;
  payment_method?: string;
  created_at?: string;
  items?: MarketplaceOrderItem[];
  tracking_timeline?: Array<{ step: string; status: string; date?: string }>;
}

export interface CancelMarketplaceOrderResult {
  message: string;
  order_id: string;
  refunded_coins: number;
  reversed_coins: number;
  new_hu_coins: number;
}

export type MarketplaceView = "catalogue" | "product" | "cart" | "checkout" | "orders";
