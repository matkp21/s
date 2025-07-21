// src/app/layout.tsx
// Remove "use client" - this is now a Server Component
import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google'; // Changed from Poppins
import './globals.css';
// Toaster will be rendered by ClientLayoutWrapper
// ProModeProvider will be rendered by ClientLayoutWrapper
// AppLayout will be rendered by ClientLayoutWrapper
// useEffect for SW registration will be in ClientLayoutWrapper
import { ClientLayoutWrapper } from '@/components/layout/client-layout-wrapper';

const noto_sans = Noto_Sans({ // Changed from Poppins
  subsets: ['latin', 'devanagari', 'malayalam'],
  weight: ['300', '400', '500', '600', '700'],
  // No variable needed, will apply classname directly
});

// metadata can be exported from a Server Component
export const metadata: Metadata = {
  title: 'MediAssistant',
  description: 'AI-Powered Medical Assistant',
  manifest: '/manifest.json', // PWA manifest
  applicationName: "MediAssistant",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediAssistant",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "msapplication-TileColor": "#008080", // Teal
    "msapplication-tap-highlight": "no",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA meta tags are handled by the manifest and metadata object */}
        <meta name="theme-color" content="hsl(180, 100%, 25%)" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="hsl(216, 65%, 11%)" media="(prefers-color-scheme: dark)" />
        
        {/* Script for <model-viewer> web component */}
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js" async></script>
      </head>
      <body className={`${noto_sans.className} antialiased`}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
