import type { Metadata } from "next";

import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Board",
  description: "Task management board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}