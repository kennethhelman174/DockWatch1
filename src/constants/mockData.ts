
import type { Dock, DockStatus, NotificationMessage, Appointment } from '@/types';
import { subHours, addHours, addMinutes } from 'date-fns';

const dockStatuses: DockStatus[] = ["available", "occupied", "maintenance", "scheduled"];
const carriers = ["Swift", "J.B. Hunt", "Knight-Swift", "Schneider", "Werner", "Old Dominion", "XPO Logistics", "Ryder"];
const trailerIds = ["TR001", "TR002", "TR003", "TR004", "TR005", "TR006", "TR007", "TR008", "TR009", "TR010", "TRX11", "TRX12", "TRX15", "TRZ20"];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomAppointmentsForDock = (dockId: string, dockStatus: DockStatus): Appointment[] => {
  const appointments: Appointment[] = [];
  const numAppointments = (dockStatus === "scheduled" || Math.random() < 0.3) ? Math.floor(Math.random() * 2) + 1 : 0; // 1 to 2 appointments if scheduled or by chance

  let lastAppointmentTime = new Date();

  for (let i = 0; i < numAppointments; i++) {
    const appointmentType = Math.random() > 0.5 ? "arrival" : "departure";
    // Ensure departure is after arrival if multiple appointments
    const randomHourOffset = (i === 0 && appointmentType === 'arrival') ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 3) + 1; // 1 to 4 hours from now for first arrival, 1-3 for others
    
    let appointmentTime = addHours(lastAppointmentTime, randomHourOffset);
    appointmentTime = addMinutes(appointmentTime, Math.floor(Math.random() * 60)); // Add random minutes

    // If it's a departure, and the first appointment, ensure it's in the future from an implicit arrival
    if (i === 0 && appointmentType === 'departure' && dockStatus === 'occupied') {
        appointmentTime = addHours(new Date(), Math.floor(Math.random() * 2) + 1); // Schedule departure 1-2 hours from now
    }


    appointments.push({
      id: `appt-${dockId}-${i}-${Date.now()}`,
      trailerId: getRandomElement(trailerIds),
      carrier: getRandomElement(carriers),
      time: appointmentTime.toISOString(),
      type: appointmentType,
    });
    lastAppointmentTime = appointmentTime;
  }
  return appointments.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};

const generateDocks = (start: number, end: number, type: "shipping" | "receiving"): Dock[] => {
  const docks: Dock[] = [];
  let scheduledCount = 0;
  const maxScheduled = type === "shipping" ? 5 : 3; // Ensure at least 5 shipping docks are scheduled

  for (let i = start; i <= end; i++) {
    let status = getRandomElement(dockStatuses);
    
    // Force some docks to be 'scheduled' to meet the criteria
    if (type === "shipping" && scheduledCount < maxScheduled && Math.random() < 0.5) {
      status = "scheduled";
      scheduledCount++;
    } else if (type === "receiving" && scheduledCount < maxScheduled && Math.random() < 0.3) {
      status = "scheduled";
      scheduledCount++;
    }


    let occupiedSince: string | undefined = undefined;
    let preUnloadingChecksCompleted: boolean | undefined = undefined;
    let preReleaseChecksCompleted: boolean | undefined = undefined;

    if (status === "occupied") {
      occupiedSince = subHours(new Date(), Math.floor(Math.random() * 8) + 1).toISOString();
      preUnloadingChecksCompleted = Math.random() > 0.3; 
      preReleaseChecksCompleted = preUnloadingChecksCompleted ? Math.random() > 0.6 : false;
    } else if (status === "scheduled") {
       preUnloadingChecksCompleted = false;
       preReleaseChecksCompleted = false;
    }
    
    const dockId = `dock-${i}`;
    const scheduledAppointments = generateRandomAppointmentsForDock(dockId, status);

    const dock: Dock = {
      id: dockId,
      number: i,
      type,
      status,
      currentTrailer: (status === "occupied" || (status === "scheduled" && scheduledAppointments.length > 0 && scheduledAppointments[0].type === 'arrival')) ? getRandomElement(trailerIds) : undefined,
      currentCarrier: (status === "occupied" || (status === "scheduled" && scheduledAppointments.length > 0 && scheduledAppointments[0].type === 'arrival')) ? getRandomElement(carriers) : undefined,
      scheduledAppointments,
      notes: Math.random() > 0.8 ? `Dock ${i}: Priority load. Handle with care.` : (Math.random() > 0.7 ? `Note for dock ${i}: Check for spills.` : undefined),
      occupiedSince,
      preUnloadingChecksCompleted,
      preReleaseChecksCompleted,
    };
    docks.push(dock);
  }
  return docks;
};

