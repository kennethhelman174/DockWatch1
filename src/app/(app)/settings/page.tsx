
"use client";

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Palette, Bell, LogOut, KeyRound, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider'; // Import useTheme

// Mock user data for display
const mockUser = {
  name: 'Admin User',
  email: 'admin@dockwatch.app',
  role: 'Administrator',
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme(); // Use theme from context

  // Notification Settings
  const [masterNotifications, setMasterNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [inAppNotifications, setInAppNotifications] = React.useState(true);

  const handleSaveChanges = () => {
    // In a real app, you'd save these settings to a backend or localStorage
    console.log('Settings saved:', {
      // theme is already saved by ThemeProvider
      masterNotifications,
      emailNotifications,
      inAppNotifications,
    });
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
      variant: 'success',
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: 'Feature In Progress',
      description: 'Password change functionality is not yet implemented.',
    });
  };

  const handleLogout = () => {
     toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out. (Placeholder)',
      variant: 'default'
    });
    // Actual logout logic would go here
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>
      <Separator />

      {/* Appearance Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><Palette className="mr-2 h-5 w-5 text-primary" /> Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-card">
            <Label htmlFor="theme-select" className="font-medium">Theme</Label>
            <Select value={theme} onValueChange={(newTheme) => setTheme(newTheme as "light" | "dark" | "system")}>
              <SelectTrigger id="theme-select" className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><Bell className="mr-2 h-5 w-5 text-primary" /> Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-card">
            <div>
              <Label htmlFor="master-notifications" className="font-medium">Enable All Notifications</Label>
              <p className="text-xs text-muted-foreground pt-1">Master switch for all application notifications.</p>
            </div>
            <Switch
              id="master-notifications"
              checked={masterNotifications}
              onCheckedChange={setMasterNotifications}
              aria-label="Enable all notifications"
            />
          </div>
          <div className={`space-y-4 pl-6 border-l-2 ml-3 ${!masterNotifications ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-card relative -left-[1px]">
               <div>
                <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground pt-1">Receive important updates via email.</p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications && masterNotifications}
                onCheckedChange={setEmailNotifications}
                disabled={!masterNotifications}
                aria-label="Enable email notifications"
              />
            </div>
             <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-card relative -left-[1px]">
               <div>
                <Label htmlFor="in-app-notifications" className="font-medium">In-App Notifications</Label>
                <p className="text-xs text-muted-foreground pt-1">Show notifications within the app.</p>
              </div>
              <Switch
                id="in-app-notifications"
                checked={inAppNotifications && masterNotifications}
                onCheckedChange={setInAppNotifications}
                disabled={!masterNotifications}
                aria-label="Enable in-app notifications"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><User className="mr-2 h-5 w-5 text-primary" /> Account</CardTitle>
          <CardDescription>Manage your personal account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="font-medium mb-2 text-base">Profile Information</h3>
            <div className="text-sm text-muted-foreground space-y-1.5">
              <p><strong>Name:</strong> {mockUser.name}</p>
              <p><strong>Email:</strong> {mockUser.email}</p>
              <p><strong>Role:</strong> {mockUser.role}</p>
            </div>
          </div>
           <div className="space-y-2 p-4 border rounded-lg bg-card">
            <Button variant="outline" onClick={handlePasswordChange} className="w-full sm:w-auto">
              <KeyRound className="mr-2 h-4 w-4" /> Change Password
            </Button>
             <p className="text-xs text-muted-foreground pt-1">
              For security reasons, password changes are handled through a secure process.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 mt-4 border-t gap-4">
         <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
        <Button onClick={handleSaveChanges} className="w-full sm:w-auto">
          <Save className="mr-2 h-4 w-4"/>Save Changes
        </Button>
      </div>
    </div>
  );
}
