import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const serif = IBM_Plex_Serif({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Blindspot",
  description: "Market gap analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(serif.variable, "font-sans", geist.variable)}>
      <body className={geist.className}>{children}</body>
    </html>
  );
}
