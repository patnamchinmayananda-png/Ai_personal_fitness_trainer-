import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ConvexClerkProvider from "@/providers/ConvexClerkProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Power House - AI Personal Fitness Trainer",
  description: "A modern fitness AI platform to get jacked for free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <Navbar />

            {/* GRID BACKGROUND */}
            <div className="fixed inset-0 -z-1">
              <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background"></div>
              <div className="absolute inset-0 bg-[linear-gradient(var(--cyber-grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--cyber-grid-color)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>

            <main className="pt-24 flex-grow">{children}</main>
            <Footer />
          </ThemeProvider>
          
          {/* Intersection Observer Scroll Fallback */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== "undefined" && !CSS.supports("(animation-timeline: view()) and (animation-range: entry)")) {
                  const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                      if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                      }
                    });
                  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
                  
                  const setupObservers = () => {
                    document.querySelectorAll(".reveal-up, .reveal-fade, .reveal-scale").forEach(el => {
                      observer.observe(el);
                    });
                  };
                  
                  if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", setupObservers);
                  } else {
                    setupObservers();
                  }
                  
                  const mutationObserver = new MutationObserver(() => {
                    setupObservers();
                  });
                  mutationObserver.observe(document.body, { childList: true, subtree: true });
                }
              `,
            }}
          />
        </body>
      </html>
    </ConvexClerkProvider>
  );
}
