"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase-config";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

type CombinedUser = FirebaseUser & User;

interface AuthContextType {
  user: CombinedUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CombinedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast()

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        if (unsubscribeUser) unsubscribeUser();
        return;
      }

      // Listen to user document
      unsubscribeUser = onSnapshot(
        doc(db, "users", firebaseUser.uid),
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data() as User;
            setUser({
              ...firebaseUser,
              ...userData,
              email: firebaseUser.email || userData.email,
            } as CombinedUser);
          } else {
            // User document doesn't exist - handled elsewhere
            setUser(null);
            console.warn("User account does not exist");
          }
          setLoading(false);
        },
        (error) => {
          console.error("User document listener error:", error);
          setUser(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast({
        variant: "success",
        title: "Signed Out",
        description: "You have successfully signed out.",
      });
      router.push('/login');
    } catch {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "There was an error signing out.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
