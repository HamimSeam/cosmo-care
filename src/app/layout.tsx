import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CosmoCare AI — Crew Health Intelligence',
  description: 'AI-powered crew health intelligence for long-duration space missions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
