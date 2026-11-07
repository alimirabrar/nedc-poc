import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEDC AI Self-Service Platform | نماء لتوزيع الكهرباء",
  description: "NEDC-2026-146 POC – Zero-core-modification conversational AI overlay on Oracle EBS HRMS (OIC / ISG / SSHR / AME), Oman PDPL compliant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
