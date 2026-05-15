import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShopFoto AI",
  description: "Produktfotos automatisch freistellen und für den Shop optimieren."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
