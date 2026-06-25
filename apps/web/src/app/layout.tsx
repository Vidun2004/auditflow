import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { QueryProvider } from "@/components/shared/query-provider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "AuditFlow — Enterprise Audit & Compliance",
    template: "%s | AuditFlow",
  },
  description:
    "Enterprise-grade compliance and audit management platform. Manage audits, findings, corrective actions, and compliance frameworks in one place.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
