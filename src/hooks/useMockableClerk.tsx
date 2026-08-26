import React, { useState } from "react";
import * as RealClerk from "@clerk/nextjs";

// Check if we are in mock mode based on Clerk Publishable Key in environment variables
const IS_MOCK_MODE = typeof process !== "undefined" && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_dGVzdC1jbGVyay1kdW1teS");

export const useUser = IS_MOCK_MODE 
  ? () => {
      return {
        isLoaded: true,
        isSignedIn: true,
        user: {
          id: "user_mock123",
          firstName: "Alex",
          lastName: "Trainer",
          fullName: "Alex Trainer",
          imageUrl: "/hero-ai3.png",
          emailAddresses: [{ emailAddress: "alex.trainer@example.com" }],
          primaryEmailAddress: { emailAddress: "alex.trainer@example.com" },
        } as any
      } as unknown as ReturnType<typeof RealClerk.useUser>;
    }
  : RealClerk.useUser;

export const useAuth = IS_MOCK_MODE 
  ? () => {
      return {
        isLoaded: true,
        isSignedIn: true,
        userId: "user_mock123",
        orgId: null,
        orgRole: null,
        orgSlug: null,
        getToken: async () => "mock-token-123",
        signOut: async () => console.log("Mock Sign Out clicked")
      };
    }
  : RealClerk.useAuth;

export function SignInButton({ children }: { children: React.ReactNode }) {
  if (!IS_MOCK_MODE) return <RealClerk.SignInButton>{children}</RealClerk.SignInButton>;
  
  return <div onClick={() => console.log("Mock Sign In clicked")}>{children}</div>;
}

export function SignUpButton({ children }: { children: React.ReactNode }) {
  if (!IS_MOCK_MODE) return <RealClerk.SignUpButton>{children}</RealClerk.SignUpButton>;
  
  return <div onClick={() => console.log("Mock Sign Up clicked")}>{children}</div>;
}

export function UserButton() {
  const [open, setOpen] = useState(false);
  if (!IS_MOCK_MODE) return <RealClerk.UserButton />;

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="h-8 w-8 rounded-full overflow-hidden border border-primary/50 focus:outline-none hover:ring-2 hover:ring-primary transition-all"
      >
        <img 
          src="/hero-ai3.png" 
          alt="User Profile" 
          className="h-full w-full object-cover"
        />
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50 animate-fadeIn">
          <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground font-mono">
            SIGNED IN AS<br/>
            <span className="text-foreground font-semibold">Alex Trainer</span>
          </div>
          <button 
            onClick={() => {
              setOpen(false);
              alert("Mock Mode: Sign out clicked");
            }}
            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors font-mono"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
