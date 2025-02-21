// context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase-config";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { createNewUser } from "@/app/actions/auth";

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

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        // Cleanup existing user listener if any
        if (unsubscribeUser) {
          unsubscribeUser();
          unsubscribeUser = undefined;
        }
        return;
      }

      // Setup new user listener
      unsubscribeUser = onSnapshot(
        doc(db, "users", firebaseUser.uid),
        async (doc) => {
          if (!doc.exists()) {
            const { success, user: newUser } = await createNewUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              imageUrl: firebaseUser.photoURL || undefined,
            });

            if (success && newUser) {
              setUser({
                ...firebaseUser,
                ...newUser,
                email: firebaseUser.email || newUser.email,
              } as CombinedUser);
            }
          } else {
            const userData = doc.data() as User;
            setUser({
              ...firebaseUser,
              ...userData,
              email: firebaseUser.email || userData.email,
            } as CombinedUser);
          }
          setLoading(false);
        },
        (error) => {
          console.error("User document listener error:", error);
          // Handle error appropriately
          if (error.code === 'permission-denied') {
            setUser(null);
            setLoading(false);
          }
        }
      );
    });

    // Cleanup function
    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
