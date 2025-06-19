
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
  occupiedSince?: string; // ISO timestamp when the dock became occupied
  preUnloadingChecksCompleted?: boolean;
  preReleaseChecksCompleted?: boolean;
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

export interface FacilityAlert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  timestamp: string; // ISO string
}

// For client-side display of weather, potentially simplified from Genkit output
export interface WeatherAlertDisplay {
  location: string;
  temperature: string;
  condition: string;
  iconName: 'CloudSun' | 'CloudMoon' | 'Cloud' | 'CloudRain' | 'CloudSnow' | 'CloudLightning' | 'Wind' | 'Sun' | 'Moon' | 'Thermometer'; // Lucide icon names
  lastUpdated: string; // Formatted time string
  shortTermForecast?: string;
  precipitationChance?: string;
}

// Output from Genkit Weather Flow
export type WeatherForecastOutput = {
  location: string;
  temperature: string;
  condition: string;
  iconName: string; // Suggestion for Lucide icon
  shortTermForecast: string;
  precipitationChance?: string;
};
