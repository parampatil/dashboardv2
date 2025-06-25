"use client";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { createInvitation } from "@/app/actions/invitations";
import { createNewUser } from "@/app/actions/auth";
import { getAutoInviteEnabled } from "@/lib/remote-config";
import { auth, db } from "@/lib/firebase-config";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { LogIn, Lock, MailCheck, AlertCircle, ArrowLeft } from "lucide-react";
import LoginImg from "@/public/images/Login.jpg";
import Image from "next/image";

const MessageKind = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

type MessageKindType = (typeof MessageKind)[keyof typeof MessageKind];

type InviteMessage = {
  kind: MessageKindType;
  text: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isRequestEnabled, setIsRequestEnabled] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<InviteMessage | null>(
    null
  );

  const [isNotAllowed, setIsNotAllowed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAutoInviteEnabled().then(setIsRequestEnabled);
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setInviteMessage(null);
    setIsNotAllowed(false);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = user.email || "";
      setEmail(userEmail);

      // Check invitation status
      const invitesRef = collection(db, "invitations");
      const q = query(
        invitesRef,
        where("email", "==", userEmail),
        where("status", "in", ["invited", "joined", "deleted"])
      );
      const snapshot = await getDocs(q);

      let isValidInvite = false;
      if (!snapshot.empty) {
        const invite = snapshot.docs[0].data();
        if (invite.status === "deleted") {
          setInviteMessage({
            kind: MessageKind.ERROR,
            text: "Your account has been deleted. Please contact support.",
          });
        } else if (invite.status === "joined") {
          setInviteMessage({
            kind: MessageKind.WARNING,
            text: "You have already joined the platform. But your account have some problem.",
          });
        } else if (
          !invite.expiry ||
          new Date() < new Date(invite.expiry.seconds * 1000)
        ) {
          isValidInvite = true;
        } else {
          setInviteMessage({
            kind: MessageKind.ERROR,
            text: "Your invitation has expired. Please contact support.",
          });
        }
      } else {
        setInviteMessage({
          kind: MessageKind.WARNING,
          text: "You are not invited. Please contact the administrator.",
        });
      }

      if (isValidInvite) {
        // Check if user exists
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          // Create new user
          const createResponse = await createNewUser({
            uid: user.uid,
            email: user.email || "",
            name: user.displayName || user.email?.split("@")[0] || "User",
            imageUrl: user.photoURL || undefined,
          });
          if (!createResponse.success) {
            throw new Error(createResponse.message || "Failed to create user");
          }
        }
        router.push("/");
      } else {
        await signOut(auth);
        if (isRequestEnabled) {
          setShowRequest(true);
          setInviteMessage(inviteMessage);
        } else {
          setIsNotAllowed(true);
          setInviteMessage({
            kind: MessageKind.ERROR,
            text: "You are not allowed to access this platform. Please contact the administrator.",
          });
        }
      }
    } catch (err: Error | unknown) {
      const error = err as Error;
      toast({
        variant: "destructive",
        title: "Login Failed",
        description:
          error.message || "There was an error logging in with Google.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    setInviteMessage(null);
    const response = await createInvitation({ email, status: "requested" });
    if (!response.success) {
      setInviteMessage({
        kind: MessageKind.ERROR,
        text: response.message || "Failed to send request",
      });
      return;
    }
    setInviteMessage({
      kind: MessageKind.SUCCESS,
      text: "Your request has been sent successfully.",
    });
    setRequestSent(true);
  };

  // Handler to go back to login
  const handleBackToLogin = () => {
    setShowRequest(false);
    setRequestSent(false);
    setInviteMessage(null);
  };

  function getMessageClasses(kind: MessageKindType) {
    switch (kind) {
      case MessageKind.SUCCESS:
        return "bg-green-50 border-l-4 border-green-500 text-green-700";
      case MessageKind.ERROR:
        return "bg-red-50 border-l-4 border-red-500 text-red-700";
      case MessageKind.WARNING:
        return "bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800";
      case MessageKind.INFO:
        return "bg-blue-50 border-l-4 border-blue-500 text-blue-700";
      default:
        return "";
    }
  }
  return (
    <div className="w-full flex flex-grow rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-lg">
      {/* Left: Illustration/Image Side */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-600 to-blue-400 p-12"
      >
        <Image
          src={LoginImg.src}
          alt="Login Illustration"
          className="max-w-md w-full mb-8 drop-shadow-xl rounded-lg"
          layout="responsive"
          width={500}
          height={500}
        />
        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          360 Dashboards
        </h2>
        <p className="text-blue-100 text-lg text-center max-w-sm">
          Visualize, collaborate, and act on your data in real time. Secure,
          fast, and beautiful.
        </p>
      </motion.div>

      {/* Right: Login/Request Panel */}
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="w-full max-w-md"
        >
          <div className="shadow-2xl border-0 bg-white/95 backdrop-blur-lg rounded-2xl p-8">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-[#E3F2FD] p-4 rounded-full mb-4 shadow"
              >
                <Lock className="h-10 w-10 text-[#007BFF]" />
              </motion.div>
              <h1 className="text-3xl font-extrabold text-[#007BFF] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-gray-500 mt-2 text-base">
                Sign in to continue to your dashboard
              </p>
            </div>
            <div className="mt-8">
              <AnimatePresence mode="wait">
                {/* LOGIN */}
                {!showRequest && !requestSent && !isNotAllowed && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <Button
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#007BFF] to-[#00CEC8] hover:opacity-90 hover:shadow-sm text-white py-4 text-lg rounded-xl shadow-xl transition-all duration-300"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                    >
                      <LogIn className="h-5 w-5" />
                      {loading ? "Signing in..." : "Sign in with Google"}
                    </Button>
                    <div className="text-center text-gray-400 text-sm">
                      <span>By continuing, you agree to our </span>
                      <a
                        href="#"
                        className="underline hover:text-[#28A745] transition"
                      >
                        Terms of Service
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* REQUEST ACCESS */}
                {showRequest && !requestSent && (
                  <motion.div
                    key="request"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Back to Login"
                        onClick={handleBackToLogin}
                        className="hover:bg-blue-50"
                      >
                        <ArrowLeft className="h-5 w-5 text-blue-500" />
                      </Button>
                      <span className="flex-1 text-center font-semibold text-gray-700">
                        Request Access
                      </span>
                      <span className="w-10" />{" "}
                      {/* Placeholder for alignment */}
                    </div>
                    <div className="text-center">
                      <MailCheck className="h-12 w-12 text-[#007BFF] mx-auto mb-3" />
                      <p className="text-gray-600 mt-2">
                        You&apos;re requesting access for: <br />
                        <span className="font-medium text-[#007BFF]">
                          {email}
                        </span>
                      </p>
                    </div>

                    <AnimatePresence>
                      {inviteMessage && inviteMessage.text && (
                        <motion.div
                          key={inviteMessage.text}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className={`${getMessageClasses(
                            inviteMessage.kind
                          )} p-4 rounded`}
                        >
                          <p className="font-semibold text-center">
                            {inviteMessage.text}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Button
                      className="w-full bg-gradient-to-r from-[#28A745] to-[#00CEC8] hover:shadow-sm text-white py-4 text-lg rounded-xl shadow-xl hover:opacity-90 transition-all duration-300"
                      onClick={handleRequestAccess}
                    >
                      Request Access
                    </Button>
                  </motion.div>
                )}

                {/* REQUEST SENT */}
                {requestSent && (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                      <svg
                        className="h-8 w-8 text-[#28A745]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Request Submitted
                    </h3>
                    <AnimatePresence>
                      {inviteMessage && inviteMessage.text && (
                        <motion.div
                          key={inviteMessage.text}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className={`${getMessageClasses(
                            inviteMessage.kind
                          )} p-4 rounded`}
                        >
                          <p className="font-semibold text-center">
                            {inviteMessage.text}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <p className="text-gray-500">
                      You&apos;ll receive an email when your request is approved
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={handleBackToLogin}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </motion.div>
                )}

                {/* ACCESS RESTRICTED */}
                {isNotAllowed && (
                  <motion.div
                    key="not-allowed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                      <AlertCircle className="h-8 w-8 text-[#DC3545]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Access Restricted
                    </h3>
                    <AnimatePresence>
                      {inviteMessage && inviteMessage.text && (
                        <motion.div
                          key={inviteMessage.text}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className={`${getMessageClasses(
                            inviteMessage.kind
                          )} p-4 rounded`}
                        >
                          <p className="font-semibold text-center">
                            {inviteMessage.text}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <p className="text-gray-500">
                      Please contact your administrator for assistance
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Dashboard Access System</p>
            <p className="mt-1">All rights reserved</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
