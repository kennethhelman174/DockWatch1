
import type { Dock, DockStatus, NotificationMessage, Appointment, AppUser, UserRole, MaintenanceRecord } from '@/types';
import { subHours, addHours, addMinutes, addDays, subDays } from 'date-fns';

const dockStatuses: DockStatus[] = ["available", "occupied", "maintenance", "scheduled"];
const carriers = ["Swift", "J.B. Hunt", "Knight-Swift", "Schneider", "Werner", "Old Dominion", "XPO Logistics", "Ryder"];
const trailerIds = ["TR001", "TR002", "TR003", "TR004", "TR005", "TR006", "TR007", "TR008", "TR009", "TR010", "TRX11", "TRX12", "TRX15", "TRZ20"];
const userNames = ["Alice Smith", "Bob Johnson", "Charlie Brown", "Diana Prince", "Edward Newgate"];
const userEmails = ["alice@example.com", "bob@example.com", "charlie@example.com", "diana@example.com", "edward@example.com"];
const roles: UserRole[] = ['admin', 'shipping_coordinator', 'dock_worker', 'view_only'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomAppointmentsForDock = (dockId: string, dockStatus: DockStatus): Appointment[] => {
  const appointments: Appointment[] = [];
  const numAppointments = (dockStatus === "scheduled" || Math.random() < 0.3) ? Math.floor(Math.random() * 2) + 1 : 0;

  let lastAppointmentTime = new Date();

  for (let i = 0; i < numAppointments; i++) {
    const appointmentType = Math.random() > 0.5 ? "arrival" : "departure";
    const randomHourOffset = (i === 0 && appointmentType === 'arrival') ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 3) + 1;
    
    let appointmentTime = addHours(lastAppointmentTime, randomHourOffset);
    appointmentTime = addMinutes(appointmentTime, Math.floor(Math.random() * 60));

    if (i === 0 && appointmentType === 'departure' && dockStatus === 'occupied') {
        appointmentTime = addHours(new Date(), Math.floor(Math.random() * 2) + 1);
    }

    appointments.push({
      id: `appt-${dockId}-${i}-${Date.now()}${Math.random()}`,
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
  const minScheduled = type === "shipping" ? 4 : 2; 

  for (let i = start; i <= end; i++) {
    let status = getRandomElement(dockStatuses);
    
    if (scheduledCount < minScheduled) {
        if (Math.random() < 0.7 || (end - i < minScheduled - scheduledCount)) { // Increase chance or force if near end
            status = "scheduled";
            scheduledCount++;
        }
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
    
    // Generate next PM due date (e.g., within the next -10 to +90 days)
    const pmDaysOffset = Math.floor(Math.random() * 101) - 10; // -10 to 90 days
    const nextPmDueDate = addDays(new Date(), pmDaysOffset).toISOString();

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
      nextPmDueDate,
    };
    docks.push(dock);
  }
  return docks;
};

export const mockShippingDocksInitial: Dock[] = generateDocks(100, 129, "shipping");
export const mockReceivingDocksInitial: Dock[] = generateDocks(200, 223, "receiving");

let allGeneratedMockDocks: Dock[] = [...mockShippingDocksInitial, ...mockReceivingDocksInitial];

export const allMockDocks: Dock[] = allGeneratedMockDocks.map(dock => {
  if (dock.status === "available" || dock.status === "maintenance") {
    return {
      ...dock,
      currentTrailer: undefined,
      currentCarrier: undefined,
      occupiedSince: undefined,
      preUnloadingChecksCompleted: undefined,
      preReleaseChecksCompleted: undefined,
    };
  }
  if (dock.status === "scheduled" && dock.scheduledAppointments && dock.scheduledAppointments.length > 0) {
      const firstAppointment = dock.scheduledAppointments[0];
      if (firstAppointment.type === 'arrival') {
          return {
            ...dock,
            currentTrailer: firstAppointment.trailerId,
            currentCarrier: firstAppointment.carrier,
            occupiedSince: undefined,
            preUnloadingChecksCompleted: false,
            preReleaseChecksCompleted: false,
          };
      } else { 
           return {
            ...dock,
            currentTrailer: dock.currentTrailer || getRandomElement(trailerIds),
            currentCarrier: dock.currentCarrier || getRandomElement(carriers),
            occupiedSince: subHours(new Date(), Math.floor(Math.random() * 2) + 1).toISOString(),
            preUnloadingChecksCompleted: true, 
            preReleaseChecksCompleted: Math.random() > 0.5,
           };
      }
  }
  return dock;
});


export const mockNotifications: NotificationMessage[] = [
  {
    id: "notif-1",
    title: "Shipment ETA Updated",
    message: "Trailer TR005 to Dock 102 ETA now 14:30.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    eta: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    priority: "high",
    read: false,
  },
  {
    id: "notif-2",
    title: "Maintenance Alert",
    message: "Dock 210 scheduled for maintenance at 16:00.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    priority: "medium",
    read: true,
  },
  {
    id: "notif-3",
    title: "Low Priority Update",
    message: "Weather conditions improving in the west.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
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

export const mockAppUsers: AppUser[] = userNames.map((name, index) => {
  const nameParts = name.split(" ");
  return {
    id: `user-${index + 1}`,
    name: name,
    email: userEmails[index],
    role: getRandomElement(roles),
    avatarFallback: `${nameParts[0][0]}${nameParts[1] ? nameParts[1][0] : ''}`.toUpperCase(),
  };
});

// Ensure at least one admin for testing User Management display
const adminUserIndex = mockAppUsers.findIndex(user => user.role === 'admin');
if (adminUserIndex === -1 && mockAppUsers.length > 0) {
  mockAppUsers[0].role = 'admin'; 
} else if (mockAppUsers.length === 0) { // Should not happen with current setup but good practice
  mockAppUsers.push({
    id: 'user-admin-fallback',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatarFallback: 'AU'
  });
}


export const currentMockUser: AppUser = mockAppUsers.find(user => user.role === 'admin') || mockAppUsers[0]; // Use the first admin or first user

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  { id: 'maint-1', dockNumber: 101, type: 'preventive', description: 'Quarterly PM service, lubricated joints, checked hydraulics.', datePerformed: subDays(new Date(), 45).toISOString(), performedBy: 'Facility Team A' },
  { id: 'maint-2', dockNumber: 205, type: 'corrective', description: 'Replaced damaged dock bumper.', datePerformed: subDays(new Date(), 10).toISOString(), performedBy: 'Mike R.' },
  { id: 'maint-3', dockNumber: 115, type: 'corrective', description: 'Fixed faulty sensor on dock lock.', datePerformed: subDays(new Date(), 5).toISOString(), performedBy: 'External Tech' },
  { id: 'maint-4', dockNumber: 101, type: 'corrective', description: 'Adjusted dock plate alignment.', datePerformed: subDays(new Date(), 2).toISOString(), performedBy: 'Facility Team A' },
  { id: 'maint-5', dockNumber: 210, type: 'preventive', description: 'Annual safety inspection and component check.', datePerformed: subDays(new Date(), 90).toISOString(), performedBy: 'Safety Officer + Team B', nextPmDueDateUpdate: addDays(new Date(), 275).toISOString() },
  { id: 'maint-6', dockNumber: 108, type: 'corrective', description: 'Repaired minor electrical fault in control panel.', datePerformed: subDays(new Date(), 1).toISOString(), performedBy: 'Elec. Services Ltd.' },
];
