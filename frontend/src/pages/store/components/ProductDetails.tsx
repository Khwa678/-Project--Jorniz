import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { addProductToCart, loadProductDetails } from "../api/requests";
import type { ProductDetailsResponse } from "../types";

export interface ProductDetailsProps {
  productId: string;
  onBackToCatalogue: () => void;
  onCartChanged?: () => void;
}

function productDetailsFailure(error: unknown) {
  return error instanceof Error ? error.message : "Product details could not be loaded.";
}

export function ProductDetails({ productId, onBackToCatalogue, onCartChanged }: ProductDetailsProps) {
  const [details, setDetails] = useState<ProductDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [reloadNumber, setReloadNumber] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setDetails(null);
    loadProductDetails(productId, controller.signal)
      .then(setDetails)
      .catch((loadError: unknown) => { if (!controller.signal.aborted) setError(productDetailsFailure(loadError)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [productId, reloadNumber]);

  async function addDetailedProduct() {
    setAdding(true); setMessage(""); setError("");
    try { const response = await addProductToCart(productId); setMessage(response.message); onCartChanged?.(); }
    catch (addError) { setError(productDetailsFailure(addError)); }
    finally { setAdding(false); }
  }

  return <section className="product-details"><Button className="marketplace-back" variant="ghost" size="small" onClick={onBackToCatalogue}>Back to catalogue</Button>{loading ? <p className="marketplace-state">Loading product details...</p> : null}{error ? <div className="marketplace-state marketplace-error"><p>{error}</p><Button size="small" onClick={() => setReloadNumber((value) => value + 1)}>Try again</Button></div> : null}{details ? <><div className="product-details-main"><div className="product-details-image">{details.product.image_url ? <img src={details.product.image_url} alt="" /> : <span>No image supplied</span>}</div><div><p className="product-details-category">Product details</p><h2>{details.product.name}</h2>{details.product.description ? <p>{details.product.description}</p> : <p>No description was supplied.</p>}<strong className="product-details-price">INR {Number(details.product.price).toFixed(2)}</strong><p>{typeof details.product.stock === "number" ? `${details.product.stock} units in stock` : "Stock was not supplied."}</p><p>{details.product.reward_coins_earn ? `Earn ${details.product.reward_coins_earn} HU Coins for each item.` : "No reward amount was supplied."}</p><Button disabled={adding || details.product.stock === 0} onClick={() => void addDetailedProduct()}>{adding ? "Adding..." : "Add to cart"}</Button>{message ? <p className="marketplace-confirmation">{message}</p> : null}</div></div>{details.related_products?.length ? <div className="related-products"><h3>Related products from the catalogue</h3>{details.related_products.map((product) => <article className="related-product-card" key={product.id}><strong>{product.name}</strong><span>INR {Number(product.price).toFixed(2)}</span></article>)}</div> : null}</> : null}</section>;
}
