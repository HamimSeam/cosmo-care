import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CosmoCare AI — Crew Health Intelligence',
  description: 'AI-powered crew health intelligence for long-duration space missions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
