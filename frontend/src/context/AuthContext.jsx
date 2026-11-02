import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);
const SESSION_KEY = "parkwise-demo-user";

function createDemoUser(email, displayName = "") {
  const normalizedEmail = email.trim().toLowerCase();
  return {
    uid: `demo-${encodeURIComponent(normalizedEmail)}`,
    email: normalizedEmail,
    displayName: displayName.trim(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(SESSION_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  function startDemoSession(nextUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        if (!email.trim() || password.length < 6) {
          throw new Error("Enter an email address and a password of at least 6 characters.");
        }
        return startDemoSession(createDemoUser(email));
      },
      signUp: async (name, email, password) => {
        if (!name.trim() || !email.trim() || password.length < 6) {
          throw new Error("Enter your name, email, and a password of at least 6 characters.");
        }
        return startDemoSession(createDemoUser(email, name));
      },
      signInWithGoogle: async () => startDemoSession(createDemoUser("driver@example.com", "Demo Driver")),
      signOut: async () => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