export const mockShippingDocksInitial: Dock[] = generateDocks(100, 129, "shipping");
export const mockReceivingDocksInitial: Dock[] = generateDocks(200, 223, "receiving");

// Combine and process for final export
let allGeneratedMockDocks: Dock[] = [...mockShippingDocksInitial, ...mockReceivingDocksInitial];

// This mapping ensures that if a dock is 'scheduled', it reflects that correctly.
// If a dock is 'occupied', it might also have future scheduled departures.
// 'available' and 'maintenance' docks generally won't have current carrier/trailer or immediate appointments.
export const allMockDocks: Dock[] = allGeneratedMockDocks.map(dock => {
  if (dock.status === "available" || dock.status === "maintenance") {
    return {
      ...dock,
      currentTrailer: undefined,
      currentCarrier: undefined,
      occupiedSince: undefined,
      preUnloadingChecksCompleted: undefined,
      preReleaseChecksCompleted: undefined,
      // Keep scheduledAppointments if any, could be for future maintenance slot or re-opening
    };
  }
  if (dock.status === "scheduled" && dock.scheduledAppointments && dock.scheduledAppointments.length > 0) {
      const firstAppointment = dock.scheduledAppointments[0];
      if (firstAppointment.type === 'arrival') {
          return {
            ...dock,
            currentTrailer: firstAppointment.trailerId, // Pre-fill with next arrival
            currentCarrier: firstAppointment.carrier,
            occupiedSince: undefined,
            preUnloadingChecksCompleted: false,
            preReleaseChecksCompleted: false,
          };
      } else { // First appointment is a departure, implies it's currently occupied by something else.
           return {
            ...dock,
            // currentTrailer and currentCarrier might be set by generateDocks, or can be randomized here too
            currentTrailer: dock.currentTrailer || getRandomElement(trailerIds),
            currentCarrier: dock.currentCarrier || getRandomElement(carriers),
            occupiedSince: subHours(new Date(), Math.floor(Math.random() * 2) + 1).toISOString(), // Assume it became occupied recently
            preUnloadingChecksCompleted: true, // Likely unloading is done if departure is scheduled
            preReleaseChecksCompleted: Math.random() > 0.5, // Release checks might be pending
           }
      }
  }
  // For 'occupied' docks, data is mostly set during generation.
  return dock;
});


export const mockNotifications: NotificationMessage[] = [
  {
    id: "notif-1",
    title: "Shipment ETA Updated",
    message: "Trailer TR005 to Dock 102 ETA now 14:30.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    eta: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
    priority: "high",
    read: false,
  },
  {
    id: "notif-2",
    title: "Maintenance Alert",
    message: "Dock 210 scheduled for maintenance at 16:00.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    priority: "medium",
    read: true,
  },
  {
    id: "notif-3",
    title: "Low Priority Update",
    message: "Weather conditions improving in the west.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    priority: "low",
    read: false,
  },
   {
    id: "notif-4",
    title: "Incoming Shipment",
    message: "Trailer JB789 (J.B. Hunt) arriving at Gate A. Expected at Dock 205.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    eta: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
    priority: "high",
    read: false,
    link: "/docks/205"
  },
  {
    id: "notif-5",
    title: "Dock Available",
    message: "Dock 115 is now available after cleaning.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    priority: "medium",
    read: false,
  }
];
