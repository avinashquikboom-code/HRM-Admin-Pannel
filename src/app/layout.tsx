import type { Metadata, Viewport } from 'next';
import { Inter, Geist } from 'next/font/google';
import Providers from '@/components/Providers';
import AuthGuard from '@/components/AuthGuard';
import '../index.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HRM Platform Intelligence - Admin Console',
  description: 'Global ecosystem overview: Real-time monitoring of companies, workforce, and financial health.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col no-scrollbar">
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
