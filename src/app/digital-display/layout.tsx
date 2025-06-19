
import type { Metadata } from 'next';
import '../globals.css'; // Ensures global styles are available for this segment

export const metadata: Metadata = {
  title: 'DockWatch - Digital Display',
  description: 'Live overview of dock statuses.',
};

export default function DigitalDisplayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout is nested within the RootLayout.
  // It should not render <html>, <head>, or <body> tags.
  // The RootLayout (src/app/layout.tsx) already handles the main document structure,
  // including loading the Inter font and global CSS.
  // This component simply passes through children for the /digital-display segment.
  // The actual page content (digital-display/page.tsx) defines its own full-screen structure.
  return <>{children}</>;
}
