
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, CalendarDays, ClipboardPen, PackageSearch, Settings2, CircleHelp, LogOut, TruckIcon as DeliveryTruckIcon } from 'lucide-react';
// Note: TruckIcon is aliased as DeliveryTruckIcon to avoid conflict with a potential local Truck icon if any.

const mainNavItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/eta-calculator', label: 'ETA Calculator', icon: CalendarDays },
  { href: '/driver-kiosk', label: 'Driver Kiosk', icon: ClipboardPen },
  { href: '/digital-display', label: 'Digital Display', icon: PackageSearch },
];

const secondaryNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings2 },
  { href: '/help', label: 'Help & Support', icon: CircleHelp },
];

export function AppSidebarContent() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <DeliveryTruckIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">DockWatch</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  className="w-full justify-start text-base"
                  isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                  tooltip={{content: item.label, side: 'right', align: 'center', className: "ml-2" }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          {secondaryNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  className="w-full justify-start text-base"
                  isActive={pathname === item.href}
                  tooltip={{content: item.label, side: 'right', align: 'center',  className: "ml-2" }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
             <SidebarMenuButton
                className="w-full justify-start text-base"
                onClick={() => alert('Logout action placeholder')} // Placeholder for actual logout logic
                tooltip={{content: "Logout", side: 'right', align: 'center',  className: "ml-2" }}
              >
                <LogOut className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
