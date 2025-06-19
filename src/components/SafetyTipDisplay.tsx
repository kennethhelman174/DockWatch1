
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafetyTipDisplayProps {
  tip: string | null;
  isLoading: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export function SafetyTipDisplay({ tip, isLoading, className, titleClassName, contentClassName }: SafetyTipDisplayProps) {
  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className={cn("text-lg flex items-center", titleClassName)}>
          <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
          Safety Tip of the Day
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("pt-0 pb-4", contentClassName)}>
        {isLoading && !tip ? (
          <div className="space-y-2 mt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : tip ? (
          <p className="text-sm text-muted-foreground italic mt-1">{tip}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic mt-1">Could not load safety tip.</p>
        )}
      </CardContent>
    </Card>
  );
}
