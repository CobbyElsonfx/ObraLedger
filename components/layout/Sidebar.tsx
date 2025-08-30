import { 
  Home, 
  Users, 
  UserCheck, 
  DollarSign, 
  Receipt, 
  FileText, 
  Settings,
  Database,
  Download,
  Upload,
  LogOut,
  Search,
  HelpCircle
} from "lucide-react";
import { Button } from "../ui/button";
import { databaseHelpers } from "../../lib/database";
import { GlobalSearch } from "../ui/search";
import { NotificationBell } from "../ui/notification";
import { ThemeToggle } from "../ui/theme-toggle";
import { InstallInstructions } from "../ui/install-prompt";

const navigation = [
  { name: 'Dashboard', key: 'dashboard', icon: Home },
  { name: 'Deceased Records', key: 'deceased', icon: Users },
  { name: 'Contributors', key: 'contributors', icon: UserCheck },
  { name: 'Contributions', key: 'contributions', icon: DollarSign },
  { name: 'Expenses', key: 'expenses', icon: Receipt },
  { name: 'Reports', key: 'reports', icon: FileText },
  { name: 'Settings', key: 'settings', icon: Settings },
];

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {

  const handleBackup = async () => {
    try {
      const data = await databaseHelpers.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `obra-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Backup failed. Please try again.');
    }
  };

  const handleRestore = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          await databaseHelpers.importData(data);
          alert('Data restored successfully!');
          window.location.reload();
        } catch (error) {
          console.error('Restore failed:', error);
          alert('Restore failed. Please check the file format.');
        }
      }
    };
    input.click();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Obra Ledger</h1>
      </div>
      
      {/* Search Bar */}
      <div className="p-4 border-b border-sidebar-border">
        <GlobalSearch
          onResultClick={(result) => {
            console.log('Selected result:', result);
            // Navigate to the appropriate page based on result type
            switch (result.type) {
              case 'deceased':
                onNavigate('deceased');
                break;
              case 'contributor':
                onNavigate('contributors');
                break;
              case 'contribution':
                onNavigate('contributions');
                break;
              case 'expense':
                onNavigate('expenses');
                break;
            }
          }}
          placeholder="Search all records..."
        />
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = currentPage === item.key;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.key)}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <Button
          onClick={handleBackup}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <Download className="mr-2 h-4 w-4" />
          Backup Data
        </Button>
        <Button
          onClick={handleRestore}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <Upload className="mr-2 h-4 w-4" />
          Restore Data
        </Button>
        
        {/* Utility Buttons */}
        <div className="flex items-center justify-between pt-2">
          <NotificationBell notifications={[]} />
          <ThemeToggle />
        </div>
        
        {onLogout && (
          <Button
            onClick={onLogout}
            variant="destructive"
            size="sm"
            className="w-full justify-start mt-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}

        {/* Help Section */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Quick Help</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• <strong>Search:</strong> Use the search bar to find any record</p>
            <p>• <strong>Sync:</strong> Click the sync button to backup to cloud</p>
            <p>• <strong>Backup:</strong> Download your data as JSON file</p>
            <p>• <strong>Offline:</strong> Works without internet connection</p>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-200">
            <InstallInstructions />
          </div>
        </div>
      </div>
    </div>
  );
}
