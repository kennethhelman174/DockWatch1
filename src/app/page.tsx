
"use client";

import * as React from 'react';
import { DockList } from '@/components/DockList';
import { DockFilterControls, type DockFilters } from '@/components/DockFilterControls';
import { DockDetailsModal } from '@/components/DockDetailsModal';
import { allMockDocks as importedAllMockDocks } from '@/constants/mockData';
import type { Dock } from '@/types';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const [filters, setFilters] = React.useState<DockFilters>({
    type: 'all',
    availability: 'all',
    searchTerm: '',
  });
  const [selectedDock, setSelectedDock] = React.useState<Dock | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [clientDocks, setClientDocks] = React.useState<Dock[]>([]);

  React.useEffect(() => {
    setClientDocks(importedAllMockDocks);
  }, []);

  const handleFilterChange = React.useCallback((newFilters: DockFilters) => {
    setFilters(newFilters);
  }, []);

  const handleDockClick = (dock: Dock) => {
    setSelectedDock(dock);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDock(null);
  };

  const handleUpdateDock = React.useCallback((updatedData: Pick<Dock, 'id' | 'status' | 'notes'>) => {
    setClientDocks(prevDocks =>
      prevDocks.map(d => {
        if (d.id === updatedData.id) {
          const newDockData: Partial<Dock> = {
            notes: updatedData.notes,
            status: updatedData.status,
          };
          if (updatedData.status === 'available') {
            newDockData.currentCarrier = undefined;
            newDockData.currentTrailer = undefined;
            // Potentially clear scheduledAppointments if status becomes 'available' based on business logic
            // For now, keep them as they might be future appointments.
          }
          
          const newDock = { ...d, ...newDockData };

          if (selectedDock && selectedDock.id === newDock.id) {
            setSelectedDock(newDock);
          }
          return newDock;
        }
        return d;
      })
    );
  }, [selectedDock]);


  const filteredDocks = React.useMemo(() => {
    return clientDocks.filter((dock) => {
      const typeMatch = filters.type === 'all' || dock.type === filters.type;
      const availabilityMatch = filters.availability === 'all' || dock.status === filters.availability;
      const searchTermMatch =
        filters.searchTerm === '' ||
        dock.number.toString().includes(filters.searchTerm.toLowerCase()) ||
        dock.currentCarrier?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        dock.currentTrailer?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      return typeMatch && availabilityMatch && searchTermMatch;
    });
  }, [filters, clientDocks]);

  const shippingDocksToDisplay = filters.type === 'receiving' ? [] : filteredDocks.filter(d => d.type === 'shipping');
  const receivingDocksToDisplay = filters.type === 'shipping' ? [] : filteredDocks.filter(d => d.type === 'receiving');


  return (
    <div className="space-y-8">
      <DockFilterControls onFilterChange={handleFilterChange} />

      {(filters.type === 'all' || filters.type === 'shipping') && (
        <DockList
          docks={shippingDocksToDisplay}
          title="Shipping Docks (100-129)"
          onDockClick={handleDockClick}
        />
      )}

      {filters.type === 'all' && <Separator className="my-8" />}
      
      {(filters.type === 'all' || filters.type === 'receiving') && (
         <DockList
          docks={receivingDocksToDisplay}
          title="Receiving Docks (200-223)"
          onDockClick={handleDockClick}
        />
      )}

      {isModalOpen && selectedDock && (
        <DockDetailsModal 
          dock={selectedDock} 
          isOpen={isModalOpen} 
          onClose={closeModal}
          onUpdateDock={handleUpdateDock}
        />
      )}
    </div>
  );
}
