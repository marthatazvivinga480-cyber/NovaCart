// Public identifier, not a secret. Firestore rules enforce the same account restriction.
export const ADMIN_UID = "Qp14hMAgWZhaupXlBDoHh9HF3oe2";
export const isAdminUser = (uid: string | null | undefined): boolean =>
  uid === ADMIN_UID;
