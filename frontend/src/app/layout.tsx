import type { Metadata } from "next";
import { DM_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const mono = DM_Mono({ weight: ["300", "400", "500"], subsets: ["latin"], variable: "--font-mono" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Blindspot",
  description: "Market gap analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${serif.variable}`}>
      <body className={mono.className}>{children}</body>
    </html>
  );
}
