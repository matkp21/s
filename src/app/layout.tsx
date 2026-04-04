
// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Poppins, Noto_Sans_Malayalam } from 'next/font/google';
import { ClientLayoutWrapper } from '@/components/layout/client-layout-wrapper';
import Script from 'next/script';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const malayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam'],
  weight: ['400', '700'],
  variable: '--font-malayalam',
});

export const metadata: Metadata = {
  title: 'MediAssistant - Your AI Medical Partner',
  description: 'AI-powered symptom analysis, study tools for medical students, and clinical decision support for professionals.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        <Script
          type="module"
          src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${poppins.variable} ${malayalam.variable} font-sans antialiased`}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
