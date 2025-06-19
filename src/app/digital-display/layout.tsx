import type { Metadata } from 'next';
import '../globals.css'; // Assuming globals.css is in src/app
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'DockWatch - Digital Display',
  description: 'Live overview of dock statuses.',
};

export default function DigitalDisplayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased bg-background text-foreground min-h-screen flex flex-col")}>
        <main className="flex-grow w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
