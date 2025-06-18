import type { Dock, DockStatus, NotificationMessage, Appointment } from '@/types';

const dockStatuses: DockStatus[] = ["available", "occupied", "maintenance", "scheduled"];
const carriers = ["Swift", "J.B. Hunt", "Knight-Swift", "Schneider", "Werner", "Old Dominion"];
const trailerIds = ["TR001", "TR002", "TR003", "TR004", "TR005", "TR006", "TR007", "TR008", "TR009", "TR010"];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomAppointments = (dockNumber: number): Appointment[] => {
  const appointments: Appointment[] = [];
  const numAppointments = Math.floor(Math.random() * 3); // 0 to 2 appointments
  for (let i = 0; i < numAppointments; i++) {
    const now = new Date();
    const randomHourOffset = Math.floor(Math.random() * 24) + 1; // 1 to 24 hours from now
    now.setHours(now.getHours() + randomHourOffset);
    appointments.push({
      id: `appt-${dockNumber}-${i}-${Date.now()}`,
      trailerId: getRandomElement(trailerIds),
      carrier: getRandomElement(carriers),
      time: now.toISOString(),
      type: Math.random() > 0.5 ? "arrival" : "departure",
    });
  }
  return appointments.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};

const generateDocks = (start: number, end: number, type: "shipping" | "receiving"): Dock[] => {
  const docks: Dock[] = [];
  for (let i = start; i <= end; i++) {
    const status = getRandomElement(dockStatuses);
    const dock: Dock = {
      id: `dock-${i}`,
      number: i,
      type,
      status,
      currentTrailer: status === "occupied" || status === "scheduled" ? getRandomElement(trailerIds) : undefined,
      currentCarrier: status === "occupied" || status === "scheduled" ? getRandomElement(carriers) : undefined,
      scheduledAppointments: generateRandomAppointments(i),
      notes: Math.random() > 0.7 ? `Note for dock ${i}: Check for spills.` : undefined,
    };
    docks.push(dock);
  }
  return docks;
};

export const mockShippingDocks: Dock[] = generateDocks(100, 129, "shipping");
export const mockReceivingDocks: Dock[] = generateDocks(200, 223, "receiving");
export const allMockDocks: Dock[] = [...mockShippingDocks, ...mockReceivingDocks];

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
