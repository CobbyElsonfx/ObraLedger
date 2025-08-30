import Dexie, { type Table } from 'dexie';

// Define the data types
export interface Deceased {
  id?: number;
  name: string;
  age: number;
  gender: 'male' | 'female';
  deathDate: string;
  burialDate: string;
  photo?: string;
  representativeName: string;
  representativePhone: string;
  status: 'pending' | 'completed';
  isSynced?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contributor {
  id?: number;
  name: string;
  phone: string;
  religion: 'christian' | 'muslim' | 'other';
  expectedContribution: number;
  isSynced?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contribution {
  id?: number;
  deceasedId: number;
  contributorId: number;
  amount: number;
  date: string;
  notes?: string;
  isSynced?: boolean;
  createdAt: Date;
}

export interface Expense {
  id?: number;
  deceasedId: number;
  description: string;
  amount: number;
  date: string;
  isSynced?: boolean;
  createdAt: Date;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'recorder' | 'viewer' | 'auditor';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id?: number;
  key: string;
  value: string;
  updatedAt: Date;
}

// Create the database class
export class ObraLedgerDB extends Dexie {
  deceased!: Table<Deceased>;
  contributors!: Table<Contributor>;
  contributions!: Table<Contribution>;
  expenses!: Table<Expense>;
  users!: Table<User>;
  settings!: Table<Settings>;

  constructor() {
    super('ObraLedgerDB');
    
    this.version(1).stores({
      deceased: '++id, name, status, createdAt',
      contributors: '++id, name, religion, createdAt',
      contributions: '++id, deceasedId, contributorId, date',
      expenses: '++id, deceasedId, date',
      users: '++id, email, role',
      settings: '++id, key'
    });

    this.version(2).stores({
      deceased: '++id, name, status, createdAt',
      contributors: '++id, name, religion, createdAt',
      contributions: '++id, deceasedId, contributorId, date',
      expenses: '++id, deceasedId, date',
      users: '++id, email, role, password, isActive, name',
      settings: '++id, key'
    });

    this.version(3).stores({
      deceased: '++id, name, status, createdAt',
      contributors: '++id, name, religion, createdAt',
      contributions: '++id, deceasedId, contributorId, date',
      expenses: '++id, deceasedId, date',
      users: '++id, email, role, password, isActive, name',
      settings: '++id, key'
    });
  }
}

// Create and export the database instance
export const db = new ObraLedgerDB();

// Helper functions for common operations
export const databaseHelpers = {
  // Deceased operations
  async addDeceased(deceased: Omit<Deceased, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    return await db.deceased.add({
      ...deceased,
      isSynced: false,
      createdAt: now,
      updatedAt: now
    });
  },

  async updateDeceased(id: number, updates: Partial<Omit<Deceased, 'id' | 'createdAt'>>): Promise<void> {
    await db.deceased.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  },

  async getDeceased(id: number): Promise<Deceased | undefined> {
    return await db.deceased.get(id);
  },

  async getAllDeceased(): Promise<Deceased[]> {
    return await db.deceased.orderBy('createdAt').reverse().toArray();
  },

  async deleteDeceased(id: number): Promise<void> {
    await db.deceased.delete(id);
  },

  async markDeceasedAsSynced(id: number): Promise<void> {
    await db.deceased.update(id, { isSynced: true });
  },

  async markContributorAsSynced(id: number): Promise<void> {
    await db.contributors.update(id, { isSynced: true });
  },

  async markContributionAsSynced(id: number): Promise<void> {
    await db.contributions.update(id, { isSynced: true });
  },

  async markExpenseAsSynced(id: number): Promise<void> {
    await db.expenses.update(id, { isSynced: true });
  },

  // Contributor operations
  async addContributor(contributor: Omit<Contributor, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    return await db.contributors.add({
      ...contributor,
      isSynced: false,
      createdAt: now,
      updatedAt: now
    });
  },

  async updateContributor(id: number, updates: Partial<Omit<Contributor, 'id' | 'createdAt'>>): Promise<void> {
    await db.contributors.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  },

  async getContributor(id: number): Promise<Contributor | undefined> {
    return await db.contributors.get(id);
  },

  async getAllContributors(): Promise<Contributor[]> {
    return await db.contributors.toArray();
  },

  async getContributorsByReligion(religion: Contributor['religion']): Promise<Contributor[]> {
    return await db.contributors.where('religion').equals(religion).toArray();
  },

  // Contribution operations
  async addContribution(contribution: Omit<Contribution, 'id' | 'createdAt'>): Promise<number> {
    return await db.contributions.add({
      ...contribution,
      isSynced: false,
      createdAt: new Date()
    });
  },

  async getContributionsByDeceased(deceasedId: number): Promise<Contribution[]> {
    return await db.contributions.where('deceasedId').equals(deceasedId).toArray();
  },

  async getContributionsByContributor(contributorId: number): Promise<Contribution[]> {
    return await db.contributions.where('contributorId').equals(contributorId).toArray();
  },

  async getAllContributions(): Promise<Contribution[]> {
    return await db.contributions.orderBy('date').reverse().toArray();
  },

  // Expense operations
  async addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<number> {
    return await db.expenses.add({
      ...expense,
      isSynced: false,
      createdAt: new Date()
    });
  },

  async getExpensesByDeceased(deceasedId: number): Promise<Expense[]> {
    return await db.expenses.where('deceasedId').equals(deceasedId).toArray();
  },

  async getAllExpenses(): Promise<Expense[]> {
    return await db.expenses.orderBy('date').reverse().toArray();
  },

  // User operations
  async addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date();
    return await db.users.add({
      ...user,
      createdAt: now,
      updatedAt: now
    });
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await db.users.where('email').equals(email).first();
  },

  async getAllUsers(): Promise<User[]> {
    return await db.users.toArray();
  },

  async getUserById(id: number): Promise<User | undefined> {
    return await db.users.get(id);
  },

  async updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await db.users.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Settings operations
  async getSetting(key: string): Promise<string | undefined> {
    const setting = await db.settings.where('key').equals(key).first();
    return setting?.value;
  },

  async setSetting(key: string, value: string): Promise<void> {
    const existing = await db.settings.where('key').equals(key).first();
    if (existing) {
      await db.settings.update(existing.id!, { value, updatedAt: new Date() });
    } else {
      await db.settings.add({ key, value, updatedAt: new Date() });
    }
  },

  // Backup and restore
  async exportData(): Promise<{
    deceased: Deceased[];
    contributors: Contributor[];
    contributions: Contribution[];
    expenses: Expense[];
    users: User[];
    settings: Settings[];
  }> {
    return {
      deceased: await db.deceased.toArray(),
      contributors: await db.contributors.toArray(),
      contributions: await db.contributions.toArray(),
      expenses: await db.expenses.toArray(),
      users: await db.users.toArray(),
      settings: await db.settings.toArray(),
    };
  },

  async importData(data: {
    deceased: Deceased[];
    contributors: Contributor[];
    contributions: Contribution[];
    expenses: Expense[];
    users: User[];
    settings: Settings[];
  }): Promise<void> {
    await db.transaction('rw', [
      db.deceased,
      db.contributors,
      db.contributions,
      db.expenses,
      db.users,
      db.settings
    ], async () => {
      // Clear existing data
      await db.deceased.clear();
      await db.contributors.clear();
      await db.contributions.clear();
      await db.expenses.clear();
      await db.users.clear();
      await db.settings.clear();

      // Import new data
      await db.deceased.bulkAdd(data.deceased);
      await db.contributors.bulkAdd(data.contributors);
      await db.contributions.bulkAdd(data.contributions);
      await db.expenses.bulkAdd(data.expenses);
      await db.users.bulkAdd(data.users);
      await db.settings.bulkAdd(data.settings);
    });
  },

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    await db.transaction('rw', [
      db.deceased,
      db.contributors,
      db.contributions,
      db.expenses,
      db.users,
      db.settings
    ], async () => {
      await db.deceased.clear();
      await db.contributors.clear();
      await db.contributions.clear();
      await db.expenses.clear();
      await db.users.clear();
      await db.settings.clear();
    });
  }
};
