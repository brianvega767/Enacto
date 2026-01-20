import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true); // auth
  const [profileLoading, setProfileLoading] = useState(true); // profile

  const loadSession = useCallback(async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
      setProfile(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadSession]);

  // =========================
  // PERFIL (profiles)
  // =========================
  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    const loadProfile = async () => {
      setProfileLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!error) {
        setProfile(data || null);
      } else {
        setProfile(null);
      }

      setProfileLoading(false);
    };

    loadProfile();
  }, [user?.id]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        syncSession: loadSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
