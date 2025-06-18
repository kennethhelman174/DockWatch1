"use client";

import * as React from 'react';
import { Bell, CircleAlert, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { NotificationMessage } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  notifications: NotificationMessage[];
}

export function NotificationBell({ notifications }: NotificationBellProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getPriorityIcon = (priority: NotificationMessage['priority']) => {
    switch (priority) {
      case 'high':
        return <CircleAlert className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <Info className="h-4 w-4 text-blue-500" />; // Consider adding 'info' to theme colors
      case 'low':
        return <Bell className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Open notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <h4 className="font-medium text-sm">Notifications</h4>
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No new notifications.</p>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getPriorityIcon(notification.priority)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                      {notification.eta && (
                         <p className="text-xs text-blue-600 mt-0.5">ETA: {new Date(notification.eta).toLocaleTimeString()}</p>
                      )}
                    </div>
                     {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground/80 mt-1 text-right">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
         {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 text-center">
              <Button variant="link" size="sm" className="text-xs">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
