import { initialProducts } from "./data/catalogue.ts";
import AdminDashboard from "./components/AdminDashboard.tsx";
import { useCatalogue } from "./lib/useCatalogue.ts";
import { isAdminUser } from "./lib/admin-config.ts";
import Contact from "./components/Contact.tsx";
import About from "./components/About.tsx";
import { useShoppingCollection } from "./lib/useShoppingCollection.ts";
import AuthPanel from "./components/AuthPanel.tsx";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase.ts";
import Checkout, { type DemoOrder } from "./components/Checkout.tsx";
import Orders from "./components/Orders.tsx";
import React, { useEffect, useRef, useState } from "react";
import Header from "./components/Header.tsx";
import Hero from "./components/Hero.tsx";
import Trending from "./components/Trending.tsx";
import ProductGrid from "./components/ProductGrid.tsx";
import Footer from "./components/Footer.tsx";
import Icon from "./components/Icon.tsx";
import Rating from "./components/Rating.tsx";

import {
  readStored,
  readCart,
  changeQuantity,
  filterProducts,
  money,
  CART_STORAGE_KEY,
  readWishlist,
  toggleWishlist,
  WISHLIST_STORAGE_KEY,
} from "./lib/commerce.ts";
import type { Cart, Category, ModalState, Panel, Product } from "./types.ts";
function CartThumbnail({ product }: { product: Product }) {
  const [source, setSource] = useState(product.image);
  const [unavailable, setUnavailable] = useState(false);
  const localPhoto = initialProducts.find(item => item.id === product.id)?.image;
  useEffect(() => { setSource(product.image); setUnavailable(false); }, [product.image]);
  if (unavailable) return <span className="cart-photo-fallback" role="img" aria-label={`${product.name}: photo unavailable`}><Icon kind="empty" size={22}/></span>;
  return <img className="cart-photo" src={source} alt={product.name} onError={() => {
    if (localPhoto && source !== localPhoto) setSource(localPhoto);
    else setUnavailable(true);
  }}/>;
}

