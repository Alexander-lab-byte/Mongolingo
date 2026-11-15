import type { Metadata, Viewport } from "next";
import "@fontsource-variable/onest";
import "@fontsource-variable/montserrat";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Yarii — Speak Mongolian, discover nomadic life",
  description:
    "Help foreigners speak Mongolian while exploring nomadic life: 48 short lessons in a seasonal ger-town, Cyrillic letters, street signs and everyday phrases.",
};

export const viewport: Viewport = {
  themeColor: "#e8dfe0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
