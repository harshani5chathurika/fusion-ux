import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { QueryProvider } from "@/components/shared/QueryProvider";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fusion UX — AI-Powered UX Audit Platform",
    template: "%s | Fusion UX",
  },
  description:
    "Enterprise UX intelligence platform. Audit, analyze, and improve your product experience with AI-powered heuristic evaluation.",
  keywords: ["UX audit", "heuristic evaluation", "accessibility", "AI UX analysis", "enterprise UX"],
  authors: [{ name: "Fusion UX Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Fusion UX",
    title: "Fusion UX — AI-Powered UX Audit Platform",
    description: "Enterprise UX intelligence platform powered by AI",
    images: [{ url: "/logo.png", width: 1080, height: 1080, alt: "Fusion UX" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast: "rounded-xl border border-border shadow-lg",
                  title: "text-sm font-medium",
                  description: "text-xs text-muted-foreground",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
