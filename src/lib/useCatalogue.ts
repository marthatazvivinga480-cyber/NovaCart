import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.ts";
import { initialProducts } from "../data/catalogue.ts";
import { isProduct } from "./commerce.ts";
import type { Product } from "../types.ts";

export function useCatalogue() {
  const [remote, setRemote] = useState<Product[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(!db);
  const [settingsLoaded, setSettingsLoaded] = useState(!db);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!db) return;
    const fail = () =>
      setError(
        "Products could not load from Firebase. Check your connection and published rules, then refresh.",
      );
    const stopProducts = onSnapshot(
      collection(db, "products"),
      { includeMetadataChanges: true },
      (snapshot) => {
        const valid = snapshot.docs
          .map((item) => ({ ...item.data(), id: item.id }))
          .filter(isProduct);
        setRemote(
          valid.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)),
        );
        if (!snapshot.metadata.fromCache) setProductsLoaded(true);
      },
      fail,
    );
    const stopSettings = onSnapshot(
      doc(db, "store", "catalogue"),
      { includeMetadataChanges: true },
      (snapshot) => {
        setInitialized(snapshot.data()?.initialized === true);
        if (!snapshot.metadata.fromCache) setSettingsLoaded(true);
      },
      fail,
    );
    return () => {
      stopProducts();
      stopSettings();
    };
  }, []);
  const ready = productsLoaded && settingsLoaded && !error;
  const source = initialized || remote.length > 0 ? "firestore" : "demo";
  return {
    products: source === "firestore" ? remote : initialProducts,
    remote,
    ready,
    source,
    error,
  };
}
