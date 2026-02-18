import type { Metadata } from "next";
import { Audiowide, Rajdhani, Outfit } from "next/font/google";
import "./globals.css";

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-audiowide",
});

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "RUMAD — Rutgers University Mobile App Development",
  description:
    "Building the future of mobile apps at Rutgers. Accelerator, Incubator, and community programs for student developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${audiowide.variable} ${rajdhani.variable} ${outfit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
