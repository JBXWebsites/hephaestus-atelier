import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const display = localFont({
  src: "../public/fonts/marcellus.woff2",
  variable: "--font-display",
  display: "swap",
});
const body = localFont({
  src: [
    { path: "../public/fonts/manrope-400.woff2", weight: "400" },
    { path: "../public/fonts/manrope-500.woff2", weight: "500" },
    { path: "../public/fonts/manrope-600.woff2", weight: "600" },
  ],
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || "hephaestus-atelier.vercel.app"}`,
  ),
  title: {
    default: "HEPHAESTUS — The Divine Atelier",
    template: "%s | HEPHAESTUS",
  },
  description:
    "A workshop beyond Olympus. Explore objects shaped by Greek myth, then forge a digital relic of your own. An independent experience by JBX Web Studio.",
  openGraph: {
    title: "HEPHAESTUS — Forged for the eternal",
    description: "Enter the atelier. Become the maker.",
    images: [{ url: "/images/hero.webp", width: 1536, height: 1024 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HEPHAESTUS — The Divine Atelier",
    images: ["/images/hero.webp"],
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
