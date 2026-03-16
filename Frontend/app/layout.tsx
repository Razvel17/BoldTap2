import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500','600','700','800','900'] });

export const metadata: Metadata = {
  title: "BoldTap - Next Generation Digital Business Cards",
  description: "Build lasting connections and effortlessly share more about yourself in one tap, physically and virtually.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
