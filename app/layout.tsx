import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';

export const metadata: Metadata = {
  title: 'CliftonStrengths Intelligence — Discover Your Talent DNA',
  description: 'AI-powered analysis of your Gallup CliftonStrengths profile. Discover your talent DNA, find your famous matches, and unlock career paths.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-radial min-h-screen">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
