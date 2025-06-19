
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Truck, Bell, Home, BarChart3, Settings } from 'lucide-react'; // Changed Package2 to Truck
import { NotificationBell } from './NotificationBell';
import { mockNotifications } from '@/constants/mockData';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/eta-calculator', label: 'ETA Calculator', icon: Truck },
  // Add more items as needed e.g.
  // { href: '/reports', label: 'Reports', icon: BarChart3 },
  // { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 shadow-sm">
      <div className="container mx-auto flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Truck className="h-6 w-6 text-primary" /> {/* Changed Package2 to Truck */}
            <span className="font-headline text-xl text-primary">DockWatch</span>
          </Link>
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
           <NotificationBell notifications={mockNotifications} />
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <Truck className="h-6 w-6 text-primary" /> {/* Changed Package2 to Truck */}
                  <span className="font-headline text-xl text-primary">DockWatch</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                      pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
