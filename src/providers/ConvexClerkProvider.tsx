"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const IS_MOCK_MODE = typeof process !== "undefined" && 
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_dGVzdC1jbGVyay1kdW1teS") ||
   process.env.NEXT_PUBLIC_CONVEX_URL?.includes("dummy-deployment-123") ||
   !process.env.NEXT_PUBLIC_CONVEX_URL);

// Only initialize Convex client if we are not in mock mode
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://dummy-url.convex.cloud";
const convex = !IS_MOCK_MODE ? new ConvexReactClient(convexUrl) : null;

function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  if (IS_MOCK_MODE) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex!} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;
