
"use client";

import * as React from 'react';
import { DockList } from '@/components/DockList';
import { DockFilterControls, type DockFilters } from '@/components/DockFilterControls';
import { DockDetailsModal } from '@/components/DockDetailsModal';
import { allMockDocks as importedAllMockDocks } from '@/constants/mockData';
import type { Dock, FacilityAlert, WeatherAlertDisplay } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, CloudSun, CloudRain, Cloud, Sun, Moon, Thermometer, Wind, type LucideIcon, AlertTriangle, InfoIcon, ShieldAlert, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SafetyTipDisplay } from '@/components/SafetyTipDisplay';
import { getAiDailySafetyTip } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const defaultFacilityAlerts: FacilityAlert[] = [
  { id: 'fa1', title: 'Gate A Closure Scheduled', message: 'Gate A will be closed for maintenance on July 28th from 2 PM to 4 PM.', severity: 'warning', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'fa2', title: 'Safety Drill Reminder', message: 'Quarterly safety drill scheduled for next Wednesday at 10 AM. All personnel to participate.', severity: 'info', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

const weatherIconsMap: Record<WeatherAlertDisplay['iconName'], LucideIcon> = {
  CloudSun, CloudMoon: Cloud, Cloud, CloudRain, CloudSnow: CloudRain, CloudLightning: CloudRain, Wind, Sun, Moon, Thermometer
};


export default function DashboardPage() {
  const [filters, setFilters] = React.useState<DockFilters>({
    type: 'all',
    availability: 'all',
    searchTerm: '',
  });
  const [selectedDock, setSelectedDock] = React.useState<Dock | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [clientDocks, setClientDocks] = React.useState<Dock[]>([]);

  const [facilityAlerts, setFacilityAlerts] = React.useState<FacilityAlert[]>(defaultFacilityAlerts);
  const [weather, setWeather] = React.useState<WeatherAlertDisplay | null>(null);
  const [dailySafetyTip, setDailySafetyTip] = React.useState<string | null>(null);
  const [isSafetyTipLoading, setIsSafetyTipLoading] = React.useState(true);
  const { toast } = useToast();


  React.useEffect(() => {
    setClientDocks(importedAllMockDocks);

    // Load custom facility alert or use defaults
    if (typeof window !== 'undefined') {
      const storedCustomAlert = localStorage.getItem('customFacilityAlert');
      let alertsToDisplay = [...defaultFacilityAlerts];
      if (storedCustomAlert) {
        try {
          const customAlert: FacilityAlert = JSON.parse(storedCustomAlert);
          // Prepend custom alert and ensure it's prioritized or replaces a default one
          // For simplicity, let's make it the first alert, potentially replacing an existing one if ID conflicts.
          // A more robust way would be to filter out any existing alert with id 'custom-fa1' then prepend.
          const existingCustomAlertIndex = alertsToDisplay.findIndex(alert => alert.id === 'custom-fa1');
          if (existingCustomAlertIndex !== -1) {
            alertsToDisplay[existingCustomAlertIndex] = customAlert;
          } else {
            alertsToDisplay.unshift(customAlert); // Add to the beginning
          }
        } catch (e) {
          console.error("Failed to parse custom facility alert from localStorage for dashboard", e);
        }
      }
      setFacilityAlerts(alertsToDisplay.slice(0,2)); // Keep max 2 alerts for display
    } else {
      setFacilityAlerts(defaultFacilityAlerts.slice(0,2));
    }


    // Initial weather setup
    setWeather({
      location: 'Distribution Center HQ',
      temperature: '72°F',
      condition: 'Sunny',
      iconName: 'Sun',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
      shortTermForecast: 'Clear skies for the next few hours.',
      precipitationChance: '5%'
    });

    const weatherUpdateInterval = setInterval(() => {
      const conditions: Array<{condition: string, iconName: WeatherAlertDisplay['iconName'], tempRange: [number, number], shortTerm: string, precip: string}> = [
        { condition: 'Sunny', iconName: 'Sun', tempRange: [70, 85], shortTerm: 'Clear skies, pleasant.', precip: '0%' },
        { condition: 'Partly Cloudy', iconName: 'CloudSun', tempRange: [65, 78], shortTerm: 'Mix of sun and clouds.', precip: '10%' },
        { condition: 'Cloudy', iconName: 'Cloud', tempRange: [60, 72], shortTerm: 'Overcast, chance of drizzle.', precip: '25%' },
        { condition: 'Light Rain', iconName: 'CloudRain', tempRange: [55, 68], shortTerm: 'Showers expected throughout the afternoon.', precip: '70%' },
        { condition: 'Windy', iconName: 'Wind', tempRange: [60, 75], shortTerm: 'Breezy conditions, secure loose items.', precip: '5%'}
      ];
      const newWeatherSim = conditions[Math.floor(Math.random() * conditions.length)];
      const temp = Math.floor(Math.random() * (newWeatherSim.tempRange[1] - newWeatherSim.tempRange[0] + 1)) + newWeatherSim.tempRange[0];

      setWeather({
        location: 'Distribution Center HQ',
        temperature: `${temp}°F`,
        condition: newWeatherSim.condition,
        iconName: newWeatherSim.iconName,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
        shortTermForecast: newWeatherSim.shortTerm,
        precipitationChance: newWeatherSim.precip,
      });
    }, 300000); // Update every 5 minutes (300000 ms)

    // Fetch daily safety tip
    const fetchSafetyTip = async () => {
      setIsSafetyTipLoading(true);
      const result = await getAiDailySafetyTip();
      if (result.data?.safetyTip) {
        setDailySafetyTip(result.data.safetyTip);
      } else if (result.error) {
        console.error("Failed to load safety tip:", result.error);
        toast({
          title: "Safety Tip Error",
          description: "Could not load the daily safety tip.",
          variant: "destructive",
        });
        setDailySafetyTip(null); 
      }
      setIsSafetyTipLoading(false);
    };
    fetchSafetyTip();


    return () => clearInterval(weatherUpdateInterval);
  }, [toast]);

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

  const getSeverityIcon = (severity: FacilityAlert['severity']) => {
    switch (severity) {
      case 'danger': return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />; // Changed text-warning to a specific color
      case 'info': default: return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const WeatherIcon = weather ? weatherIconsMap[weather.iconName] || CloudSun : CloudSun;


  return (
    <div className="space-y-8">
      {/* Alerts and Safety Tip Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center"><Megaphone className="mr-2 h-5 w-5 text-primary" /> Facility Alerts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {facilityAlerts.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {facilityAlerts.map(alert => (
                  <Alert key={alert.id} variant={alert.severity === 'danger' ? 'destructive' : alert.severity === 'warning' ? 'default' : 'default'} 
                         className={cn(
                            alert.severity === 'warning' && 'bg-orange-500/10 border-orange-500/50 text-orange-700 dark:text-orange-300', // Changed warning classes
                            alert.severity === 'info' && 'bg-blue-500/10 border-blue-500/50 text-foreground'
                         )}>
                    <div className="flex items-start">
                      {getSeverityIcon(alert.severity)}
                      <div className="ml-3 flex-1">
                        <AlertTitle className={cn(
                           "text-sm font-semibold",
                           alert.severity === 'warning' && 'text-orange-700 dark:text-orange-300', // Changed warning classes
                           alert.severity === 'info' && 'text-blue-700 dark:text-blue-400'
                        )}>{alert.title}</AlertTitle>
                        <AlertDescription className={cn(
                           "text-xs",
                            alert.severity === 'warning' ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground' // Changed warning classes
                        )}>
                          {alert.message}
                          <span className="block text-xs opacity-80 mt-1">
                            {format(new Date(alert.timestamp), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No active facility alerts.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
                <WeatherIcon className="mr-2 h-5 w-5 text-primary" /> Current Weather
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {weather ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-primary">{weather.temperature}</p>
                    <WeatherIcon className="h-10 w-10 text-amber-500" />
                </div>
                <p className="text-lg font-medium">{weather.condition}</p>
                <p className="text-sm text-muted-foreground">{weather.location}</p>
                {weather.shortTermForecast && <p className="text-xs italic text-muted-foreground mt-1">Forecast: {weather.shortTermForecast}</p>}
                {weather.precipitationChance && <p className="text-xs text-muted-foreground">Precipitation: {weather.precipitationChance}</p>}
                <p className="text-xs text-muted-foreground/80 pt-1">Last updated: {weather.lastUpdated}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Weather data loading...</p>
            )}
          </CardContent>
        </Card>
        
        <SafetyTipDisplay 
          tip={dailySafetyTip} 
          isLoading={isSafetyTipLoading} 
          className="lg:col-span-1"
        />
      </div>
      
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

