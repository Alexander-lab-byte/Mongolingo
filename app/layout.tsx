import type { Metadata, Viewport } from "next";
import "@fontsource-variable/onest";
import "@fontsource-variable/unbounded";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Mongolingo — Learn Mongolian, one piece at a time",
  description:
    "Easy Mongolian lessons for foreigners living in Mongolia. Learn the Cyrillic letters, read real street signs and speak everyday words. For kids, adults and grandparents.",
};

export const viewport: Viewport = {
  themeColor: "#0a0f2c",
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
