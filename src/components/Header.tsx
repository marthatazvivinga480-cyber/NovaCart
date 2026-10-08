import React, { useState } from "react";
import Icon from "./Icon.tsx";
import { categories } from "../data/catalogue.ts";

import type { Category, Panel } from "../types.ts";
interface HeaderProps {
  isAdmin: boolean;
  accountName: string;
  count: number;
  wishlistCount: number;
  query: string;
  category: Category;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: Category) => void;
  onOpen: (panel: Panel) => void;
}
export default function Header({
  isAdmin,
  accountName,
  count,
  wishlistCount,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  onOpen,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const chooseCategory = (value: Category) => {
    onCategoryChange(value);
    window.location.hash = "collection";
    setMenuOpen(false);
    document
      .getElementById("collection")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <header className="store-header">
      <div className="header-inner page-width">
        <a
          className="logo"
          href="#"
          onClick={() => {
            onQueryChange("");
            onCategoryChange("All");
          }}
          aria-label="NovaCart home"
        >
          <img className="brand-logo" src="/novacart-logo.svg" alt="NovaCart" />
        </a>
        <form
          className="header-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            window.location.hash = "collection";
            setMenuOpen(false);
            document
              .getElementById("collection")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <input
            aria-label="Search products"
            placeholder="Search NovaCart"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <button aria-label="Search the collection" type="submit">
            <Icon kind="search" />
          </button>
        </form>
        <div className="header-actions">
          <button
            className={`wishlist-header ${wishlistCount ? "has-saved" : ""}`}
            onClick={() => onOpen("wishlist")}
            aria-label={`Wishlist, ${wishlistCount} saved products`}
          >
            <Icon kind="heart" size={22} />
            <span>{wishlistCount}</span>
          </button>
          <button className="account-button" onClick={() => onOpen("account")}>
            <span>Welcome, {accountName}</span>
            <strong className="icon-label">
              <Icon kind="user" size={16} /> My Account{" "}
              <Icon kind="chevron" size={13} />
            </strong>
          </button>
          <button className="orders-button" onClick={() => onOpen("orders")}>
            <span>My</span>
            <strong className="icon-label">
              <Icon kind="orders" size={16} /> Orders
            </strong>
          </button>
          <button
            className="cart-button"
            onClick={() => onOpen("cart")}
            aria-label={`Cart, ${count} items`}
          >
            <span className="cart-icon">
              <Icon kind="cart" size={24} />
              <b>{count}</b>
            </span>
            <strong>Cart</strong>
          </button>
        </div>
      </div>
      <div className="subnav">
        <div className="subnav-inner page-width">
          <button
            className="all-menu"
            aria-expanded={menuOpen}
            aria-controls="category-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon kind="menu" size={18} /> All categories
          </button>
          <nav aria-label="Main navigation">
            <button onClick={() => chooseCategory("All")}>Products</button>
            <a href="#about" onClick={() => setMenuOpen(false)}>
              About
            </a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>
              Contact
            </a>
          </nav>
          {isAdmin && (
            <button className="studio-link" onClick={() => onOpen("studio")}>
              Admin dashboard <Icon kind="user" size={15} />
            </button>
          )}
          {menuOpen && (
            <div className="category-menu" id="category-menu">
              {categories.map((value) => (
                <button key={value} onClick={() => chooseCategory(value)}>
                  {value === "All" ? "Shop all products" : value}
                  <Icon kind="arrow" size={16} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="service-strip">
        <span>Style and essentials for your everyday</span>
        <span className="icon-label">
          <Icon kind="truck" size={14} /> Free delivery over R1,000
        </span>
        <span>Make every find yours</span>
      </div>
    </header>
  );
}
