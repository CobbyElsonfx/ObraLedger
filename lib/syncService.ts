import { databaseHelpers } from './database';
import { authService } from './auth';

export interface SyncRequest {
  clientChanges: {
    deceased: any[];
    contributors: any[];
    contributions: any[];
    expenses: any[];
    arrears: any[];
    settings: any[];
  };
  lastSyncTimestamp: string;
}

export interface SyncResponse {
  serverChanges: {
    deceased: any[];
    contributors: any[];
    contributions: any[];
    expenses: any[];
    arrears: any[];
    settings: any[];
  };
  conflicts: any[];
  syncTimestamp: string;
}

export interface Conflict {
  recordType: string;
  recordId: string;
  clientVersion: any;
  serverVersion: any;
  resolution: 'client' | 'server' | 'manual';
}

export class SyncService {
  private static instance: SyncService;
  private lastSyncTimestamp: string | null = null;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private backendAvailable: boolean = true;

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Check if user is online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get last sync timestamp from localStorage
  private getLastSyncTimestamp(): string {
    if (!this.lastSyncTimestamp) {
      this.lastSyncTimestamp = localStorage.getItem('lastSyncTimestamp') || new Date(0).toISOString();
    }
    return this.lastSyncTimestamp;
  }

  // Save last sync timestamp to localStorage
  private setLastSyncTimestamp(timestamp: string): void {
    this.lastSyncTimestamp = timestamp;
    localStorage.setItem('lastSyncTimestamp', timestamp);
  }

  // Get unsynced records from IndexedDB
  private async getUnsyncedChanges(): Promise<SyncRequest> {
    try {
      // Get all records and filter by isSynced flag
      const [deceased, contributors, contributions, expenses, arrears, settings] = await Promise.all([
        databaseHelpers.getAllDeceased(),
        databaseHelpers.getAllContributors(),
        databaseHelpers.getAllContributions(),
        databaseHelpers.getAllExpenses(),
        [], // arrears not implemented yet
        [] // settings not implemented yet
      ]);

      // Filter for unsynced records (we'll use a simple approach for now)
      // In a real implementation, you'd add isSynced field to all records
      const unsyncedDeceased = deceased.filter(record => !record.isSynced);
      const unsyncedContributors = contributors.filter(record => !record.isSynced);
      const unsyncedContributions = contributions.filter(record => !record.isSynced);
      const unsyncedExpenses = expenses.filter(record => !record.isSynced);

      return {
        clientChanges: {
          deceased: unsyncedDeceased,
          contributors: unsyncedContributors,
          contributions: unsyncedContributions,
          expenses: unsyncedExpenses,
          arrears: [],
          settings: []
        },
        lastSyncTimestamp: this.getLastSyncTimestamp()
      };
    } catch (error) {
      console.error('Error getting unsynced changes:', error);
      throw error;
    }
  }

  // Push changes to server
  private async pushChanges(syncRequest: SyncRequest): Promise<SyncResponse> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log('Attempting to sync with backend...');
    console.log('Token available:', !!token);
    console.log('Token type:', token.startsWith('eyJ') ? 'JWT' : 'Base64');

    try {
      const response = await fetch('http://localhost:3001/api/sync/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(syncRequest)
      });

      console.log('Sync response status:', response.status);

      if (response.status === 401) {
        // Authentication failed - backend might be available but token is invalid
        this.backendAvailable = true;
        console.log('Authentication failed - token may be invalid');
        throw new Error('Authentication failed. Please log in again.');
      }

      if (response.status === 404 || response.status === 0) {
        // Backend not available
        this.backendAvailable = false;
        console.log('Backend server is not available');
        throw new Error('Backend server is not available');
      }

      if (!response.ok) {
        console.log('Sync failed with status:', response.status);
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      this.backendAvailable = true;
      const result = await response.json();
      console.log('Sync successful:', result);
      return result;
    } catch (error) {
      console.log('Sync error:', error);
      if (error instanceof Error && error.message.includes('Backend server is not available')) {
        this.backendAvailable = false;
      }
      throw error;
    }
  }

  // Apply server changes to IndexedDB
  private async applyServerChanges(serverChanges: any): Promise<void> {
    try {
      // Apply deceased changes
      for (const record of serverChanges.deceased) {
        const existing = await databaseHelpers.getDeceased(record.id);
        if (existing) {
          await databaseHelpers.updateDeceased(record.id, record);
        } else {
          await databaseHelpers.addDeceased(record);
        }
      }

      // Apply contributor changes
      for (const record of serverChanges.contributors) {
        const existing = await databaseHelpers.getContributor(record.id);
        if (existing) {
          await databaseHelpers.updateContributor(record.id, record);
        } else {
          await databaseHelpers.addContributor(record);
        }
      }

      // Apply contribution changes
      for (const record of serverChanges.contributions) {
        // For now, we'll just add new contributions
        // In a real implementation, you'd have updateContribution method
        await databaseHelpers.addContribution(record);
      }

      // Apply expense changes
      for (const record of serverChanges.expenses) {
        // For now, we'll just add new expenses
        // In a real implementation, you'd have updateExpense method
        await databaseHelpers.addExpense(record);
      }
    } catch (error) {
      console.error('Error applying server changes:', error);
      throw error;
    }
  }

  // Handle conflicts
  private async handleConflicts(conflicts: Conflict[]): Promise<void> {
    for (const conflict of conflicts) {
      console.warn('Conflict detected:', conflict);
      // For now, we'll just log conflicts
      // In a real implementation, you'd show a UI dialog to let user choose
    }
  }

  // Main sync method
  async sync(): Promise<boolean> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return false;
    }

    if (!this.isOnline()) {
      console.log('Device is offline, cannot sync');
      return false;
    }

    try {
      this.isSyncing = true;
      console.log('Starting sync...');

      // Get unsynced changes
      const syncRequest = await this.getUnsyncedChanges();
      
      // Check if there are any changes to sync
      const hasChanges = Object.values(syncRequest.clientChanges).some(changes => changes.length > 0);
      
      if (!hasChanges) {
        console.log('No changes to sync');
        return true;
      }

      // Push changes to server
      const syncResponse = await this.pushChanges(syncRequest);

      // Apply server changes
      await this.applyServerChanges(syncResponse.data.serverChanges);

      // Handle conflicts
      if (syncResponse.data.conflicts.length > 0) {
        await this.handleConflicts(syncResponse.data.conflicts);
      }

      // Update last sync timestamp
      this.setLastSyncTimestamp(syncResponse.data.syncTimestamp);

      console.log('Sync completed successfully');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      
      // If backend is not available, we can still work offline
      if (error instanceof Error && error.message.includes('Backend server is not available')) {
        console.log('Working in offline mode - data will sync when backend is available');
        return false;
      }
      
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // Start automatic sync
  startAutoSync(intervalMinutes: number = 5): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = setInterval(() => {
      this.sync();
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto sync started with ${intervalMinutes} minute interval`);
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto sync stopped');
    }
  }

  // Manual sync trigger
  async manualSync(): Promise<boolean> {
    return await this.sync();
  }

  // Get sync status
  getSyncStatus(): { isOnline: boolean; isSyncing: boolean; lastSync: string | null; backendAvailable: boolean } {
    return {
      isOnline: this.isOnline(),
      isSyncing: this.isSyncing,
      lastSync: this.lastSyncTimestamp,
      backendAvailable: this.backendAvailable
    };
  }

  // Check if backend is available
  isBackendAvailable(): boolean {
    return this.backendAvailable;
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();
