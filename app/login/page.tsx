// app/login/page.tsx
"use client";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";
import { useToast } from "@/hooks/use-toast"


const LoginPage = () => {
  const router = useRouter();
  const { toast } = useToast()

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check user's roles and routes
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const hasRoutes = Object.keys(userData.allowedRoutes || {}).length > 0;
        router.push(hasRoutes ? "/" : "/unauthorized");
      } else {
        router.push("/unauthorized");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "There was an error logging in with Google.",
      });
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-screen p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <Button 
        onClick={handleGoogleLogin} 
        className="w-full max-w-sm"
      >
        Login with Google
      </Button>
    </motion.div>
  );
};

export default LoginPage;
