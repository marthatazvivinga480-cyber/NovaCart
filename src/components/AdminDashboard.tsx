import { useEffect, useRef, useState, type FormEvent } from "react";
import { auth } from "../firebase.ts";
import type { User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, runTransaction, writeBatch } from "firebase/firestore";
import {
  CheckCircle2,
  LoaderCircle,
  Minus,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  Package,
  Search,
} from "lucide-react";
import { db } from "../firebase.ts";
import { categories, initialProducts } from "../data/catalogue.ts";
import { isAdminUser } from "../lib/admin-config.ts";
import { money } from "../lib/commerce.ts";
import { parseProductForm } from "../lib/product-admin.ts";
import type { Product } from "../types.ts";

const updates = [["blue-floral-dress", "Blue floral dress", "Blue floral tie-strap dress"], ["brown-summer-dress", "Brown summer dress", "Brown tiered sundress"], ["white-lace-dress", "White lace dress", "White lace sundress"], ["blue-tiered-dress", "Blue tiered summer dress", "Blue ruffle-strap tiered dress"], ["blue-halter-dress", "Blue halter dress", "Sky-blue halter maxi dress"], ["milk-tea-outfit", "Milk tea top and brown skirt", "Milk Tea sweatshirt and pleated skirt"], ["red-heart-outfit", "Red heart top and skirt set", "Red heart-print shirt and skirt set"]] as const;

// Only replace the original imported names; preserve later owner edits.
export async function applyProductNameUpdates(): Promise<number> {
  if (!db || !isAdminUser(auth?.currentUser?.uid)) return 0;
  const database = db;
  return runTransaction(database, async transaction => {
    const refs = updates.map(([id]) => doc(database, "products", id));
    const snapshots = await Promise.all(refs.map(ref => transaction.get(ref)));
    let changed = 0;
    snapshots.forEach((snapshot, index) => {
      if (snapshot.exists() && snapshot.data().name === updates[index][1]) {
        transaction.update(refs[index], { name: updates[index][2] });
        changed++;
      }
    });
    return changed;
  });
}

function explain(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied")
      return "Firebase blocked the change. Publish firestore.rules and make sure your admin UID matches your signed-in account.";
    return "Could not save to Firebase. Check your connection and try again.";
  }
  return error instanceof Error
    ? error.message
    : "The change could not be saved.";
}

