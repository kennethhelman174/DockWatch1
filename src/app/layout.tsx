
import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/AppHeader';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/AppSidebarContent';
import { ThemeProvider } from '@/components/ThemeProvider'; // Added

export const metadata: Metadata = {
  title: 'DockWatch',
  description: 'Yard management app for a distribution center.',
};

export default function RootLayout({
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
      <body className={cn("font-body antialiased text-foreground min-h-screen")}>
        <ThemeProvider storageKey="dockwatch-app-theme" defaultTheme="system">
          <SidebarProvider defaultOpen={true}> {/* Keep sidebar open by default on desktop */}
            <Sidebar collapsible="icon" variant="sidebar" side="left">
              <AppSidebarContent />
            </Sidebar>
            <SidebarInset> {/* This is the main content area that gets pushed */}
              <AppHeader />
              <main className="flex-grow container mx-auto px-4 py-8 bg-background">
                {children}
              </main>
              <Toaster />
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
