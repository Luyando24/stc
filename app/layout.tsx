import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "STC Logistics — Freight Forwarding from China to Africa",
    template: "%s | STC Logistics",
  },
  description:
    "STC Logistics provides reliable air and sea freight forwarding services from China to Africa. Track your shipments, manage pre-alerts, and consolidate your cargo with ease.",
  keywords: [
    "freight forwarding",
    "China to Africa",
    "air freight",
    "sea freight",
    "cargo tracking",
    "consolidation",
    "logistics",
  ],
  openGraph: {
    title: "STC Logistics — Freight Forwarding from China to Africa",
    description:
      "Reliable air and sea freight forwarding services from China to Africa.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
