import { useQuery as useRealQuery } from "convex/react";
import { getMockPlans } from "@/lib/mockStore";

const IS_MOCK_MODE = typeof process !== "undefined" && 
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_dGVzdC1jbGVyay1kdW1teS") ||
   process.env.NEXT_PUBLIC_CONVEX_URL?.includes("dummy-deployment-123") ||
   !process.env.NEXT_PUBLIC_CONVEX_URL);

export const useQuery = (IS_MOCK_MODE
  ? (queryFunc: any, args?: any) => {
      const functionNameSymbol = Symbol.for("functionName");
      const pathStr = (queryFunc && typeof queryFunc === "object") 
        ? String((queryFunc as any)[functionNameSymbol] || "") 
        : "";
      
      console.log("[Convex Mock] useQuery resolved path:", pathStr, "args:", args);

      if (pathStr.includes("getUserPlans")) {
        const userId = args?.userId || "user_mock123";
        const plans = getMockPlans(userId);
        console.log("[Convex Mock] Returning plans:", plans);
        return plans;
      }
      return undefined;
    }
  : useRealQuery) as typeof useRealQuery;
