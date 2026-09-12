import { useState } from "react";
import { Tabs } from "radix-ui";
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
  const activeSection = view === "product" ? "catalogue" : view === "checkout" ? "cart" : view;
  function openProduct(selectedProductId: string) { setProductId(selectedProductId); setView("product"); }
  function acceptPlacedOrder(result: MarketplaceCheckoutResult) { onOrderPlaced?.(result.order_id); }
  return <main className="health-marketplace-page"><Tabs.Root value={activeSection} onValueChange={(section) => setView(section as MarketplaceView)}><header className="marketplace-page-header"><div><p>Jorniz Health Store</p><h1>Health marketplace</h1><span>{signedInAccount.hu_coins ?? 0} HU Coins currently shown on your account</span></div><Tabs.List asChild aria-label="Marketplace sections"><nav><Tabs.Trigger value="catalogue">Catalogue</Tabs.Trigger><Tabs.Trigger value="cart">Cart</Tabs.Trigger><Tabs.Trigger value="orders">Orders</Tabs.Trigger></nav></Tabs.List></header><Tabs.Content value="catalogue">{view === "product" && productId ? <ProductDetails productId={productId} onBackToCatalogue={() => setView("catalogue")} onCartChanged={() => setCartRevision((value) => value + 1)} /> : <ProductCatalogue key={cartRevision} onOpenProduct={openProduct} onCartChanged={() => setCartRevision((value) => value + 1)} />}</Tabs.Content><Tabs.Content value="cart">{view === "checkout" ? <MarketplaceCheckout signedInAccount={signedInAccount} onBackToCart={() => setView("cart")} onOrderPlaced={acceptPlacedOrder} onRewardBalanceChanged={onRewardBalanceChanged} /> : <ShoppingCart key={cartRevision} onProceedToCheckout={() => setView("checkout")} onContinueShopping={() => setView("catalogue")} onCartChanged={() => setCartRevision((value) => value + 1)} />}</Tabs.Content><Tabs.Content value="orders"><MyOrders onRewardBalanceChanged={onRewardBalanceChanged} /></Tabs.Content></Tabs.Root></main>;
}
