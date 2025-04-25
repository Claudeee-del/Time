import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils/time";
import { exportToJson, saveFile } from "@/lib/utils/export";
import { Device } from "@/types";
import { Computer, Download, Smartphone, Tablet, Upload } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DataSyncProps {
  userId: number;
  devices: Device[];
}

export default function DataSync({ userId, devices }: DataSyncProps) {
  const [autoSync, setAutoSync] = useState(true);
  const { toast } = useToast();
  
  // Get the last sync time
  const lastSyncTime = devices.length > 0 && devices[0].lastSynced 
    ? new Date(devices[0].lastSynced) 
    : new Date();

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

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          importData.mutate(data);
        };
        reader.readAsText(file);
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

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.toLowerCase().includes("iphone") || 
        deviceName.toLowerCase().includes("android") || 
        deviceName.toLowerCase().includes("phone")) {
      return <Smartphone className="text-gray-500 dark:text-gray-400 mr-2" />;
    } else if (deviceName.toLowerCase().includes("ipad") || 
               deviceName.toLowerCase().includes("tablet")) {
      return <Tablet className="text-gray-500 dark:text-gray-400 mr-2" />;
    } else {
      return <Computer className="text-gray-500 dark:text-gray-400 mr-2" />;
    }
  };

  return (
    <Card className="shadow rounded-lg overflow-hidden">
      <CardContent className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">Data Synchronization</h3>
        
        <div className="space-y-4">
          {/* Last sync status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">Last synchronized</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatDate(lastSyncTime)}
            </span>
          </div>
          
          {/* Sync options */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Automatic sync</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sync data across your devices automatically</p>
            </div>
            <Switch 
              checked={autoSync} 
              onCheckedChange={setAutoSync} 
            />
          </div>
          
          {/* Export options */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <Button 
              variant="outline" 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Backup Data
            </Button>
            <Button 
              variant="outline" 
              onClick={handleImport}
              disabled={importData.isPending}
              className="flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              Restore Data
            </Button>
          </div>
          
          {/* Sync devices */}
          <div className="pt-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connected Devices</h4>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {devices.length > 0 ? (
                devices.map((device) => (
                  <li key={device.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      {getDeviceIcon(device.name)}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {device.name}
                      </span>
                    </div>
                    <span className={`text-xs ${
                      device.active ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {device.active 
                        ? 'Active' 
                        : device.lastSynced 
                          ? `Last sync ${formatDate(new Date(device.lastSynced))}` 
                          : 'Inactive'}
                    </span>
                  </li>
                ))
              ) : (
                <li className="py-3 text-sm text-gray-500 dark:text-gray-400">
                  No devices connected yet
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
