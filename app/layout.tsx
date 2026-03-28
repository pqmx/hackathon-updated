import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Helio Studio",
  description: "A luminous workspace for AI-powered product storytelling.",
};

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${grotesk.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative min-h-screen bg-background text-foreground">
            <div
              className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(255,199,141,0.28),transparent_36%),radial-gradient(circle_at_82%_16%,rgba(147,197,253,0.26),transparent_34%),radial-gradient(circle_at_28%_86%,rgba(244,114,182,0.22),transparent_30%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none fixed inset-0 bg-[conic-gradient(from_120deg_at_25%_25%,rgba(255,255,255,0.14),rgba(255,255,255,0)_30%),linear-gradient(110deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_45%,rgba(255,255,255,0.16)_80%)] mix-blend-screen"
              aria-hidden
            />
            <div className="relative">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
