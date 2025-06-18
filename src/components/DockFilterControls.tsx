"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { DockStatus, DockType } from '@/types';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface DockFilters {
  type: DockType | 'all';
  availability: DockStatus | 'all';
  searchTerm: string;
}

interface DockFilterControlsProps {
  onFilterChange: (filters: DockFilters) => void;
  initialFilters?: Partial<DockFilters>;
}

export function DockFilterControls({ onFilterChange, initialFilters }: DockFilterControlsProps) {
  const [type, setType] = React.useState<DockType | 'all'>(initialFilters?.type || 'all');
  const [availability, setAvailability] = React.useState<DockStatus | 'all'>(initialFilters?.availability || 'all');
  const [searchTerm, setSearchTerm] = React.useState(initialFilters?.searchTerm || '');

  React.useEffect(() => {
    onFilterChange({ type, availability, searchTerm });
  }, [type, availability, searchTerm, onFilterChange]);

  return (
    <Card className="mb-8 shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="dock-type-filter" className="mb-1 block text-sm font-medium">Dock Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as DockType | 'all')}>
              <SelectTrigger id="dock-type-filter" className="w-full">
                <SelectValue placeholder="Filter by type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
                <SelectItem value="receiving">Receiving</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="availability-filter" className="mb-1 block text-sm font-medium">Availability</Label>
            <Select value={availability} onValueChange={(value) => setAvailability(value as DockStatus | 'all')}>
              <SelectTrigger id="availability-filter" className="w-full">
                <SelectValue placeholder="Filter by availability..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Label htmlFor="search-docks" className="mb-1 block text-sm font-medium">Search Docks</Label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/4 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-docks"
              type="search"
              placeholder="Search by number, trailer, carrier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
