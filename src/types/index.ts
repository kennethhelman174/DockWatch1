export type DockStatus = "available" | "occupied" | "maintenance" | "scheduled";
export type DockType = "shipping" | "receiving";

export interface Dock {
  id: string;
  number: number;
  type: DockType;
  status: DockStatus;
  currentTrailer?: string;
  currentCarrier?: string;
  scheduledAppointments?: Appointment[];
  notes?: string;
}

export interface Appointment {
  id: string;
  trailerId: string;
  carrier: string;
  time: string; // ISO string
  type: "arrival" | "departure";
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  eta?: string; // ISO string for shipment ETA
  priority: 'high' | 'medium' | 'low';
  read?: boolean;
  link?: string; // Optional link for the notification
}
