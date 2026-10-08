import { useEffect, useRef, useState, type SetStateAction } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase.ts";
import { readStored } from "./commerce.ts";

// Each session owns its listeners and write queue; account switches cannot leak data.
export function useShoppingCollection<T>(
  uid: string | null,
  authLoading: boolean,
  name: "cart" | "wishlist",
  storageKey: string,
  empty: T,
  decode: (value: unknown) => T,
  encode: (value: T) => Record<string, unknown>,
) {
  const [state, setState] = useState<T>(empty);
  const [owner, setOwner] = useState<string | null | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const session = useRef<{
    active: boolean;
    value: T;
    ready: boolean;
    pending: number;
    revision: number;
    failed: boolean;
    queue: Promise<void>;
  } | null>(null);

  useEffect(() => {
    const current = {
      active: true,
      value: empty,
      ready: false,
      pending: 0,
      revision: 0,
      failed: false,
      queue: Promise.resolve(),
    };
    session.current = current;
    setOwner(uid);
    setState(empty);
    setReady(false);
    setSaving(false);
    setError("");
    if (authLoading)
      return () => {
        current.active = false;
      };
    if (!uid) {
      current.value = decode(readStored(storageKey, empty));
      current.ready = true;
      setState(current.value);
      setReady(true);
      return () => {
        current.active = false;
      };
    }
    if (!db)
      return () => {
        current.active = false;
      };
    const items = collection(db, "users", uid, name);
    const unsubscribe = onSnapshot(
      items,
      { includeMetadataChanges: true },
      (snapshot) => {
        if (!current.active || current.pending || current.failed) return;
        // Wait for the server before allowing edits to a possibly empty cache.
        if (!current.ready && snapshot.metadata.fromCache) return;
        const values = Object.fromEntries(
          snapshot.docs.map((item) => [
            item.id,
            name === "cart" ? item.data().quantity : true,
          ]),
        );
        current.value = decode(name === "cart" ? values : Object.keys(values));
        current.ready = true;
        setState(current.value);
        setReady(true);
      },
      () => {
        if (!current.active) return;
        current.failed = true;
        current.ready = false;
        setReady(false);
        setError(
          "Could not load your " +
            name +
            ". Check your connection and published Firestore rules, then refresh.",
        );
      },
    );
    return () => {
      current.active = false;
      unsubscribe();
    };
  }, [uid, authLoading, name, storageKey]);

  const update = (action: SetStateAction<T>) => {
    const current = session.current;
    if (
      !current?.active ||
      !current.ready ||
      current.failed ||
      owner !== uid ||
      authLoading
    )
      return false;
    const previous = current.value;
    const next =
      typeof action === "function"
        ? (action as (value: T) => T)(previous)
        : action;
    const before = encode(previous),
      after = encode(next);
    const changed = [
      ...new Set([...Object.keys(before), ...Object.keys(after)]),
    ].filter((id) => before[id] !== after[id]);
    if (changed.length > 400) {
      setError("Too many items to save at once.");
      return false;
    }
    if (!uid) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        setError(
          "Browser storage is unavailable. Your changes could not be saved.",
        );
        return false;
      }
      current.value = next;
      setState(next);
      return true;
    }
    if (!db) return false;
    const database = db;
    current.value = next;
    setState(next);
    if (!changed.length) return true;
    current.pending++;
    current.revision++;
    setSaving(true);
    current.queue = current.queue
      .then(async () => {
        if (!current.active || current.failed) return;
        const batch = writeBatch(database);
        for (const id of changed) {
          const target = doc(database, "users", uid, name, id);
          if (!(id in after)) batch.delete(target);
          else
            batch.set(
              target,
              name === "cart" ? { quantity: after[id] } : { saved: true },
            );
        }
        await batch.commit();
      })
      .catch(() => {
        if (!current.active) return;
        current.failed = true;
        current.ready = false;
        setReady(false);
        setError(
          "Your " +
            name +
            " change was not saved. Check your connection and Firestore rules, then refresh.",
        );
      })
      .finally(async () => {
        current.pending--;
        if (!current.active || current.pending) return;
        setSaving(false);
        if (current.failed) return;
        try {
          const revision = current.revision;
          const snapshot = await getDocs(
            collection(database, "users", uid, name),
          );
          if (
            !current.active ||
            current.pending ||
            current.failed ||
            revision !== current.revision
          )
            return;
          const values = Object.fromEntries(
            snapshot.docs.map((item) => [
              item.id,
              name === "cart" ? item.data().quantity : true,
            ]),
          );
          current.value = decode(
            name === "cart" ? values : Object.keys(values),
          );
          setState(current.value);
        } catch {
          /* The listener reports connection errors; committed writes remain saved. */
        }
      });
    return true;
  };
  const available = owner === uid && !authLoading;
  return {
    value: available ? state : empty,
    update,
    ready: available && ready,
    saving: available && saving,
    error: available ? error : "",
  };
}
