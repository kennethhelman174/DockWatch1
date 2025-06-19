
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BarChart3, CalendarIcon, FileText, PieChart, LineChartIcon, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

const commonChartConfig = {
  views: {
    label: "Views",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-1))",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-2))",
  },
  tablet: {
    label: "Tablet",
    color: "hsl(var(--chart-3))",
  },
} satisfies Record<string, any>;


const mockLineChartData = [
  { date: 'Jan 23', desktop: 120, mobile: 190 },
  { date: 'Feb 23', desktop: 130, mobile: 200 },
  { date: 'Mar 23', desktop: 150, mobile: 220 },
  { date: 'Apr 23', desktop: 160, mobile: 250 },
  { date: 'May 23', desktop: 180, mobile: 260 },
  { date: 'Jun 23', desktop: 170, mobile: 240 },
];

const mockBarChartData = [
  { name: 'Dock 101', utilization: 75, dwellTime: 45 },
  { name: 'Dock 102', utilization: 88, dwellTime: 60 },
  { name: 'Dock 201', utilization: 60, dwellTime: 30 },
  { name: 'Dock 202', utilization: 92, dwellTime: 75 },
];

const mockPieChartData = [
  { name: 'Swift', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'J.B. Hunt', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Knight-Swift', value: 300, fill: 'hsl(var(--chart-3))'},
  { name: 'Schneider', value: 200, fill: 'hsl(var(--chart-4))' },
];


export default function AnalyticsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());

  const handleGenerateReport = () => {
    if (!reportType) {
      toast({
        title: "Select Report Type",
        description: "Please select a report type to generate.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Report Generation (Prototype)",
      description: `Generating "${reportType}" from ${startDate ? format(startDate, "PPP") : 'N/A'} to ${endDate ? format(endDate, "PPP") : 'N/A'}. This is a prototype feature.`,
      variant: "success",
    });
  };

  const chartConfig = {
    utilization: { label: 'Utilization (%)', color: 'hsl(var(--chart-1))' },
    dwellTime: { label: 'Avg. Dwell (min)', color: 'hsl(var(--chart-2))' },
    desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
    mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
  } satisfies Record<string, any>;


  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-primary" /> Analytics & Reporting
        </h1>
        <p className="text-muted-foreground mt-1">
          View key metrics, trends, and generate custom reports for your yard operations.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dock_reports">Dock Reports</TabsTrigger>
          <TabsTrigger value="shipment_reports">Shipment Reports</TabsTrigger>
          <TabsTrigger value="generate_report">Generate Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics (Today)</CardTitle>
              <CardDescription>A quick glance at today's operational performance.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardDescription>Total Shipments Processed</CardDescription>
                  <CardTitle className="text-4xl">128</CardTitle>
                </CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">+5 from yesterday</p></CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardDescription>Avg. Dock Turnaround</CardDescription>
                  <CardTitle className="text-4xl">42 min</CardTitle>
                </CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">-3 min from last week avg.</p></CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardDescription>Active Docks</CardDescription>
                  <CardTitle className="text-4xl">35 / 54</CardTitle>
                </CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">65% utilization</p></CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><LineChartIcon className="mr-2 h-5 w-5 text-primary"/>Shipment Activity Trend (Last 6 Months)</CardTitle>
              <CardDescription>Volume of shipments processed over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={mockLineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="desktop" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
             <CardFooter className="text-xs text-muted-foreground">
                Placeholder data. Represents mobile vs. desktop shipments for illustration.
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="dock_reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dock Utilization (%)</CardTitle>
              <CardDescription>Percentage of time docks are occupied.</CardDescription>
            </CardHeader>
            <CardContent>
               <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={mockBarChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis dataKey="utilization" tickLine={false} axisLine={false} tickMargin={8} unit="%"/>
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="utilization" fill="var(--color-utilization)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Average Dwell Time (minutes)</CardTitle>
              <CardDescription>Average time trailers spend at each dock.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={mockBarChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis dataKey="dwellTime" tickLine={false} axisLine={false} tickMargin={8} unit=" min"/>
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="dwellTime" fill="var(--color-dwellTime)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipment_reports" className="space-y-6">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><PieChart className="mr-2 h-5 w-5 text-primary"/>Volume by Carrier (Placeholder)</CardTitle>
              <CardDescription>Distribution of shipment volume among carriers.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[300px]">
               <ChartContainer config={commonChartConfig} className="mx-auto aspect-square max-h-[250px]">
                <RechartsPrimitive.PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                  <RechartsPrimitive.Pie data={mockPieChartData} dataKey="value" nameKey="name" />
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} className="flex-wrap"/>
                </RechartsPrimitive.PieChart>
              </ChartContainer>
            </CardContent>
             <CardFooter className="text-xs text-muted-foreground">
                Placeholder data representing shipment volume.
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>On-Time Performance</CardTitle>
              <CardDescription>Percentage of shipments arriving/departing on schedule.</CardDescription>
            </CardHeader>
            <CardContent className="h-[150px] flex items-center justify-center">
              <p className="text-muted-foreground">On-Time Performance Chart Placeholder</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate_report">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Generate Custom Report</CardTitle>
              <CardDescription>Select parameters to generate a specific report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="report-type" className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select a report type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily_dock_summary">Daily Dock Summary</SelectItem>
                    <SelectItem value="shipment_manifest_history">Shipment Manifest History</SelectItem>
                    <SelectItem value="carrier_performance_review">Carrier Performance Review</SelectItem>
                    <SelectItem value="dock_turnaround_analysis">Dock Turnaround Analysis</SelectItem>
                    <SelectItem value="yard_inventory_snapshot">Yard Inventory Snapshot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="start-date"
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="end-date"
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => startDate && date < startDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateReport} disabled={!reportType}>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
