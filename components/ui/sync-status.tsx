import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { RefreshCw, CheckCircle, AlertCircle, WifiOff, Wifi, Cloud, CloudOff, Server } from 'lucide-react';
import { syncService } from '../../lib/syncService';

export function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    isSyncing: boolean;
    lastSync: string | null;
    backendAvailable: boolean;
  }>({
    isOnline: true,
    isSyncing: false,
    lastSync: null,
    backendAvailable: true
  });

  useEffect(() => {
    // Update status initially
    updateStatus();

    // Set up interval to update status
    const interval = setInterval(updateStatus, 5000);

    // Listen for online/offline events
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateStatus = () => {
    setSyncStatus(syncService.getSyncStatus());
  };

  const handleManualSync = async () => {
    if (syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const success = await syncService.manualSync();
      if (success) {
        console.log('Manual sync completed successfully');
      } else {
        console.error('Manual sync failed');
      }
    } catch (error) {
      console.error('Manual sync error:', error);
    } finally {
      updateStatus();
    }
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />;
    }
    
    if (!syncStatus.isOnline) {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }
    
    if (!syncStatus.backendAvailable) {
      return <Server className="h-5 w-5 text-orange-500" />;
    }
    
    if (syncStatus.lastSync) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing to Cloud...';
    }
    
    if (!syncStatus.isOnline) {
      return 'Offline Mode';
    }
    
    if (!syncStatus.backendAvailable) {
      return 'Backend Unavailable';
    }
    
    if (syncStatus.lastSync) {
      const lastSync = new Date(syncStatus.lastSync);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) {
        return 'Just Synced';
      } else if (diffMinutes < 60) {
        return `Synced ${diffMinutes}m ago`;
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        return `Synced ${diffHours}h ago`;
      }
    }
    
    return 'Never Synced';
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing) {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
    
    if (!syncStatus.isOnline) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    
    if (!syncStatus.backendAvailable) {
      return 'bg-orange-50 border-orange-200 text-orange-800';
    }
    
    if (syncStatus.lastSync) {
      return 'bg-green-50 border-green-200 text-green-800';
    }
    
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  const getStatusDescription = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing with cloud...';
    }
    
    if (!syncStatus.isOnline) {
      return 'No Internet Connection';
    }
    
    if (!syncStatus.backendAvailable) {
      return 'Cloud Server Offline';
    }
    
    if (syncStatus.lastSync) {
      return 'Cloud Sync Active';
    }
    
    return 'Ready to Sync';
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 ${getStatusColor()} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{getStatusText()}</span>
          <span className="text-xs opacity-75">
            {getStatusDescription()}
          </span>
        </div>
      </div>
      
      {syncStatus.isOnline && syncStatus.backendAvailable && !syncStatus.isSyncing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualSync}
          className="h-8 w-8 p-0 hover:bg-white/20"
          title="Sync Now"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}

      {!syncStatus.isOnline && (
        <div className="flex items-center gap-1 text-xs opacity-75">
          <WifiOff className="h-3 w-3" />
          <span>No Internet</span>
        </div>
      )}

      {syncStatus.isOnline && !syncStatus.backendAvailable && (
        <div className="flex items-center gap-1 text-xs opacity-75">
          <Server className="h-3 w-3" />
          <span>Server Offline</span>
        </div>
      )}
    </div>
  );
}
