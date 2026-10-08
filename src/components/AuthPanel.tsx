import { isAdminUser } from "../lib/admin-config.ts";
import Icon from "./Icon.tsx";
import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { auth } from "../firebase.ts";

type Mode = "signin" | "signup" | "reset";
function messageFor(error: unknown): string {
  if (!(error instanceof FirebaseError))
    return "Something went wrong. Please try again.";
  const messages: Record<string, string> = {
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/wrong-password": "The email or password is incorrect.",
    "auth/user-not-found": "The email or password is incorrect.",
    "auth/email-already-in-use":
      "This email already has an account. Try signing in.",
    "auth/weak-password": "Choose a password with at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/network-request-failed":
      "Check your internet connection and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/operation-not-allowed":
      "Enable Email/Password in Firebase Authentication, then try again.",
    "auth/invalid-api-key":
      "Check your Firebase web configuration in .env and restart the server.",
    "auth/unauthorized-domain":
      "Add this website domain to Firebase Authentication’s authorised domains.",
  };
  return (
    messages[error.code] ??
    "Authentication could not complete. Check your Firebase settings and try again."
  );
}

export default function AuthPanel({
  user,
  loading,
}: {
  user: User | null;
  loading: boolean;
}) {
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [visible, setVisible] = useState(false);
  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setNotice("");
    setVisible(false);
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth || busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (mode === "signup" && password !== form.get("confirm")) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signin")
        await signInWithEmailAndPassword(auth, email, password);
      else if (mode === "signup")
        await createUserWithEmailAndPassword(auth, email, password);
      else {
        await sendPasswordResetEmail(auth, email);
        setNotice(
          "If an account exists for this address, you will receive a password-reset email. Check your inbox and spam folder.",
        );
      }
    } catch (error) {
      setError(messageFor(error));
    } finally {
      setBusy(false);
    }
  };
  if (loading)
    return (
      <>
        <h2 id="modal-title">My Account</h2>
        <p role="status">Checking your session…</p>
      </>
    );
  if (user)
    return (
      <>
        <span className="eyebrow">YOUR NOVACART</span>
        <h2 id="modal-title">You’re signed in.</h2>
        <p className="auth-email">{user.email}</p>
        <p className="demo-note">
          Signed in as {isAdminUser(user.uid) ? "store admin" : "customer"}.
        </p>
        <p className="demo-note">
          Your cart and wishlist sync with your Firebase account. Guest shopping
          stays separate. Demo orders are still saved in this browser.
        </p>
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="primary full"
          disabled={busy}
          onClick={async () => {
            if (!auth) return;
            setBusy(true);
            setError("");
            try {
              await signOut(auth);
            } catch (error) {
              setError(messageFor(error));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Signing out…" : "Sign out"}
          <Icon kind="logout" size={18} />
        </button>
      </>
    );
  return (
    <>
      <span className="eyebrow">WELCOME TO NOVACART</span>
      <h2 id="modal-title">
        {mode === "signup"
          ? "Create your account"
          : mode === "reset"
            ? "Reset your password"
            : "Sign in"}
      </h2>
      {mode !== "reset" && (
        <div className="auth-tabs">
          <button
            disabled={busy}
            aria-pressed={mode === "signin"}
            onClick={() => switchMode("signin")}
          >
            Sign in
          </button>
          <button
            disabled={busy}
            aria-pressed={mode === "signup"}
            onClick={() => switchMode("signup")}
          >
            Create account
          </button>
        </div>
      )}
      {!auth && (
        <p className="auth-error" role="status">
          Save your Firebase values in .env and restart npm run dev to enable
          login.
        </p>
      )}
      <form className="auth-form" key={mode} onSubmit={submit}>
        <label>
          Email address
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            disabled={busy}
          />
        </label>
        {mode !== "reset" && (
          <>
            <label>
              Password
              <div className="password-field">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  disabled={busy}
                />
                <button
                  type="button"
                  aria-label={visible ? "Hide password" : "Show password"}
                  aria-pressed={visible}
                  onClick={() => setVisible((value) => !value)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {mode === "signup" && (
              <label>
                Confirm password
                <input
                  type={visible ? "text" : "password"}
                  name="confirm"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={busy}
                />
              </label>
            )}
          </>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="auth-notice" role="status">
            {notice}
          </p>
        )}
        <button type="submit" className="primary full" disabled={!auth || busy}>
          {busy
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : mode === "reset"
                ? "Send reset email"
                : "Sign in"}
          <LogIn size={17} aria-hidden="true" />
        </button>
      </form>
      <button
        className="auth-switch"
        disabled={busy}
        onClick={() => switchMode(mode === "reset" ? "signin" : "reset")}
      >
        {mode === "reset" ? "Back to sign in" : "Forgot password?"}
      </button>
    </>
  );
}
