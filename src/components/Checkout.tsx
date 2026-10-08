import { useState } from "react";
import { CreditCard, FlaskConical, CheckCircle2 } from "lucide-react";
import type { Product, Cart } from "../types.ts";
import { money } from "../lib/commerce.ts";

export interface DemoOrder {
  id: string;
  createdAt: number;
  status: "Demo — no payment taken";
  total: number;
  items: { id: string; name: string; price: number; quantity: number }[];
}
export default function Checkout({
  products,
  cart,
  onComplete,
}: {
  products: Product[];
  cart: Cart;
  onComplete: (order: DemoOrder) => boolean;
}) {
  const [completed, setCompleted] = useState<DemoOrder | null>(null);
  const [error, setError] = useState("");
  const items = products.filter((product) => cart[product.id] > 0);
  const subtotal = items.reduce(
    (total, product) => total + product.price * cart[product.id],
    0,
  );
  const delivery = subtotal && subtotal < 1000 ? 75 : 0;
  if (completed)
    return (
      <div className="checkout-success">
        <CheckCircle2 size={42} aria-hidden="true" />
        <h2 id="modal-title">Your demo order is ready.</h2>
        <p>Reference: {completed.id}</p>
        <p className="demo-note">
          No payment was taken. This demo order is saved in this browser. View
          it in My Orders.
        </p>
      </div>
    );
  return (
    <>
      <span className="eyebrow">YOUR NOVACART CHECKOUT</span>
      <h2 id="modal-title">Checkout & payment</h2>
      <div className="demo-banner">
        <FlaskConical size={18} aria-hidden="true" />
        <span>Portfolio demo · No real payment or delivery</span>
      </div>
      {items.length ? (
        <>
          <div className="checkout-lines">
            {items.map((product) => (
              <p key={product.id}>
                <span>
                  {product.name} × {cart[product.id]}
                </span>
                <b>{money(product.price * cart[product.id])}</b>
              </p>
            ))}
          </div>
          <div className="totals">
            <p>
              <span>Subtotal</span>
              <b>{money(subtotal)}</b>
            </p>
            <p>
              <span>Demo delivery</span>
              <b>{delivery ? money(delivery) : "Free"}</b>
            </p>
            <p className="total">
              <span>Total</span>
              <b>{money(subtotal + delivery)}</b>
            </p>
          </div>
          <div className="payment-preview">
            <CreditCard size={22} aria-hidden="true" />
            <div>
              <b>Payment preview</b>
              <p>
                Stripe test payments will be enabled after the secure backend is
                connected. Do not enter card details here.
              </p>
            </div>
          </div>
          <button
            className="primary full"
            onClick={() => {
              const order: DemoOrder = {
                id: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
                createdAt: Date.now(),
                status: "Demo — no payment taken",
                total: subtotal + delivery,
                items: items.map((product) => ({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: cart[product.id],
                })),
              };
              if (onComplete(order)) setCompleted(order);
              else
                setError(
                  "Could not save this order. Your cart has been kept. Try freeing browser storage.",
                );
            }}
          >
            Place demo order
          </button>
          {error && <p role="alert">{error}</p>}
        </>
      ) : (
        <p className="demo-note">
          Your cart is empty. Add a product before checking out.
        </p>
      )}
    </>
  );
}
