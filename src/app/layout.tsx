import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Android Hub - Android Knowledge Base",
  description: "Structured knowledge notes and interview prep for Android developers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative min-h-screen">
              <Navbar />
              <main className="pb-16 md:pb-0">{children}</main>
              <MobileNav />
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
