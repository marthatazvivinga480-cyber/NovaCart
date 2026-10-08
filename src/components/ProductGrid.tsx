import React, { useState } from "react";
import Icon from "./Icon.tsx";
import Rating from "./Rating.tsx";
import SortDropdown from "./SortDropdown.tsx";
import { categories } from "../data/catalogue.ts";
import { money } from "../lib/commerce.ts";

import type { Category, Product, SortOrder } from "../types.ts";
function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="image-fallback">
      {product.category}
      <small>Product photo coming soon</small>
    </span>
  ) : (
    <img
      src={product.image}
      alt={product.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

interface ProductGridProps {
  products: Product[];
  category: Category;
  query: string;
  sort: SortOrder;
  onCategoryChange: (value: Category) => void;
  onSortChange: (value: SortOrder) => void;
  onView: (product: Product) => void;
  onAdd: (product: Product) => void;
  onClear: () => void;
  wishlist: string[];
  onToggleWishlist: (product: Product) => void;
}
export default function ProductGrid({
  products,
  category,
  onCategoryChange,
  query,
  sort,
  onSortChange,
  onView,
  onAdd,
  onClear,
  wishlist,
  onToggleWishlist,
}: ProductGridProps) {
  return (
    <section
      className="collection page-width"
      id="collection"
      aria-labelledby="collection-heading"
    >
      <div className="section-title">
        <div>
          <span className="eyebrow">FIND YOUR NEXT FAVOURITE</span>
          <h2 id="collection-heading">
            {category === "All" ? "Explore the collection" : category}
          </h2>
        </div>
        <p>Considered style. Everyday prices.</p>
      </div>
      <div className="collection-tools">
        <div
          className="categories"
          role="group"
          aria-label="Filter products by category"
        >
          {categories.map((value) => (
            <button
              key={value}
              aria-pressed={category === value}
              className={category === value ? "selected" : ""}
              onClick={() => onCategoryChange(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <SortDropdown value={sort} onChange={onSortChange} />
      </div>
      <div className="results" aria-live="polite">
        <span>
          {products.length} {products.length === 1 ? "product" : "products"}
          {query.trim() && ` matching “${query.trim()}”`}
        </span>
        {query && (
          <button className="text-button" onClick={onClear}>
            Clear search
          </button>
        )}
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <article className="product" key={product.id}>
            <button
              className={`heart-button ${wishlist.includes(product.id) ? "is-saved" : ""}`}
              aria-pressed={wishlist.includes(product.id)}
              aria-label={`${wishlist.includes(product.id) ? "Remove" : "Save"} ${product.name} ${wishlist.includes(product.id) ? "from" : "to"} wishlist`}
              onClick={() => onToggleWishlist(product)}
            >
              <Icon kind="heart" size={19} />
            </button>
            <button
              className={`product-image${/\b(dress|sundress)\b/i.test(product.name) ? " product-image-full" : ""}`}
              aria-label={`View ${product.name}`}
              onClick={() => onView(product)}
            >
              <ProductImage product={product} />
              {product.tag && <span className="tag">{product.tag}</span>}
              <span className="view">
                View details <Icon kind="arrow" size={16} />
              </span>
            </button>
            <div className="product-info">
              <span className="product-category">{product.category}</span>
              <h3>
                <button onClick={() => onView(product)}>{product.name}</button>
              </h3>
              <Rating value={product.rating} />
              <p className="product-meta">
                {product.category === "Phones"
                  ? "Choose your next everyday companion"
                  : "A fresh find for your everyday"}
              </p>
              <div className="product-bottom">
                <strong>{money(product.price)}</strong>
                <button
                  className="add-button"
                  onClick={() => onAdd(product)}
                  aria-label={`Add ${product.name} to cart`}
                >
                  <Icon kind="plus" size={16} /> Add to cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!products.length && (
        <div className="empty">
          <h3>No products found.</h3>
          <p>Try another category or a different search.</p>
          <button onClick={onClear}>Show all products</button>
        </div>
      )}
    </section>
  );
}