export default function App() {
  const [pageHash, setPageHash] = useState(() => window.location.hash);
  useEffect(() => {
    const navigate = () => setPageHash(window.location.hash);
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (
        pageHash === "#about" ||
        pageHash === "#contact" ||
        pageHash === "#admin" ||
        !pageHash ||
        pageHash === "#"
      )
        window.scrollTo({ top: 0, behavior: "instant" });
      else
        document
          .getElementById(pageHash.slice(1))
          ?.scrollIntoView({ behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pageHash]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(auth));
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      (current) => {
        setUser(current);
        setAuthLoading(false);
      },
      () => {
        setAuthLoading(false);
      },
    );
  }, []);
  const catalogue = useCatalogue();
  const products = catalogue.products;
  const admin = isAdminUser(user?.uid);
  const cartSync = useShoppingCollection<Cart>(
    user?.uid ?? null,
    authLoading,
    "cart",
    CART_STORAGE_KEY,
    {},
    readCart,
    (value) => value,
  );
  const cart = cartSync.value;
  const setCart = cartSync.update;
  const [orders, setOrders] = useState<DemoOrder[]>(() => {
    const stored = readStored("nova-demo-orders", []);
    return Array.isArray(stored)
      ? stored.filter(
          (order) =>
            order &&
            typeof order.id === "string" &&
            Array.isArray(order.items) &&
            typeof order.total === "number",
        )
      : [];
  });
  const completeDemoOrder = (order: DemoOrder): boolean => {
    if (!cartSync.ready || cartSync.saving) return false;
    const next = [order, ...orders];
    try {
      localStorage.setItem("nova-demo-orders", JSON.stringify(next));
    } catch {
      return false;
    }
    setOrders(next);
    setCart({});
    return true;
  };
  const [query, setQuery] = useState("");
  const wishlistSync = useShoppingCollection<string[]>(
    user?.uid ?? null,
    authLoading,
    "wishlist",
    WISHLIST_STORAGE_KEY,
    [],
    readWishlist,
    (value) => Object.fromEntries(value.map((id) => [id, true])),
  );
  const wishlist = wishlistSync.value;
  const setWishlist = wishlistSync.update;
  const [category, setCategory] = useState<Category>("All");
  const [sort, setSort] = useState<import("./types.ts").SortOrder>("relevance");
  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState("");
  const modalRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!modal) return;
    triggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalRef.current?.querySelector<HTMLElement>("button, input")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
      if (e.key === "Tab") {
        const items = [
          ...(modalRef.current?.querySelectorAll<HTMLElement>(
            "button, input, select, textarea, a[href]",
          ) ?? []),
        ].filter((x) => !x.hasAttribute("disabled"));
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      triggerRef.current?.focus();
    };
  }, [modal]);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);
  const toast = (text: string) => {
    clearTimeout(noticeTimer.current);
    setNotice(text);
    noticeTimer.current = setTimeout(() => setNotice(""), 3000);
  };
  const add = (p: Product) => {
    if (setCart((c) => changeQuantity(c, p.id, 1)))
      toast(`${p.name} added to your cart`);
    else
      toast("Your cart is not ready. Check the status message and try again.");
  };
  const change = (id: string, delta: number) =>
    setCart((cart) => changeQuantity(cart, id, delta));
  const cartItems = products.filter((p) => cart[p.id] > 0);
  const count = cartItems.reduce((n, p) => n + cart[p.id], 0);
  const subtotal = cartItems.reduce((n, p) => n + p.price * cart[p.id], 0);
  const shipping = subtotal === 0 || subtotal >= 1000 ? 0 : 75;
  const visible = filterProducts(products, { category, query, sort });
  const savedProducts = products.filter((product) =>
    wishlist.includes(product.id),
  );
  const toggleSaved = (product: Product) => {
    if (!setWishlist((current) => toggleWishlist(current, product.id)))
      toast(
        "Your wishlist is not ready. Check the status message and try again.",
      );
  };
  const selectCategory = (value: Category) => {
    setCategory(value);
    setQuery("");
  };
  const openPanel = (panel: Panel) => {
    if (panel === "studio") {
      setModal(null);
      window.location.hash = "admin";
      return;
    }
    setModal(panel);
  };
  return (
    <>
      <Header
        isAdmin={admin}
        accountName={user?.email?.split("@")[0] ?? "Guest"}
        count={count}
        wishlistCount={savedProducts.length}
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={selectCategory}
        onOpen={openPanel}
      />
      {catalogue.error && (
        <p className="storage-warning" role="alert">
          {catalogue.error}
        </p>
      )}
      <main>
        {pageHash === "#admin" ? (
          <AdminDashboard
            user={user}
            loading={authLoading}
            products={products}
            ready={catalogue.ready}
            source={catalogue.source}
            catalogueError={catalogue.error}
            onSignIn={() => setModal("account")}
          />
        ) : pageHash === "#about" ? (
          <About onCategoryChange={selectCategory} />
        ) : pageHash === "#contact" ? (
          <Contact />
        ) : (
          <>
            <Hero onCategoryChange={selectCategory} />
            <Trending onCategoryChange={selectCategory} />
            <ProductGrid
              products={visible}
              category={category}
              onCategoryChange={selectCategory}
              query={query}
              sort={sort}
              onSortChange={setSort}
              onView={setModal}
              onAdd={add}
              wishlist={wishlist}
              onToggleWishlist={toggleSaved}
              onClear={() => {
                setQuery("");
                setCategory("All");
              }}
            />
          </>
        )}
      </main>
      <Footer onOpen={openPanel} isAdmin={admin} />
      {(cartSync.error || wishlistSync.error) && (
        <p className="storage-warning" role="alert">
          {cartSync.error || wishlistSync.error}
        </p>
      )}
      {user && !cartSync.error && !wishlistSync.error && (
        <p className="shopping-sync" role="status">
          {!cartSync.ready || !wishlistSync.ready
            ? "Loading your saved cart and wishlist…"
            : cartSync.saving || wishlistSync.saving
              ? "Saving your changes…"
              : "Cart and wishlist saved to your account."}
        </p>
      )}
      {notice && (
        <div className="toast" role="status">
          <Icon kind="check" />
          {notice}
        </div>
      )}
      {modal && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <section
            ref={modalRef}
            className={`modal ${modal === "cart" ? "cart-modal" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="close"
              onClick={() => setModal(null)}
              aria-label="Close dialog"
            >
              <Icon kind="close" />
            </button>
            {modal === "checkout" ? (
              <Checkout
                products={products}
                cart={cart}
                onComplete={completeDemoOrder}
              />
            ) : modal === "orders" ? (
              <Orders orders={orders} />
            ) : modal === "wishlist" ? (
              <>
                <div className="eyebrow">YOUR SAVED FINDS</div>
                <h2 id="modal-title">
                  My wishlist <small>({savedProducts.length})</small>
                </h2>
                {savedProducts.length ? (
                  <div className="wishlist-list">
                    {savedProducts.map((product) => (
                      <div className="wishlist-item" key={product.id}>
                        <img src={product.image} alt={product.name} />
                        <div>
                          <b>{product.name}</b>
                          <small>{money(product.price)}</small>
                          <button
                            className="add-button"
                            onClick={() => add(product)}
                          >
                            <Icon kind="plus" size={15} /> Add to cart
                          </button>
                        </div>
                        <button
                          className="heart-button is-saved"
                          aria-label={`Remove ${product.name} from wishlist`}
                          aria-pressed="true"
                          onClick={() => toggleSaved(product)}
                        >
                          <Icon kind="heart" size={19} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <Icon kind="heart" size={30} />
                    <h3>Save something you love.</h3>
                    <p>Tap a heart on any product to keep it here.</p>
                    <button className="primary" onClick={() => setModal(null)}>
                      Explore products
                    </button>
                  </div>
                )}
              </>
            ) : modal === "cart" ? (
              <>
                <div className="eyebrow">YOUR GOOD FINDS</div>
                <h2 id="modal-title">
                  Shopping cart <small>({count})</small>
                </h2>
                {cartItems.length ? (
                  <>
                    <div className="cart-list">
                      {cartItems.map((p) => (
                        <div className="cart-item" key={p.id}>
                          <CartThumbnail key={`${p.id}:${p.image}`} product={p} />
                          <div>
                            <b>{p.name}</b>
                            <small>{money(p.price)}</small>
                            <div className="quantity">
                              <button
                                aria-label={`Decrease ${p.name} quantity`}
                                onClick={() => change(p.id, -1)}
                              >
                                <Icon kind="minus" size={14} />
                              </button>
                              <span>{cart[p.id]}</span>
                              <button
                                aria-label={`Increase ${p.name} quantity`}
                                onClick={() => change(p.id, 1)}
                              >
                                <Icon kind="plus" size={14} />
                              </button>
                            </div>
                          </div>
                          <button
                            className="remove icon-label"
                            aria-label={`Remove ${p.name} from cart`}
                            onClick={() =>
                              setCart((c) => {
                                const next = { ...c };
                                delete next[p.id];
                                return next;
                              })
                            }
                          >
                            <Icon kind="trash" size={14} /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="totals">
                      <p>
                        <span>Subtotal</span>
                        <b>{money(subtotal)}</b>
                      </p>
                      <p>
                        <span>Delivery</span>
                        <b>{shipping ? money(shipping) : "Free"}</b>
                      </p>
                      <p className="total">
                        <span>Total</span>
                        <b>{money(subtotal + shipping)}</b>
                      </p>
                    </div>
                    <p className="demo-note">
                      Portfolio demo. Checkout creates a local demo order; no
                      payment is taken.
                    </p>
                    <button
                      className="primary full"
                      disabled={!cartSync.ready || cartSync.saving}
                      onClick={() => setModal("checkout")}
                    >
                      Checkout <Icon kind="arrow" />
                    </button>
                  </>
                ) : (
                  <div className="empty">
                    <Icon kind="bag" />
                    <h3>Your cart is waiting for a good find.</h3>
                    <button className="primary" onClick={() => setModal(null)}>
                      Explore the collection
                    </button>
                  </div>
                )}
              </>
            ) : modal === "account" ? (
              <AuthPanel user={user} loading={authLoading} onOrders={() => openPanel("orders")} />
            ) : modal === "studio" ? (
              <>
                <h2 id="modal-title">Product management</h2>
                <button className="primary" onClick={() => openPanel("studio")}>
                  Open dashboard
                </button>
              </>
            ) : (
              <div className="detail">
                <img src={modal.image} alt={modal.name} />
                <div>
                  <div className="eyebrow">{modal.category}</div>
                  <h2 id="modal-title">{modal.name}</h2>
                  <Rating value={modal.rating} />
                  <p>{modal.description}</p>
                  <h3>{money(modal.price)}</h3>
                  <button className="primary full" onClick={() => add(modal)}>
                    Add to cart <Icon kind="bag" />
                  </button>
                  <p className="demo-note">
                    Sample product. Images are illustrative. Free delivery on
                    orders over R1,000.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

