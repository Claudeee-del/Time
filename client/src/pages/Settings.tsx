import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { exportToJson, saveFile, readJsonFile } from "@/lib/utils/export";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, Upload, Moon, Sun, Bell, BellOff, 
  SaveAll, Trash2, Smartphone, Tablet, Laptop, 
  Check, Shield, UserCircle, LogOut
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const userId = 1; // For demo, we're using the default user
  
  // State for settings
  const [autoSync, setAutoSync] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [backupLocation, setBackupLocation] = useState("/Documents/KingTrack");
  const [exportFormat, setExportFormat] = useState("json");
  const [deleteDataConfirm, setDeleteDataConfirm] = useState("");
  const [deleteType, setDeleteType] = useState<"activities" | "expenses" | "goals" | "all">("all");

  // Get devices for sync section
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["/api/devices", { userId }],
    queryFn: async () => {
      const url = new URL("/api/devices", window.location.origin);
      url.searchParams.append("userId", userId.toString());
      const response = await fetch(url.toString(), {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }
      return response.json();
    },
  });

  // Get user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
  });

  // Update user settings
  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Export data
  const { data: exportData, isLoading: isExporting } = useQuery({
    queryKey: ["/api/export", { userId }],
    enabled: false, // Don't run on component mount
    queryFn: async () => {
      const url = new URL("/api/export", window.location.origin);
      url.searchParams.append("userId", userId.toString());
      const response = await fetch(url.toString(), {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to export data");
      }
      return response.json();
    },
  });

  // Import data mutation
  const importData = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/import", {
        userId,
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Data imported successfully",
        description: "Your data has been imported from the backup file.",
      });
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle export data
  const handleExport = async () => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["/api/export", { userId }],
      });
      
      if (data) {
        const blob = exportToJson(data);
        const fileName = `kingtrack_backup_${new Date().toISOString().split('T')[0]}.json`;
        saveFile(blob, fileName);
        
        toast({
          title: "Data exported successfully",
          description: "Your data has been exported to a JSON file.",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle import data
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const data = await readJsonFile(file);
        importData.mutate(data);
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to read the file. Please try a different file.",
          variant: "destructive",
        });
      }
    };
    
    input.click();
  };

  // Handle profile update
  const handleUpdateProfile = (values: any) => {
    updateUser.mutate(values, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully.",
        });
      },
      onError: () => {
        toast({
          title: "Update failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  // Handle delete activities
  const deleteActivities = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/activities/all?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      toast({
        title: "Activities deleted",
        description: "All your activity records have been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete activities. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle delete expenses
  const deleteExpenses = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/expenses/all?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({
        title: "Expenses deleted",
        description: "All your expense records have been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete expenses. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle delete goals
  const deleteGoals = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/goals/all?userId=${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goals deleted",
        description: "All your goals have been deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete goals. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle delete all data
  const deleteAllData = () => {
    if (deleteDataConfirm !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: "Please type DELETE to confirm data deletion.",
        variant: "destructive",
      });
      return;
    }
    
    // Delete all activities
    deleteActivities.mutate();
    // Delete all expenses
    deleteExpenses.mutate();
    // Delete all goals
    deleteGoals.mutate();
    
    setDeleteDataConfirm("");
  };
  
  // Handle delete account (placeholder for now)
  const handleDeleteAccount = () => {
    if (deleteDataConfirm !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: "Please type DELETE to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    
    // Would normally delete the account here
    toast({
      title: "Account deletion",
      description: "Account deletion is not available in the demo version.",
    });
    
    setDeleteDataConfirm("");
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure your preferences and account settings
        </p>
      </div>
      
      {/* Settings tabs */}
      <Tabs defaultValue="general" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sync">Sync & Backup</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* General settings */}
        <TabsContent value="general">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Customize your app experience and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Toggle between light and dark theme
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                  <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              
              {/* Notifications toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications for goals and reminders
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {notifications ? (
                    <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </div>
              
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              
              {/* Export format */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Export Format</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose your preferred data export format
                  </p>
                </div>
                <Select
                  value={exportFormat}
                  onValueChange={setExportFormat}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              
              {/* Save changes button */}
              <Button onClick={() => {
                toast({
                  title: "Settings saved",
                  description: "Your general settings have been updated.",
                });
              }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sync & Backup settings */}
        <TabsContent value="sync">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>Data Synchronization & Backup</CardTitle>
              <CardDescription>
                Manage your data across devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto sync toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Automatic Sync</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sync data across devices automatically
                  </p>
                </div>
                <Switch
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>
              
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              
              {/* Backup location */}
              <div className="space-y-2">
                <Label className="text-base">Backup Location (Desktop Only)</Label>
                <div className="flex space-x-2">
                  <Input
                    value={backupLocation}
                    onChange={(e) => setBackupLocation(e.target.value)}
                    placeholder="Enter backup file path"
                  />
                  <Button variant="outline">Browse</Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Path where backup files will be stored on your device
                </p>
              </div>
              
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              
              {/* Manual backup/restore */}
              <div className="space-y-2">
                <Label className="text-base">Manual Backup & Restore</Label>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleImport}
                    disabled={importData.isPending}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                </div>
              </div>
              
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              
              {/* Connected devices */}
              <div className="space-y-2">
                <Label className="text-base">Connected Devices</Label>
                <div className="rounded-md border border-gray-200 dark:border-gray-700">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {devices.length > 0 ? (
                      devices.map((device: { id: number; name: string; active: boolean; lastSynced: Date | null }) => (
                        <div key={device.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-3">
                            {device.name.toLowerCase().includes("phone") ? (
                              <Smartphone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            ) : device.name.toLowerCase().includes("tablet") ? (
                              <Tablet className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <Laptop className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium">{device.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {device.active ? "Currently active" : "Last synced: " + 
                                  (device.lastSynced ? new Date(device.lastSynced).toLocaleString() : "Never")}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No devices connected yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Profile settings */}
        <TabsContent value="profile">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userLoading ? (
                <div className="space-y-4">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      defaultValue={user?.username}
                      disabled
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Username cannot be changed
                    </p>
                  </div>
                  
                  {/* Display name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      defaultValue={user?.displayName}
                      onChange={(e) => {
                        // Update the user object locally
                        if (user) {
                          user.displayName = e.target.value;
                        }
                      }}
                    />
                  </div>
                  
                  <Button onClick={() => handleUpdateProfile({ displayName: user?.displayName })}>
                    <SaveAll className="mr-2 h-4 w-4" />
                    Save Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security settings */}
        <TabsContent value="security">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change password */}
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter your new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                />
              </div>
              
              <Button>
                <Shield className="mr-2 h-4 w-4" />
                Update Password
              </Button>
              
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              
              {/* Data deletion options */}
              <div className="space-y-4">
                <Label className="text-base text-red-500 dark:text-red-400">Delete Your Data</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select what data you want to delete permanently.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setDeleteType("activities");
                      setDeleteDataConfirm("");
                    }}
                  >
                    Delete Activities
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setDeleteType("expenses");
                      setDeleteDataConfirm("");
                    }}
                  >
                    Delete Expenses
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setDeleteType("goals");
                      setDeleteDataConfirm("");
                    }}
                  >
                    Delete Goals
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setDeleteType("all");
                      setDeleteDataConfirm("");
                    }}
                  >
                    Delete All Data
                  </Button>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Confirm Data Deletion</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your 
                        {deleteType === "all" ? " all data" : 
                         deleteType === "activities" ? " activity records" : 
                         deleteType === "expenses" ? " expense records" : " goals"} 
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-4">
                      <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
                      <Input
                        id="delete-confirm"
                        value={deleteDataConfirm}
                        onChange={(e) => setDeleteDataConfirm(e.target.value)}
                        className="border-red-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteDataConfirm("")}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          switch(deleteType) {
                            case "activities":
                              if (deleteDataConfirm === "DELETE") {
                                deleteActivities.mutate();
                                setDeleteDataConfirm("");
                              } else {
                                toast({
                                  title: "Confirmation required",
                                  description: "Please type DELETE to confirm data deletion.",
                                  variant: "destructive",
                                });
                              }
                              break;
                            case "expenses":
                              if (deleteDataConfirm === "DELETE") {
                                deleteExpenses.mutate();
                                setDeleteDataConfirm("");
                              } else {
                                toast({
                                  title: "Confirmation required",
                                  description: "Please type DELETE to confirm data deletion.",
                                  variant: "destructive",
                                });
                              }
                              break;
                            case "goals":
                              if (deleteDataConfirm === "DELETE") {
                                deleteGoals.mutate();
                                setDeleteDataConfirm("");
                              } else {
                                toast({
                                  title: "Confirmation required",
                                  description: "Please type DELETE to confirm data deletion.",
                                  variant: "destructive",
                                });
                              }
                              break;
                            case "all":
                              deleteAllData();
                              break;
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
