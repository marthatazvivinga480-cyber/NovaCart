import React from "react";
import Icon from "./Icon.tsx";
import { categories, categoryImages } from "../data/catalogue.ts";

import type { Category } from "../types.ts";
export default function Hero({
  onCategoryChange,
}: {
  onCategoryChange: (value: Category) => void;
}) {
  return (
    <>
      <section className="hero hero-neutral" aria-labelledby="hero-title">
        <img
          className="hero-background"
          src="/images/hero-neutral-clothing.jpg"
          alt="Neutral cream and white clothing arranged on a minimalist rack"
        />
        <div className="hero-shade" />
        <div className="hero-orbits" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="hero-content page-width">
          <span className="eyebrow">THE EVERYDAY EDIT</span>
          <h1 id="hero-title">
            Your style.
            <br />
            Your everyday.
          </h1>
          <p>
            Jewellery, fashion, sneakers and phones.
            <br />
            Find something for everyone, in one place.
          </p>
          <a
            className="primary"
            href="#collection"
            onClick={() => onCategoryChange("All")}
          >
            Shop the collection <Icon kind="arrow" size={18} />
          </a>
        </div>
        <span className="hero-note">NEW SEASON · NEW POSSIBILITIES</span>
      </section>
      <section
        className="category-section page-width"
        aria-labelledby="category-heading"
      >
        <div className="section-title">
          <h2 id="category-heading">Shop by category</h2>
          <a href="#collection" onClick={() => onCategoryChange("All")}>
            Explore all <Icon kind="arrow" size={16} />
          </a>
        </div>
        <div className="category-grid">
          {categories.slice(1).map((category) => (
            <a
              key={category}
              href="#collection"
              className="category-tile"
              onClick={() => onCategoryChange(category)}
            >
              <h3>{category}</h3>
              <div className="category-photo">
                <img
                  src={categoryImages[category as Exclude<Category, "All">]}
                  alt=""
                  loading="lazy"
                />
              </div>
              <span>
                Shop now <Icon kind="arrow" size={16} />
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
