import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Settings, Users, Shield, Database, Download, Upload } from "lucide-react";
import { databaseHelpers, type User } from "../../lib/database";

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "viewer" as "admin" | "recorder" | "viewer" | "auditor",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await databaseHelpers.exportData();
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await databaseHelpers.addUser(userFormData);
      setUserFormData({
        name: "",
        email: "",
        role: "viewer",
      });
      setShowUserForm(false);
      loadUsers();
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('Failed to add user. Please try again.');
    }
  };

  const roleLabels = {
    admin: "Administrator",
    recorder: "Recorder",
    viewer: "Viewer",
    auditor: "Auditor",
  };

  const roleDescriptions = {
    admin: "Full access to all features",
    recorder: "Can add and edit records",
    viewer: "Can only view reports",
    auditor: "Read-only access to financials",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage system settings and users
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage system users and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={() => setShowUserForm(!showUserForm)}>
                Add New User
              </Button>

              {showUserForm && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Add New User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={userFormData.name}
                          onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <select
                          id="role"
                          value={userFormData.role}
                          onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="recorder">Recorder</option>
                          <option value="auditor">Auditor</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Add User</Button>
                        <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {roleLabels[user.role]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              Overview of user role permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(roleLabels).map(([role, label]) => (
                <div key={role} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {roleDescriptions[role as keyof typeof roleDescriptions]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Backup and restore system data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">System Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Database: IndexedDB (Local)</p>
                  <p>Storage: Offline-first</p>
                  <p>Sync: Manual backup/restore</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Backup All Data
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Restore Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultContribution">Default Expected Contribution (₵)</Label>
                <Input
                  id="defaultContribution"
                  type="number"
                  placeholder="100.00"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                >
                  <option value="GHS">Ghana Cedi (₵)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoBackup"
                  className="rounded border-gray-300"
                />
                <Label htmlFor="autoBackup">Enable automatic backup</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notifications"
                  className="rounded border-gray-300"
                />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
