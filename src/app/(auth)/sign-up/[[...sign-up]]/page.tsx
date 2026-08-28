"use client";

import { SignUp } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CornerElements from "@/components/CornerElements";

const IS_MOCK_MODE = typeof process !== "undefined" && 
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_dGVzdC1jbGVyay1kdW1teS") ||
   process.env.NEXT_PUBLIC_CONVEX_URL?.includes("dummy-deployment-123") ||
   !process.env.NEXT_PUBLIC_CONVEX_URL);

const SignUpPage = () => {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("Alex Trainer");
  const [email, setEmail] = useState("alex.trainer@example.com");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMockSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("mock_user_logged_in", "true");
    localStorage.setItem("mock_user_data", JSON.stringify({
      id: "user_mock123",
      firstName: name.split(" ")[0] || "Alex",
      lastName: name.split(" ")[1] || "Trainer",
      fullName: name,
      imageUrl: "/hero-ai3.png",
      emailAddresses: [{ emailAddress: email }],
      primaryEmailAddress: { emailAddress: email },
    }));
    window.location.href = "/generate-program";
  };

  if (!mounted) return null;

  if (IS_MOCK_MODE) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center p-4">
        <Card className="relative w-full max-w-md bg-card border border-border p-6 rounded-xl shadow-2xl overflow-hidden">
          <CornerElements />
          
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider">
              Power <span className="text-primary">House</span>
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase text-muted-foreground mt-2">
              LOCAL MOCK SIGN UP (DEV MODE)
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleMockSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-2 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border rounded p-3 text-sm focus:border-primary focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-mono text-sm uppercase py-3 rounded-full"
              >
                Sign Up & Go to Generator
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full items-center justify-center">
      <SignUp />
    </main>
  );
};

export default SignUpPage;
