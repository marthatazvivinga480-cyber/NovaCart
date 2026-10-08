import Icon from "./Icon.tsx";
import type { DemoOrder } from "./Checkout.tsx";
import { money } from "../lib/commerce.ts";
export default function Orders({ orders }: { orders: DemoOrder[] }) {
  return (
    <>
      <span className="eyebrow">YOUR NOVACART</span>
      <h2 id="modal-title">My Orders</h2>
      <p className="demo-note">
        Demo orders from this browser. These are not paid or fulfilled orders.
      </p>
      {orders.length ? (
        orders.map((order) => (
          <article className="order-record" key={order.id}>
            <b>{order.id}</b>
            <small>
              {new Date(order.createdAt).toLocaleDateString()} · {order.status}
            </small>
            {order.items.map((item) => (
              <p key={item.id}>
                {item.name} × {item.quantity}
              </p>
            ))}
            <strong>{money(order.total)}</strong>
          </article>
        ))
      ) : (
        <div className="empty">
          <Icon kind="empty" size={30} />
          <h3>No demo orders yet.</h3>
          <p>Add products to your cart and try checkout.</p>
        </div>
      )}
    </>
  );
}
