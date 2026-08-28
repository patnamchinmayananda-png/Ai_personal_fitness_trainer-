import React, { useState, useEffect } from "react";
import * as RealClerk from "@clerk/nextjs";
import Link from "next/link";

const IS_MOCK_MODE = typeof process !== "undefined" && 
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_dGVzdC1jbGVyay1kdW1teS") ||
   process.env.NEXT_PUBLIC_CONVEX_URL?.includes("dummy-deployment-123") ||
   !process.env.NEXT_PUBLIC_CONVEX_URL);

export const useUser = IS_MOCK_MODE 
  ? () => {
      const [isSignedIn, setIsSignedIn] = useState(false);
      const [user, setUser] = useState<any>(null);
      const [isLoaded, setIsLoaded] = useState(false);

      useEffect(() => {
        const loggedIn = localStorage.getItem("mock_user_logged_in") === "true";
        setIsSignedIn(loggedIn);
        if (loggedIn) {
          const storedUser = localStorage.getItem("mock_user_data");
          setUser(storedUser ? JSON.parse(storedUser) : {
            id: "user_mock123",
            firstName: "Alex",
            lastName: "Trainer",
            fullName: "Alex Trainer",
            imageUrl: "/hero-ai3.png",
            emailAddresses: [{ emailAddress: "alex.trainer@example.com" }],
            primaryEmailAddress: { emailAddress: "alex.trainer@example.com" },
          });
        }
        setIsLoaded(true);
      }, []);

      return {
        isLoaded,
        isSignedIn,
        user,
      } as unknown as ReturnType<typeof RealClerk.useUser>;
    }
  : () => {
      try {
        return RealClerk.useUser();
      } catch {
        return {
          isLoaded: false,
          isSignedIn: false,
          user: null,
        } as any;
      }
    };

export const useAuth = IS_MOCK_MODE 
  ? () => {
      const [isSignedIn, setIsSignedIn] = useState(false);
      const [userId, setUserId] = useState<string | null>(null);
      const [isLoaded, setIsLoaded] = useState(false);

      useEffect(() => {
        const loggedIn = localStorage.getItem("mock_user_logged_in") === "true";
        setIsSignedIn(loggedIn);
        if (loggedIn) {
          const storedUser = localStorage.getItem("mock_user_data");
          const parsedUser = storedUser ? JSON.parse(storedUser) : { id: "user_mock123" };
          setUserId(parsedUser.id || "user_mock123");
        }
        setIsLoaded(true);
      }, []);

      const signOut = async () => {
        localStorage.removeItem("mock_user_logged_in");
        localStorage.removeItem("mock_user_data");
        window.location.href = "/";
      };

      return {
        isLoaded,
        isSignedIn,
        userId,
        orgId: null,
        orgRole: null,
        orgSlug: null,
        getToken: async () => "mock-token-123",
        signOut
      };
    }
  : () => {
      try {
        return RealClerk.useAuth();
      } catch {
        return {
          isLoaded: false,
          isSignedIn: false,
          userId: null,
          orgId: null,
          orgRole: null,
          orgSlug: null,
          getToken: async () => null,
          signOut: async () => {}
        } as any;
      }
    };

export function SignInButton({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (IS_MOCK_MODE) {
    return (
      <Link href="/sign-in" className="inline-block">
        {children}
      </Link>
    );
  }

  if (!mounted) return <>{children}</>;
  
  return <RealClerk.SignInButton>{children}</RealClerk.SignInButton>;
}

export function SignUpButton({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (IS_MOCK_MODE) {
    return (
      <Link href="/sign-up" className="inline-block">
        {children}
      </Link>
    );
  }

  if (!mounted) return <>{children}</>;
  
  return <RealClerk.SignUpButton>{children}</RealClerk.SignUpButton>;
}

export function UserButton() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    setMounted(true);
    const loggedIn = localStorage.getItem("mock_user_logged_in") === "true";
    if (loggedIn) {
      const storedUser = localStorage.getItem("mock_user_data");
      setUser(storedUser ? JSON.parse(storedUser) : { fullName: "Alex Trainer", imageUrl: "/hero-ai3.png" });
    }
  }, []);

  if (IS_MOCK_MODE || !mounted) {
    if (!user) return null;
    return (
      <div className="relative">
        <button 
          onClick={() => setOpen(!open)}
          className="h-8 w-8 rounded-full overflow-hidden border border-primary/50 focus:outline-none hover:ring-2 hover:ring-primary transition-all cursor-pointer"
        >
          <img 
            src={user.imageUrl || "/hero-ai3.png"} 
            alt="User Profile" 
            className="h-full w-full object-cover"
          />
        </button>
        
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50 animate-fadeIn">
            <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground font-mono">
              SIGNED IN AS<br/>
              <span className="text-foreground font-semibold">{user.fullName || "Alex Trainer"}</span>
            </div>
            <button 
              onClick={() => {
                setOpen(false);
                localStorage.removeItem("mock_user_logged_in");
                localStorage.removeItem("mock_user_data");
                window.location.href = "/";
              }}
              className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors font-mono cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return <RealClerk.UserButton />;
}
