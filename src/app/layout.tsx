import type { Metadata } from "next";
import "./globals.css";
import { EMMAThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "EMMA Healthcare Admin | Medical Education Administration",
  description: "HIPAA-compliant healthcare administration platform for medical education and residency management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <EMMAThemeProvider>
          {children}
        </EMMAThemeProvider>
      </body>
    </html>
  );
}
