import { databaseHelpers, type User } from './database';
import { config } from './config';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'recorder' | 'viewer' | 'auditor';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'recorder' | 'viewer' | 'auditor';
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private authToken: string | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  // Initialize with default admin user if no users exist
  async initialize() {
    try {
      const users = await databaseHelpers.getAllUsers();
      if (users.length === 0) {
        // Create default admin user
        await this.createDefaultAdmin();
      }
      
      // Try to restore session from localStorage
      const savedUser = localStorage.getItem('currentUser');
      const savedToken = localStorage.getItem('authToken');
      
      if (savedUser && savedToken) {
        try {
          const user = JSON.parse(savedUser);
          this.currentUser = user;
          this.authToken = savedToken;
          this.notifyListeners();
        } catch (error) {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error initializing auth service:', error);
    }
  }

  private async createDefaultAdmin() {
    const defaultAdmin: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email: 'admin@obraledger.com',
      password: 'admin123', // In production, this should be hashed
      name: 'System Administrator',
      role: 'admin',
      isActive: true
    };

    await databaseHelpers.addUser(defaultAdmin);
    console.log('Default admin user created');
  }

  async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    try {
      // First try to authenticate with backend
      const backendResponse = await this.authenticateWithBackend(credentials);
      if (backendResponse) {
        return backendResponse;
      }

      // Fallback to local authentication if backend is not available
      const users = await databaseHelpers.getAllUsers();
      const user = users.find(u => 
        u.email.toLowerCase() === credentials.email.toLowerCase() && 
        u.password === credentials.password && 
        (u.isActive !== false)
      );

      if (user && user.id) {
        this.currentUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt.toISOString()
        };
        
        // Save to localStorage for session persistence
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.notifyListeners();
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  private async authenticateWithBackend(credentials: LoginCredentials): Promise<AuthUser | null> {
    try {
      console.log('Attempting backend authentication...');
      const response = await fetch(config.getApiUrl(config.api.endpoints.auth.login), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      console.log('Backend response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Backend authentication successful:', result);
        
        if (result.success && result.data) {
          const { user, token } = result.data;
          
          this.currentUser = {
            id: parseInt(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt
          };
          
          this.authToken = token;
          
          // Save to localStorage
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          localStorage.setItem('authToken', token);
          
          this.notifyListeners();
          return this.currentUser;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Backend authentication failed:', errorData);
      }
      return null;
    } catch (error) {
      console.log('Backend authentication failed, falling back to local auth:', error);
      return null;
    }
  }

  async register(data: RegisterData): Promise<AuthUser | null> {
    try {
      const users = await databaseHelpers.getAllUsers();
      const existingUser = users.find(u => 
        u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        email: data.email,
        password: data.password, // In production, this should be hashed
        name: data.name,
        role: data.role,
        isActive: true
      };

      const userId = await databaseHelpers.addUser(newUser);
      const createdUser = await databaseHelpers.getUserById(userId);

      if (createdUser && createdUser.id) {
        this.currentUser = {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
          createdAt: createdUser.createdAt.toISOString()
        };
        this.notifyListeners();
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout() {
    this.currentUser = null;
    this.authToken = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.notifyListeners();
  }

  // Get JWT token for API calls
  getToken(): string | null {
    // Return the JWT token if available, otherwise fallback to base64
    if (this.authToken) {
      return this.authToken;
    }
    
    // Fallback to base64 encoded token for local development
    if (this.currentUser) {
      return btoa(JSON.stringify({
        userId: this.currentUser.id,
        email: this.currentUser.email,
        role: this.currentUser.role,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
      }));
    }
    return null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: AuthUser['role']): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: AuthUser['role'][]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  canEdit(): boolean {
    return this.hasAnyRole(['admin', 'recorder']);
  }

  canView(): boolean {
    return this.hasAnyRole(['admin', 'recorder', 'viewer', 'auditor']);
  }

  canManageUsers(): boolean {
    return this.hasRole('admin');
  }

  canViewFinancials(): boolean {
    return this.hasAnyRole(['admin', 'auditor']);
  }

  // Observer pattern for auth state changes
  subscribe(listener: (user: AuthUser | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    console.log('Notifying listeners, current user:', this.currentUser);
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // Check if user exists and is active
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const users = await databaseHelpers.getAllUsers();
      return users.some(u => 
        u.email.toLowerCase() === email.toLowerCase() && (u.isActive !== false)
      );
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Update user profile
  async updateProfile(userId: number, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      await databaseHelpers.updateUser(userId, updates);
      
      // Update current user if it's the logged-in user
      if (this.currentUser && this.currentUser.id === userId) {
        const updatedUser = await databaseHelpers.getUserById(userId);
        if (updatedUser && updatedUser.id) {
          this.currentUser = {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt.toISOString()
          };
          this.notifyListeners();
        }
      }
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // Change password
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await databaseHelpers.getUserById(userId);
      if (!user || user.password !== currentPassword) {
        return false;
      }

      await databaseHelpers.updateUser(userId, { password: newPassword });
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  }
}

export const authService = new AuthService();

// Initialize auth service when module loads
authService.initialize();
