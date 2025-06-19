
"use client";

import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider';
import { mockAppUsers as importedAllMockAppUsers, currentMockUser as importedCurrentMockUser } from '@/constants/mockData';
import type { AppUser, FacilityAlert, UserRole } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Edit3, Trash2, UserPlus, Cog, Bell, Palette, Users, ShieldAlert, Puzzle, Save, Settings as SettingsIcon, Shield, KeyRound, PlusCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const userRoleSchema = z.enum(['admin', 'shipping_coordinator', 'dock_worker', 'view_only']);
const allUserRoles: UserRole[] = ['admin', 'shipping_coordinator', 'dock_worker', 'view_only'];


const userFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  role: userRoleSchema,
});
type UserFormData = z.infer<typeof userFormSchema>;

const facilityAlertFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  severity: z.enum(['info', 'warning', 'danger']),
});
type FacilityAlertFormData = z.infer<typeof facilityAlertFormSchema>;

const newRoleFormSchema = z.object({
  roleName: z.string().min(3, { message: "Role name must be at least 3 characters." }).regex(/^[a-z_]+$/, { message: "Role name must be lowercase with underscores only (e.g., new_role)."}),
});
type NewRoleFormData = z.infer<typeof newRoleFormSchema>;


export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = React.useState(false);
  const [currentMockUser, setCurrentMockUser] = React.useState<AppUser | null>(null);
  const [allMockAppUsers, setAllMockAppUsers] = React.useState<AppUser[]>([]);
  
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<AppUser | null>(null);
  
  const [customFacilityAlert, setCustomFacilityAlert] = React.useState<FacilityAlert | null>(null);
  const [managedRoles, setManagedRoles] = React.useState<UserRole[]>(allUserRoles);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = React.useState(false);


  React.useEffect(() => {
    setMounted(true);
    setCurrentMockUser(importedCurrentMockUser);
    setAllMockAppUsers(importedAllMockAppUsers);
    setManagedRoles(allUserRoles);
    
    if (typeof window !== 'undefined') {
      const storedAlert = localStorage.getItem('customFacilityAlert');
      if (storedAlert) {
        try {
          setCustomFacilityAlert(JSON.parse(storedAlert));
        } catch (e) {
          console.error("Failed to parse custom facility alert from localStorage", e);
          localStorage.removeItem('customFacilityAlert');
        }
      }
    }
  }, []);

  const addUserForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: "", email: "", role: "dock_worker" },
  });

  const editUserForm = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
  });

  React.useEffect(() => {
    if (editingUser && isEditUserDialogOpen) {
      editUserForm.reset({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      });
    }
  }, [editingUser, isEditUserDialogOpen, editUserForm]);


  const facilityAlertForm = useForm<FacilityAlertFormData>({
    resolver: zodResolver(facilityAlertFormSchema),
    defaultValues: { title: "", message: "", severity: "info" },
  });
  
  const newRoleForm = useForm<NewRoleFormData>({
    resolver: zodResolver(newRoleFormSchema),
    defaultValues: { roleName: "" },
  });

  const onAddUserSubmit: SubmitHandler<UserFormData> = async (data) => {
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      avatarFallback: `${data.name.split(" ")[0]?.[0] || ''}${data.name.split(" ")[1]?.[0] || ''}`.toUpperCase(),
    };
    setAllMockAppUsers(prev => [...prev, newUser]);
    toast({
      title: "User Created",
      description: `User ${data.name} has been added as a ${data.role.replace('_', ' ')}.`,
      variant: "success",
    });
    addUserForm.reset();
    setIsAddUserDialogOpen(false);
  };
  
  const onEditUserSubmit: SubmitHandler<UserFormData> = async (data) => {
    if (!editingUser) return;
    setAllMockAppUsers(prev =>
      prev.map(user =>
        user.id === editingUser.id
          ? {
              ...user,
              name: data.name,
              email: data.email,
              role: data.role,
              avatarFallback: `${data.name.split(" ")[0]?.[0] || ''}${data.name.split(" ")[1]?.[0] || ''}`.toUpperCase(),
            }
          : user
      )
    );
    toast({
      title: "User Updated",
      description: `User ${data.name}'s details have been updated.`,
      variant: "success",
    });
    setIsEditUserDialogOpen(false);
    setEditingUser(null);
  };
  
  const handleDeleteUser = (userId: string, userName: string) => {
    setAllMockAppUsers(prev => prev.filter(user => user.id !== userId));
    toast({
        title: "User Deleted",
        description: `User ${userName} has been removed. (Client-side mock)`,
        variant: "destructive",
    });
  };

  const handleEditUserClick = (user: AppUser) => {
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  };


  const onFacilityAlertSubmit: SubmitHandler<FacilityAlertFormData> = async (data) => {
    const newAlert: FacilityAlert = {
      id: 'custom-fa1', 
      title: data.title,
      message: data.message,
      severity: data.severity,
      timestamp: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('customFacilityAlert', JSON.stringify(newAlert));
    }
    setCustomFacilityAlert(newAlert);
    toast({
      title: "Facility Alert Created/Updated",
      description: `The custom facility alert "${data.title}" has been set. It will show on the dashboard.`,
      variant: "success",
    });
    facilityAlertForm.reset();
  };
  
  const handleRemoveCustomAlert = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customFacilityAlert');
    }
    setCustomFacilityAlert(null);
    toast({
      title: "Custom Alert Removed",
      description: "The custom facility alert has been cleared from the dashboard.",
    });
  };
  
  const onNewRoleSubmit: SubmitHandler<NewRoleFormData> = async (data) => {
    const newRole = data.roleName as UserRole; // Casting for mock, real app needs type validation
    if (managedRoles.includes(newRole)) {
      newRoleForm.setError("roleName", { type: "manual", message: "This role already exists." });
      return;
    }
    setManagedRoles(prev => [...prev, newRole]);
    toast({
      title: "Role Added (Mock)",
      description: `Role "${data.roleName}" has been added. Permissions are not managed in this prototype.`,
      variant: "success",
    });
    newRoleForm.reset();
    setIsAddRoleDialogOpen(false);
  };


  if (!mounted || !currentMockUser) {
    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight flex items-center"><SettingsIcon className="mr-3 h-8 w-8 text-primary" /> Settings</h1>
                <p className="text-muted-foreground mt-1">Loading settings...</p>
            </div>
        </div>
    );
  }


  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center"><SettingsIcon className="mr-3 h-8 w-8 text-primary" /> Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage application settings, user accounts, and integrations.
        </p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="user_management"><Users className="mr-2 h-4 w-4" />User Management</TabsTrigger>
          <TabsTrigger value="role_management"><Shield className="mr-2 h-4 w-4" />Role Management</TabsTrigger>
          <TabsTrigger value="facility_alerts"><ShieldAlert className="mr-2 h-4 w-4" />Facility Alerts</TabsTrigger>
          <TabsTrigger value="integrations"><Puzzle className="mr-2 h-4 w-4" />Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Theme</Label>
                <p className="text-sm text-muted-foreground mb-2">Select your preferred color scheme.</p>
                <div className="flex space-x-2">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <Button
                      key={t}
                      variant={theme === t ? 'default' : 'outline'}
                      onClick={() => setTheme(t)}
                      className="capitalize"
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified. (Feature in development)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email.</p>
                </div>
                <Switch id="email-notifications" disabled />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get real-time alerts on your device.</p>
                </div>
                <Switch id="push-notifications" disabled />
              </div>
               <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <Label htmlFor="sms-notifications" className="font-medium">SMS Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive critical alerts via SMS.</p>
                </div>
                <Switch id="sms-notifications" disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user_management">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and roles.</CardDescription>
              </div>
              {currentMockUser?.role === 'admin' && (
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><UserPlus className="mr-2 h-4 w-4" /> Add User</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>Fill in the details to add a new user to the system.</DialogDescription>
                    </DialogHeader>
                    <Form {...addUserForm}>
                      <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-4 py-4">
                        <FormField control={addUserForm.control} name="name" render={({ field }) => (
                          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={addUserForm.control} name="email" render={({ field }) => (
                          <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="e.g., jane.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={addUserForm.control} name="role" render={({ field }) => (
                          <FormItem><FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {managedRoles.map(role => (
                                  <SelectItem key={role} value={role}>{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                          <Button type="submit">Create User</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Avatar</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allMockAppUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell><Avatar><AvatarImage src={user.avatarUrl} alt={user.name} /><AvatarFallback>{user.avatarFallback}</AvatarFallback></Avatar></TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell><TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role.replace('_', ' ')}</TableCell>
                      <TableCell className="text-right">
                        {currentMockUser?.role === 'admin' ? (
                          <div className="space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditUserClick(user)} className="hover:bg-primary/10"><Edit3 className="h-4 w-4 text-primary" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id, user.name)} className="hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        ) : (<span className="text-xs text-muted-foreground">N/A</span>)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Edit User Dialog */}
        {editingUser && (
            <Dialog open={isEditUserDialogOpen} onOpenChange={(isOpen) => { setIsEditUserDialogOpen(isOpen); if (!isOpen) setEditingUser(null); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle>Edit User: {editingUser.name}</DialogTitle>
                <DialogDescription>Update the user's details below.</DialogDescription>
                </DialogHeader>
                <Form {...editUserForm}>
                <form onSubmit={editUserForm.handleSubmit(onEditUserSubmit)} className="space-y-4 py-4">
                    <FormField control={editUserForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={editUserForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={editUserForm.control} name="role" render={({ field }) => (
                        <FormItem><FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                            {managedRoles.map(role => (
                                <SelectItem key={role} value={role}>{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Changes</Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
            </Dialog>
        )}

        <TabsContent value="role_management">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Role Management</CardTitle>
                        <CardDescription>Define and manage user roles and their permissions. (Prototype)</CardDescription>
                    </div>
                     <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
                        <DialogTrigger asChild>
                           {currentMockUser?.role === 'admin' && <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add New Role</Button>}
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader><DialogTitle>Add New Role</DialogTitle><DialogDescription>Enter the name for the new role.</DialogDescription></DialogHeader>
                            <Form {...newRoleForm}>
                                <form onSubmit={newRoleForm.handleSubmit(onNewRoleSubmit)} className="space-y-4 py-4">
                                    <FormField control={newRoleForm.control} name="roleName" render={({ field }) => (
                                        <FormItem><FormLabel>Role Name</FormLabel><FormControl><Input placeholder="e.g., new_role_name" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <DialogFooter>
                                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                        <Button type="submit">Add Role</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Role Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {managedRoles.map((role) => (
                                <TableRow key={role}>
                                    <TableCell className="font-medium capitalize">{role.replace('_', ' ')}</TableCell>
                                    <TableCell className="text-right">
                                        {currentMockUser?.role === 'admin' ? (
                                        <div className="space-x-1">
                                            <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit Permissions (Placeholder)", description: `Configuring permissions for ${role}.`})}>
                                                <KeyRound className="mr-2 h-4 w-4"/>Edit Permissions
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => toast({ title: "Remove Role (Placeholder)", description: `Removing ${role} role. Check assignments first.`, variant: "destructive"})}>
                                                <Trash2 className="mr-2 h-4 w-4"/>Remove
                                            </Button>
                                        </div>
                                        ) : (<span className="text-xs text-muted-foreground">N/A</span>)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="facility_alerts">
          <Card>
            <CardHeader>
              <CardTitle>Custom Facility Alert</CardTitle>
              <CardDescription>Set a custom, site-wide alert that will appear on the dashboard.</CardDescription>
            </CardHeader>
             <Form {...facilityAlertForm}>
                <form onSubmit={facilityAlertForm.handleSubmit(onFacilityAlertSubmit)}>
                  <CardContent className="space-y-4">
                     {customFacilityAlert && (
                        <div className="p-4 border rounded-md bg-muted/50">
                            <h4 className="font-medium text-sm mb-1">Current Custom Alert:</h4>
                            <p className="text-sm font-semibold">{customFacilityAlert.title}</p>
                            <p className="text-xs text-muted-foreground">{customFacilityAlert.message}</p>
                            <p className="text-xs text-muted-foreground capitalize">Severity: {customFacilityAlert.severity}</p>
                            <Button variant="link" size="sm" className="text-destructive p-0 h-auto mt-1" onClick={handleRemoveCustomAlert}>Remove this alert</Button>
                        </div>
                    )}
                    <FormField control={facilityAlertForm.control} name="title" render={({ field }) => (
                      <FormItem><FormLabel>Alert Title</FormLabel><FormControl><Input placeholder="e.g., Gate B Maintenance" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={facilityAlertForm.control} name="message" render={({ field }) => (
                      <FormItem><FormLabel>Alert Message</FormLabel><FormControl><Input placeholder="e.g., Gate B will be closed from 2 PM to 4 PM today." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={facilityAlertForm.control} name="severity" render={({ field }) => (
                      <FormItem><FormLabel>Severity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="info">Info (Blue)</SelectItem><SelectItem value="warning">Warning (Orange)</SelectItem><SelectItem value="danger">Danger (Red)</SelectItem>
                          </SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                  </CardContent>
                  <CardFooter>
                     <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        {customFacilityAlert ? 'Update Custom Alert' : 'Set Custom Alert'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect DockWatch with other services. (Placeholders)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md"><Label className="font-medium">Microsoft 365 / Azure</Label><Button variant="outline" disabled>Connect</Button></div>
              <div className="flex items-center justify-between p-4 border rounded-md"><Label className="font-medium">Slack</Label><Button variant="outline" disabled>Connect</Button></div>
              <div className="flex items-center justify-between p-4 border rounded-md"><Label className="font-medium">External WMS</Label><Button variant="outline" disabled>Configure API</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


    