import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus, UserCheck, Edit, Trash2, Phone } from "lucide-react";
import { databaseHelpers, type Contributor } from "../../lib/database";

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    religion: "christian" as "christian" | "muslim" | "other",
    expectedContribution: "",
  });

  useEffect(() => {
    loadContributors();
  }, []);

  const loadContributors = async () => {
    try {
      const data = await databaseHelpers.getAllContributors();
      setContributors(data);
    } catch (error) {
      console.error('Failed to load contributors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await databaseHelpers.addContributor({
        ...formData,
        expectedContribution: parseFloat(formData.expectedContribution),
      });
      setFormData({
        name: "",
        phone: "",
        religion: "christian",
        expectedContribution: "",
      });
      setShowForm(false);
      loadContributors();
    } catch (error) {
      console.error('Failed to add contributor:', error);
      alert('Failed to add contributor. Please try again.');
    }
  };

  const groupedContributors = contributors.reduce((acc, contributor) => {
    if (!acc[contributor.religion]) {
      acc[contributor.religion] = [];
    }
    acc[contributor.religion].push(contributor);
    return acc;
  }, {} as Record<string, Contributor[]>);

  const religionLabels = {
    christian: "Christian",
    muslim: "Muslim",
    other: "Other",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contributors</h1>
          <p className="text-muted-foreground">
            Manage contributors grouped by religion
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contributor
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Contributor</CardTitle>
            <CardDescription>
              Enter the contributor's information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="religion">Religion</Label>
                  <select
                    id="religion"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value as "christian" | "muslim" | "other" })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="christian">Christian</option>
                    <option value="muslim">Muslim</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="expectedContribution">Expected Contribution (₵)</Label>
                  <Input
                    id="expectedContribution"
                    type="number"
                    step="0.01"
                    value={formData.expectedContribution}
                    onChange={(e) => setFormData({ ...formData, expectedContribution: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Contributor</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {contributors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <UserCheck className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No contributors found</p>
            <p className="text-sm text-muted-foreground">Add your first contributor to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedContributors).map(([religion, contributors]) => (
            <Card key={religion}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {religionLabels[religion as keyof typeof religionLabels]}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({contributors.length} contributors)
                  </span>
                </CardTitle>
                <CardDescription>
                  Contributors from {religionLabels[religion as keyof typeof religionLabels]} community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Phone</th>
                        <th className="text-left p-2">Expected Contribution</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contributors.map((contributor) => (
                        <tr key={contributor.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{contributor.name}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contributor.phone}
                            </div>
                          </td>
                          <td className="p-2">₵{contributor.expectedContribution.toLocaleString()}</td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
