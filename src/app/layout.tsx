import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://portfolio-drab-beta-79.vercel.app";
const TITLE = "Elliah Rain Panopio — CS Student Portfolio";
const DESCRIPTION =
  "Computer Science student seeking a software or frontend internship. Projects in machine learning, Android, React, and full-stack web development.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Elliah Rain Panopio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-neutral-900">{children}</body>
    </html>
  );
}
