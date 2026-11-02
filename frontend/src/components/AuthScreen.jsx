import { useState } from "react";
import { CarFront, Chrome, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignup) await signUp(name.trim(), email.trim(), password);
      else await signIn(email.trim(), password);
    } catch (authError) {
      setError(authError.message || "Unable to authenticate. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin() {
    setError("");
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(authError.message || "Demo sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark"><CarFront size={24} /></div>
        <p className="eyebrow">PARKWISE</p>
        <h1>{isSignup ? "Find your space." : "Welcome back."}</h1>
        <p className="auth-subtitle">
          {isSignup ? "Create an account to reserve your spot." : "Sign in to find and manage your parking."}
        </p>
        <p className="demo-notice">Local demo mode — no real account or password is created.</p>

        <form className="auth-form" onSubmit={submit}>
          {isSignup && (
            <label className="input-wrap">
              <UserRound size={18} />
              <input
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
              />
            </label>
          )}
          <label className="input-wrap">
            <Mail size={18} />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
            />
          </label>
          <label className="input-wrap">
            <LockKeyhole size={18} />
            <input
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (at least 6 characters)"
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" disabled={busy} type="submit">
            {busy ? <LoaderCircle className="spin" size={18} /> : null}
            {isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="divider"><span>or continue with</span></div>
        <button className="button button-secondary google-button" disabled={busy} onClick={googleLogin}>
          <Chrome size={18} /> Continue as demo driver
        </button>
        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to Parkwise?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError("");
              setMode(isSignup ? "login" : "signup");
            }}
          >
            {isSignup ? "Sign in" : "Create account"}
          </button>
        </p>
      </section>
    </main>
  );
}
