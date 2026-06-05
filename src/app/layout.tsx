import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import Nav from "@/components/Nav";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nutrify — What to cook, how much to eat",
  description:
    "Tell Nutrify what's in your fridge and your goal. Get recipes that fit your plan, with macros and smart substitutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased`}>
        <AppProvider>
          <Nav />
          <main className="min-h-screen">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
