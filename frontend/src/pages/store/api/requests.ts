import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type {
  CancelMarketplaceOrderResult,
  MarketplaceCheckoutResult,
  MarketplaceOrder,
  MarketplaceProduct,
  ProductCategory,
  ProductDetailsResponse,
  ShoppingCartSummary,
} from "../types";

export async function loadHealthProductCatalogue(
  search = "",
  categoryId = "",
  signal?: AbortSignal,
): Promise<MarketplaceProduct[]> {
  const parameters = new URLSearchParams();
  if (search.trim()) parameters.set("search", search.trim());
  if (categoryId) parameters.set("category_id", categoryId);
  const suffix = parameters.size ? `?${parameters}` : "";
  const response = await requestJornizApi<{ products: MarketplaceProduct[] }>(
    `/api/products${suffix}`,
    { signal },
  );
  return response.products ?? [];
}

export async function loadProductCategories(signal?: AbortSignal): Promise<ProductCategory[]> {
  const response = await requestJornizApi<{ categories: ProductCategory[] }>(
    "/api/products/categories",
    { signal },
  );
  return response.categories ?? [];
}

export function loadProductDetails(productId: string, signal?: AbortSignal) {
  return requestJornizApi<ProductDetailsResponse>(
    `/api/products/${encodeURIComponent(productId)}`,
    { signal },
  );
}

export function loadShoppingCart(signal?: AbortSignal) {
  return requestJornizApi<ShoppingCartSummary>("/api/cart", { signal });
}

export function addProductToCart(productId: string, quantity = 1) {
  return requestJornizApi<{ message: string }>("/api/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export function updateCartQuantity(productId: string, quantity: number) {
  return requestJornizApi<{ message: string }>("/api/cart/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
}

export function removeProductFromCart(productId: string) {
  return requestJornizApi<{ message: string }>("/api/cart/remove", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId }),
  });
}

export function placeMarketplaceOrder(address: string, useCoins: boolean) {
  return requestJornizApi<MarketplaceCheckoutResult>("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({ address: address.trim(), use_coins: useCoins }),
  });
}

export async function loadMyOrders(signal?: AbortSignal): Promise<MarketplaceOrder[]> {
  const response = await requestJornizApi<{ orders: MarketplaceOrder[] }>(
    "/api/orders/mine",
    { signal },
  );
  return response.orders ?? [];
}

export async function loadMarketplaceOrder(orderId: string, signal?: AbortSignal) {
  const response = await requestJornizApi<{ order: MarketplaceOrder }>(
    `/api/orders/${encodeURIComponent(orderId)}`,
    { signal },
  );
  return response.order;
}

export function cancelMarketplaceOrder(orderId: string) {
  return requestJornizApi<CancelMarketplaceOrderResult>(
    `/api/orders/${encodeURIComponent(orderId)}/cancel`,
    { method: "POST" },
  );
}
