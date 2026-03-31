"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";

export type UserRole = "teacher" | "director" | "utp" | "admin" | "sostenedor" | null;

interface School {
  id: string;
  name: string;
  subscription_plan?: string;
}

interface AuthState {
  user: any | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  role: UserRole;
  schools: School[];
  currentSchoolId: string | null;
  setCurrentSchoolId: (id: string | null) => void;
  individualPlan: boolean;
  schoolPlan: string;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isDirectivo: boolean;  // director, utp, admin, sostenedor
  isSostenedor: boolean; // admin, sostenedor
  isTeacher: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(null);
  const [individualPlan, setIndividualPlan] = useState(false);
  const [schoolPlan, setSchoolPlan] = useState("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored === "true") setSidebarCollapsed(true);
  }, []);

  const handleSetSidebarCollapsed = (v: boolean) => {
    setSidebarCollapsed(v);
    localStorage.setItem("sidebar_collapsed", v.toString());
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const u = session.user;
        setUser(u);
        setUserId(u.id);
        const email = u.email || "";
        setUserEmail(email);

        // Name from metadata
        const meta = u.user_metadata;
        const name = meta?.full_name || meta?.first_name || meta?.nombre || "Usuario";
        setUserName(name);

        // Fetch Role & Profile in parallel
        const [authResponse, profileResponse] = await Promise.all([
          supabase.from("authorized_users").select("role").eq("email", email).maybeSingle(),
          supabase.from("profiles").select("*").eq("id", u.id).maybeSingle()
        ]);

        const userRole: UserRole = authResponse.data?.role || (meta?.role as UserRole) || "teacher";
        setRole(userRole);

        if (profileResponse.data) {
            setIndividualPlan(profileResponse.data.individual_plan_active || false);
            const schoolId = profileResponse.data.school_id;
            
            if (schoolId) {
                const { data: schoolInfo } = await supabase
                    .from("schools")
                    .select("subscription_plan")
                    .eq("id", schoolId)
                    .maybeSingle();
                if (schoolInfo) {
                    setSchoolPlan((schoolInfo as any)?.subscription_plan || "basic");
                }
            }
        }

        // Schools for leadership
        if (userRole && ["admin", "sostenedor", "director", "utp"].includes(userRole)) {
          const { data: sData } = await supabase.from("schools").select("*");
          if (sData) {
            setSchools(sData);
            const sp = new URLSearchParams(window.location.search);
            setCurrentSchoolId(sp.get("school_id") || sData[0]?.id || null);
          }
        }

      } catch (e) {
        console.error("AuthContext critical error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setRole(null);
        setSchools([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("profeic_token");
    window.location.href = "/";
  };

  const isSuperAdmin = userEmail === "re.se.alvarez@gmail.com";
  const isDirectivo = ["admin", "director", "utp", "sostenedor"].includes(role || "");
  const isSostenedor = ["admin", "sostenedor"].includes(role || "");
  const isTeacher = role === "teacher";

  return (
    <AuthContext.Provider value={{
      user,
      userId,
      userEmail,
      userName,
      role,
      schools,
      currentSchoolId,
      setCurrentSchoolId,
      individualPlan,
      schoolPlan,
      isLoading,
      isSuperAdmin,
      isDirectivo,
      isSostenedor,
      isTeacher,
      sidebarCollapsed,
      setSidebarCollapsed: handleSetSidebarCollapsed,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

