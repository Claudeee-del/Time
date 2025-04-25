import { Activity, Expense, Goal, Device } from "../../types";

interface ExportData {
  activities: Activity[];
  expenses: Expense[];
  goals: Goal[];
  devices: Device[];
  exportDate: Date;
}

/**
 * Export application data to JSON
 * @param data Data to export
 * @returns Blob of JSON data
 */
export function exportToJson(data: ExportData): Blob {
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Export application data to CSV
 * @param data Data to export
 * @returns Object with CSV blobs for each data type
 */
export function exportToCsv(data: ExportData): Record<string, Blob> {
  const result: Record<string, Blob> = {};
  
  // Activities CSV
  if (data.activities.length > 0) {
    const headers = Object.keys(data.activities[0]).join(',');
    const rows = data.activities.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    result.activities = new Blob([csv], { type: 'text/csv' });
  }
  
  // Expenses CSV
  if (data.expenses.length > 0) {
    const headers = Object.keys(data.expenses[0]).join(',');
    const rows = data.expenses.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    result.expenses = new Blob([csv], { type: 'text/csv' });
  }
  
  // Goals CSV
  if (data.goals.length > 0) {
    const headers = Object.keys(data.goals[0]).join(',');
    const rows = data.goals.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    result.goals = new Blob([csv], { type: 'text/csv' });
  }
  
  return result;
}

/**
 * Save a file to the user's device
 * @param blob Data blob
 * @param filename Filename to save as
 */
export function saveFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read a JSON file
 * @param file File object to read
 * @returns Promise that resolves to the parsed JSON data
 */
export function readJsonFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}
