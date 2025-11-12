import type { Metadata } from "next";
import { Inter, Pacifico, Shadows_Into_Light } from "next/font/google";
import "./globals.css";
import Providers from "@/components/ThemeProviders";
import TransitionProvider from "@/components/RouteTransition";
import ThemeToggle from "@/components/ThemeToggle";

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const heading = Pacifico({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const handwriting = Shadows_Into_Light({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Meryem's Birthday Wishes",
  description: "A lavender-themed birthday surprise with memories, balloons, confetti, and a final surprise.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Meryem's Birthday Wishes",
    description: "Celebrate with memories, balloons, confetti, and a final surprise!",
    url: "/",
    siteName: "Birthday Wish",
    images: [{ url: "/favicon.ico", width: 64, height: 64, alt: "Birthday" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Meryem's Birthday Wishes",
    description: "Celebrate with memories, balloons, confetti, and a final surprise!",
    images: ["/favicon.ico"],
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${body.variable} ${heading.variable} ${handwriting.variable} antialiased`}>
        <Providers>
          <TransitionProvider>
            {children}
          </TransitionProvider>
          <ThemeToggle />
        </Providers>
      </body>
    </html>
  );
}