export default function AdminDashboard({
  user,
  loading,
  products,
  ready,
  source,
  catalogueError,
  onSignIn,
}: {
  user: User | null;
  loading: boolean;
  products: Product[];
  ready: boolean;
  source: string;
  catalogueError: string;
  onSignIn: () => void;
}) {
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [operation, setOperation] = useState<
    "save" | "import" | "delete" | null
  >(null);
  const [imported, setImported] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editorTrigger = useRef<HTMLElement | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [seedConfirm, setSeedConfirm] = useState(false);
  const [imagePath, setImagePath] = useState("");
  const [priceDraft, setPriceDraft] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setEditing(null);
    setDeleting(null);
    setSeedConfirm(false);
    setImported(false);
    setError("");
    setNotice("");
  }, [user?.uid]);
  useEffect(() => {
    if (!editing) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    formRef.current
      ?.querySelector<HTMLInputElement>("input")
      ?.focus({ preventScroll: true });
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = oldOverflow;
      editorTrigger.current?.focus({ preventScroll: true });
    };
  }, [editing]);
  useEffect(() => {
    if (!ready || loading || !isAdminUser(user?.uid) || source !== "firestore") return;
    let active = true;
    applyProductNameUpdates().then(changed => {
      if (active && changed) setNotice(`${changed} clothing product names updated. Prices were preserved.`);
    }).catch(error => {
      if (active) setError(explain(error));
    });
    return () => { active = false; };
  }, [ready, loading, user?.uid, source]);
  if (loading)
    return (
      <section className="admin-page page-width">
        <p role="status">Checking your account…</p>
      </section>
    );
  if (!user)
    return (
      <section className="admin-page page-width">
        <ShieldCheck size={30} aria-hidden="true" />
        <h1>Admin sign in</h1>
        <p>Sign in with the store owner’s account to manage products.</p>
        <button className="primary" onClick={onSignIn}>
          Sign in
        </button>
      </section>
    );
  if (!isAdminUser(user.uid))
    return (
      <section className="admin-page page-width">
        <ShieldCheck size={30} aria-hidden="true" />
        <h1>Owner access only</h1>
        <p>
          You’re signed in as a customer. Product management is available to the
          store owner.
        </p>
        <a className="primary" href="#collection">
          Continue shopping
        </a>
      </section>
    );
  const available = ready && !busy && Boolean(db);
  const run = async (
    action: () => Promise<void>,
    success: string,
    kind: "save" | "import" | "delete" = "save",
  ) => {
    if (!available) return;
    setBusy(true);
    setOperation(kind);
    setError("");
    setNotice("");
    try {
      await action();
      if (kind === "import") setImported(true);
      setNotice(success);
      setEditing(null);
      setDeleting(null);
      setSeedConfirm(false);
    } catch (error) {
      setError(explain(error));
    } finally {
      setBusy(false);
      setOperation(null);
    }
  };
  const openEditor = (product: Product | "new") => {
    editorTrigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setEditing(product);
    setPriceDraft(product === "new" ? "" : product.price.toFixed(2));
    setImagePath(product === "new" ? "" : product.image);
    setError("");
    setNotice("");
  };
  const adjustPrice = (delta: number) => {
    setPriceDraft((value) => {
      const amount = Number(value);
      const next = Math.min(
        10000000,
        Math.max(0.01, (Number.isFinite(amount) ? amount : 0) + delta),
      );
      return next.toFixed(2);
    });
  };
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!available || !db) return;
    let product: Product;
    try {
      product = parseProductForm(
        new FormData(event.currentTarget),
        editing && editing !== "new" ? editing : undefined,
      );
    } catch (error) {
      setError(explain(error));
      return;
    }
    const database = db;
    void run(async () => {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(
            new Error(
              "This picture was not found. Add the file to public/images first, and check its filename.",
            ),
          );
        image.src = product.image;
      });
      const batch = writeBatch(database);
      batch.set(doc(database, "products", product.id), product);
      batch.set(doc(database, "store", "catalogue"), {
        initialized: true,
        initializedAt: Date.now(),
      });
      await batch.commit();
    }, "Product saved to Firebase.");
  };
  const importSeeds = () => {
    if (!db) return;
    const database = db;
    void run(
      async () => {
        await runTransaction(database, async (transaction) => {
          const refs = initialProducts.map((product) =>
            doc(database, "products", product.id),
          );
          const existing = await Promise.all(
            refs.map((ref) => transaction.get(ref)),
          );
          initialProducts.forEach((product, index) => {
            if (!existing[index].exists())
              transaction.set(refs[index], product);
          });
          transaction.set(doc(database, "store", "catalogue"), {
            initialized: true,
            initializedAt: Date.now(),
          });
        });
      },
      "Import complete. Your collection is saved in Firebase; existing product edits were preserved.",
      "import",
    );
  };
  const listed = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const current = editing && editing !== "new" ? editing : undefined;
  return (
    <section className="admin-page page-width" aria-labelledby="admin-title">
      <div className="admin-heading">
        <div>
          <span className="eyebrow">NOVACART STORE OWNER</span>
          <h1 id="admin-title">Your product dashboard.</h1>
          <p>Manage the collection customers see on NovaCart.</p>
        </div>
        <span className="admin-badge">
          <ShieldCheck size={18} aria-hidden="true" /> Admin account
        </span>
      </div>
      <div className="admin-summary">
        <span>
          <Package size={20} aria-hidden="true" />
          <b>{products.length}</b> products
        </span>
        <span>
          {source === "demo"
            ? "Demo catalogue · not imported yet"
            : "Live Firebase catalogue"}
        </span>
        <a href="#collection">View storefront</a>
      </div>
      {source === "demo" && ready && (
        <p className="demo-note">
          Import your demo collection first to begin managing products in
          Firebase.
        </p>
      )}
      {!ready && !catalogueError && (
        <p role="status">Connecting to your product catalogue…</p>
      )}
      {catalogueError && (
        <p className="auth-error" role="alert">
          {catalogueError}
        </p>
      )}
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      {notice && <p className="auth-notice">{notice}</p>}
      {busy && (
        <p role="status">
          {operation === "import"
            ? "Importing products into Firebase…"
            : "Saving to Firebase…"}
        </p>
      )}
      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={17} aria-hidden="true" />
          <input
            aria-label="Search managed products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products or categories"
          />
        </label>
        <button
          className="primary"
          disabled={!available || source === "demo"}
          onClick={() => openEditor("new")}
        >
          <Plus size={17} aria-hidden="true" /> Add product
        </button>
        <button
          className="admin-secondary admin-import-button"
          disabled={!available}
          aria-busy={operation === "import"}
          onClick={() => setSeedConfirm(true)}
        >
          {operation === "import" ? (
            <LoaderCircle
              className="admin-spinner"
              size={17}
              aria-hidden="true"
            />
          ) : imported ? (
            <CheckCircle2 size={17} aria-hidden="true" />
          ) : (
            <Upload size={17} aria-hidden="true" />
          )}
          {operation === "import"
            ? "Importing…"
            : seedConfirm
              ? "Confirm import below"
              : imported
                ? "Collection imported"
                : "Import demo collection"}
        </button>
      </div>
      {seedConfirm && (
        <div className="admin-confirm">
          <p>
            Import the {initialProducts.length} demo products and their local photo paths into
            Firebase? Existing documents are kept. Previously deleted demo
            products will be restored.
          </p>
          <button
            className="primary"
            disabled={!available}
            onClick={importSeeds}
            aria-busy={operation === "import"}
          >
            {operation === "import" && (
              <LoaderCircle
                className="admin-spinner"
                size={17}
                aria-hidden="true"
              />
            )}
            {operation === "import"
              ? "Importing products…"
              : "Import missing products"}
          </button>
          <button disabled={busy} onClick={() => setSeedConfirm(false)}>
            Cancel
          </button>
        </div>
      )}
      {editing && (
        <dialog
          ref={dialogRef}
          className="admin-editor-dialog"
          aria-labelledby="admin-editor-title"
          onCancel={(event) => {
            event.preventDefault();
            if (!busy) setEditing(null);
          }}
        >
          <form
            ref={formRef}
            className="admin-editor"
            key={typeof editing === "string" ? editing : editing.id}
            onSubmit={save}
          >
            <div className="admin-editor-heading">
              <h2 id="admin-editor-title">
                {current ? `Edit ${current.name}` : "Add a product"}
              </h2>
              <button
                type="button"
                aria-label="Close product editor"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                <X size={20} />
              </button>
            </div>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <fieldset disabled={busy}>
              <div className="admin-editor-grid">
                <div>
                  <label>
                    Product name
                    <input
                      name="name"
                      required
                      maxLength={80}
                      defaultValue={current?.name}
                    />
                  </label>
                  <div className="admin-form-row">
                    <div className="admin-price-field">
                      <label htmlFor="admin-price">Price (R)</label>
                      <div className="admin-price-control">
                        <button
                          type="button"
                          aria-label="Decrease price by 1 rand"
                          onClick={() => adjustPrice(-1)}
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <input
                          id="admin-price"
                          name="price"
                          type="number"
                          inputMode="decimal"
                          required
                          min="0.01"
                          max="10000000"
                          step="0.01"
                          value={priceDraft}
                          onChange={(event) =>
                            setPriceDraft(event.target.value)
                          }
                          onFocus={(event) => event.currentTarget.select()}
                          onKeyDown={(event) => {
                            if (
                              event.key === "ArrowUp" ||
                              event.key === "ArrowDown"
                            ) {
                              event.preventDefault();
                              adjustPrice(event.key === "ArrowUp" ? 1 : -1);
                            }
                          }}
                          aria-describedby="admin-price-help"
                        />
                        <button
                          type="button"
                          aria-label="Increase price by 1 rand"
                          onClick={() => adjustPrice(1)}
                        >
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <small id="admin-price-help">
                        Type the full amount. Buttons change it by R1.
                      </small>
                    </div>
                    <label>
                      Category
                      <select
                        name="category"
                        defaultValue={current?.category ?? "Jewellery"}
                      >
                        {categories
                          .filter((category) => category !== "All")
                          .map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    Description
                    <textarea
                      name="description"
                      required
                      maxLength={500}
                      rows={4}
                      defaultValue={current?.description}
                    />
                  </label>
                  <label>
                    Product label (optional)
                    <input
                      name="tag"
                      maxLength={40}
                      defaultValue={current?.tag}
                      placeholder="e.g. New arrival"
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Picture path
                    <input
                      name="image"
                      required
                      value={imagePath}
                      onChange={(event) => setImagePath(event.target.value)}
                      placeholder="/images/products/my-picture.jpg"
                      list="admin-photo-options"
                    />
                  </label>
                  <datalist id="admin-photo-options">
                    {initialProducts.map((product) => (
                      <option value={product.image} key={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </datalist>
                  <p className="demo-note">
                    Choose an existing picture, or add a new photo to
                    public/images/products and enter its path. These files are
                    included when you deploy. Photos are not uploaded to
                    Firebase Storage.
                  </p>
                  {imagePath && (
                    <img
                      className="admin-picture-preview"
                      src={imagePath}
                      alt="Selected product preview"
                    />
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="primary"
                disabled={!available}
                aria-busy={operation === "save"}
              >
                {operation === "save" && (
                  <LoaderCircle
                    className="admin-spinner"
                    size={17}
                    aria-hidden="true"
                  />
                )}
                {operation === "save" ? "Saving product…" : "Save product"}
              </button>
            </fieldset>
          </form>
        </dialog>
      )}
      <div className="admin-products">
        {listed.length ? (
          listed.map((product) => (
            <article className="admin-product" key={product.id}>
              <img src={product.image} alt={product.name} loading="lazy" />
              <div className="admin-product-info">
                <b>{product.name}</b>
                <span>{product.category}</span>
                <strong>{money(product.price)}</strong>
              </div>
              <div className="admin-product-actions">
                <button
                  className="admin-secondary"
                  disabled={!available || source === "demo"}
                  onClick={() => openEditor(product)}
                >
                  <Pencil size={15} aria-hidden="true" /> Edit
                </button>
                {deleting === product.id ? (
                  <div className="admin-delete-confirm">
                    <span>Delete this product?</span>
                    <button
                      disabled={!available}
                      onClick={() => {
                        if (!db) return;
                        const database = db;
                        void run(
                          async () => {
                            const batch = writeBatch(database);
                            batch.delete(doc(database, "products", product.id));
                            await batch.commit();
                          },
                          "Product deleted from Firebase.",
                          "delete",
                        );
                      }}
                    >
                      Yes, delete
                    </button>
                    <button disabled={busy} onClick={() => setDeleting(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="admin-delete"
                    disabled={!available || source === "demo"}
                    onClick={() => setDeleting(product.id)}
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 size={15} aria-hidden="true" /> Delete
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <p>No matching products. Add a product or change your search.</p>
        )}
      </div>
      {notice && (
        <div className="admin-feedback" role="status">
          <CheckCircle2 size={19} aria-hidden="true" />
          <span>{notice}</span>
          <button
            aria-label="Dismiss confirmation"
            onClick={() => setNotice("")}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
