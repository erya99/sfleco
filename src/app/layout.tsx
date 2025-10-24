// src/app/layout.tsx
import type { Metadata } from "next";
import "./global.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Inter } from "next/font/google";
import type { Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f59e0b" },
    { media: "(prefers-color-scheme: dark)",  color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: "Sunflower Land ECO",
  description:
    "Marketplace fiyatlarına göre kaynakların FC/saat verimliliğini keşfet.",
  metadataBase: new URL("https://example.com"),
  icons: [{ rel: "icon", url: "/logo.png" }],
  openGraph: {
    title: "Sunflower Land ECO",
    description:
      "The most profitable trades in Sunflower Land.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.className} bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100`}>
        <Navbar />
        {children}
        <Footer />
        {/* theme init */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
  } catch(e){}
})();`,
          }}
        />
      </body>
    </html>
  );
}
