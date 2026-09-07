import { useState } from "react";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { MarketplaceCheckout } from "./components/MarketplaceCheckout";
import { MyOrders } from "./components/MyOrders";
import { ProductCatalogue } from "./components/ProductCatalogue";
import { ProductDetails } from "./components/ProductDetails";
import { ShoppingCart } from "./components/ShoppingCart";
import type { MarketplaceCheckoutResult, MarketplaceView } from "./types";
import "./styles.css";

export interface HealthMarketplacePageProps {
  signedInAccount: SignedInAccount;
  onRewardBalanceChanged?: (coins: number) => void;
  onOrderPlaced?: (orderId: string) => void;
}

export function HealthMarketplacePage({ signedInAccount, onRewardBalanceChanged, onOrderPlaced }: HealthMarketplacePageProps) {
  const [view, setView] = useState<MarketplaceView>("catalogue");
  const [productId, setProductId] = useState("");
  const [cartRevision, setCartRevision] = useState(0);
  function openProduct(selectedProductId: string) { setProductId(selectedProductId); setView("product"); }
  function acceptPlacedOrder(result: MarketplaceCheckoutResult) { onOrderPlaced?.(result.order_id); }
  return <main className="health-marketplace-page"><header className="marketplace-page-header"><div><p>Jorniz Health Store</p><h1>Health marketplace</h1><span>{signedInAccount.hu_coins ?? 0} HU Coins currently shown on your account</span></div><nav aria-label="Marketplace sections"><button type="button" className={view === "catalogue" || view === "product" ? "active" : ""} onClick={() => setView("catalogue")}>Catalogue</button><button type="button" className={view === "cart" || view === "checkout" ? "active" : ""} onClick={() => setView("cart")}>Cart</button><button type="button" className={view === "orders" ? "active" : ""} onClick={() => setView("orders")}>Orders</button></nav></header>{view === "catalogue" ? <ProductCatalogue key={cartRevision} onOpenProduct={openProduct} onCartChanged={() => setCartRevision((value) => value + 1)} /> : null}{view === "product" && productId ? <ProductDetails productId={productId} onBackToCatalogue={() => setView("catalogue")} onCartChanged={() => setCartRevision((value) => value + 1)} /> : null}{view === "cart" ? <ShoppingCart key={cartRevision} onProceedToCheckout={() => setView("checkout")} onContinueShopping={() => setView("catalogue")} onCartChanged={() => setCartRevision((value) => value + 1)} /> : null}{view === "checkout" ? <MarketplaceCheckout signedInAccount={signedInAccount} onBackToCart={() => setView("cart")} onOrderPlaced={acceptPlacedOrder} onRewardBalanceChanged={onRewardBalanceChanged} /> : null}{view === "orders" ? <MyOrders onRewardBalanceChanged={onRewardBalanceChanged} /> : null}</main>;
}
