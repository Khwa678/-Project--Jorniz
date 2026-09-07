import { useEffect, useState, type FormEvent } from "react";
import {
  addProductToCart,
  loadHealthProductCatalogue,
  loadProductCategories,
} from "../api/requests";
import type { MarketplaceProduct, ProductCategory } from "../types";

export interface ProductCatalogueProps {
  onOpenProduct: (productId: string) => void;
  onCartChanged?: () => void;
}

function marketplaceFailureMessage(error: unknown) {
  return error instanceof Error ? error.message : "The marketplace request failed.";
}

export function ProductCatalogue({ onOpenProduct, onCartChanged }: ProductCatalogueProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [addingProductId, setAddingProductId] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [reloadNumber, setReloadNumber] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCategoryError("");
    loadProductCategories(controller.signal)
      .then(setCategories)
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) setCategoryError(marketplaceFailureMessage(loadError));
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    loadHealthProductCatalogue(search, selectedCategory, controller.signal)
      .then(setProducts)
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) setError(marketplaceFailureMessage(loadError));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [selectedCategory, reloadNumber]);

  function submitProductSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReloadNumber((value) => value + 1);
  }

  async function addCatalogueProduct(productId: string) {
    setAddingProductId(productId);
    setCartMessage("");
    setError("");
    try {
      const response = await addProductToCart(productId);
      setCartMessage(response.message);
      onCartChanged?.();
    } catch (addError) {
      setError(marketplaceFailureMessage(addError));
    } finally {
      setAddingProductId("");
    }
  }

  return (
    <section className="product-catalogue" aria-labelledby="product-catalogue-title">
      <header>
        <div>
          <p>Health marketplace</p>
          <h2 id="product-catalogue-title">Products available now</h2>
        </div>
      </header>
      <form className="product-search" role="search" onSubmit={submitProductSearch}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
        />
        <button type="submit">Search</button>
      </form>
      {categories.length > 0 ? (
        <div className="product-category-tabs" aria-label="Product category">
          <button type="button" className={!selectedCategory ? "active" : ""} onClick={() => setSelectedCategory("")}>All</button>
          {categories.map((category) => (
            <button key={category.id} type="button" className={selectedCategory === category.id ? "active" : ""} onClick={() => setSelectedCategory(category.id)}>{category.name}</button>
          ))}
        </div>
      ) : null}
      {categoryError ? <p className="marketplace-note">Categories could not be loaded: {categoryError}</p> : null}
      {cartMessage ? <p className="marketplace-confirmation">{cartMessage}</p> : null}
      {loading ? <p className="marketplace-state" aria-live="polite">Loading products...</p> : null}
      {error ? <div className="marketplace-state marketplace-error"><p>{error}</p><button type="button" onClick={() => setReloadNumber((value) => value + 1)}>Try again</button></div> : null}
      {!loading && !error && products.length === 0 ? <p className="marketplace-state">No products matched this catalogue request.</p> : null}
      {!loading && !error && products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <button className="product-card-image" type="button" onClick={() => onOpenProduct(product.id)}>
                {product.image_url ? <img src={product.image_url} alt="" loading="lazy" /> : <span>No image</span>}
              </button>
              <div>
                <p>{product.reward_coins_earn ? `${product.reward_coins_earn} HU Coins available` : "No reward amount supplied"}</p>
                <button className="product-name" type="button" onClick={() => onOpenProduct(product.id)}>{product.name}</button>
                <strong>INR {Number(product.price).toFixed(2)}</strong>
                <small>{typeof product.stock === "number" ? `${product.stock} in stock` : "Stock not supplied"}</small>
                <button type="button" disabled={addingProductId === product.id || product.stock === 0} onClick={() => void addCatalogueProduct(product.id)}>{addingProductId === product.id ? "Adding..." : "Add to cart"}</button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
