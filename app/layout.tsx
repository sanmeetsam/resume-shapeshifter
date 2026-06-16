import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resume Shapeshifter",
  description:
    "Truthful JD-to-resume tailoring with match scoring, gap analysis, and side-by-side proof.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <AppHeader />
          {children}
          <AppFooter />
        </Providers>
      </body>
    </html>
  );
}
