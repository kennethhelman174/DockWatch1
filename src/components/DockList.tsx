"use client";

import type { Dock } from '@/types';
import { DockCard } from './DockCard';

interface DockListProps {
  docks: Dock[];
  title: string;
  onDockClick: (dock: Dock) => void;
}

export function DockList({ docks, title, onDockClick }: DockListProps) {
  return (
    <section aria-labelledby={`${title.toLowerCase().replace(' ', '-')}-heading`}>
      <h2 id={`${title.toLowerCase().replace(' ', '-')}-heading`} className="text-2xl font-headline mb-6 text-primary">
        {title}
      </h2>
      {docks.length === 0 ? (
         <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-md">
            <p className="text-muted-foreground">No docks match the current filters.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {docks.map((dock) => (
            <DockCard key={dock.id} dock={dock} onClick={() => onDockClick(dock)} />
          ))}
        </div>
      )}
    </section>
  );
}
