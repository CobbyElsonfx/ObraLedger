import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus, DollarSign, Calendar, User, FileText } from "lucide-react";
import { databaseHelpers, type Contribution, type Deceased, type Contributor } from "../../lib/database";

export default function ContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [deceased, setDeceased] = useState<Deceased[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    deceasedId: "",
    contributorId: "",
    amount: "",
    date: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contributionsData, deceasedData, contributorsData] = await Promise.all([
        databaseHelpers.exportData().then(data => data.contributions),
        databaseHelpers.getAllDeceased(),
        databaseHelpers.getAllContributors(),
      ]);
      setContributions(contributionsData);
      setDeceased(deceasedData);
      setContributors(contributorsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await databaseHelpers.addContribution({
        deceasedId: parseInt(formData.deceasedId),
        contributorId: parseInt(formData.contributorId),
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: formData.notes,
      });
      setFormData({
        deceasedId: "",
        contributorId: "",
        amount: "",
        date: "",
        notes: "",
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to add contribution:', error);
      alert('Failed to add contribution. Please try again.');
    }
  };

  const getDeceasedName = (id: number) => {
    return deceased.find(d => d.id === id)?.name || 'Unknown';
  };

  const getContributorName = (id: number) => {
    return contributors.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contributions</h1>
          <p className="text-muted-foreground">
            Record and manage funeral contributions
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Record Contribution
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record New Contribution</CardTitle>
            <CardDescription>
              Record a contribution for a specific funeral
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deceasedId">Deceased Person</Label>
                  <select
                    id="deceasedId"
                    value={formData.deceasedId}
                    onChange={(e) => setFormData({ ...formData, deceasedId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select deceased person</option>
                    {deceased.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="contributorId">Contributor</Label>
                  <select
                    id="contributorId"
                    value={formData.contributorId}
                    onChange={(e) => setFormData({ ...formData, contributorId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select contributor</option>
                    {contributors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.religion})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (₵)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Additional notes about this contribution..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Contribution</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Contribution History</CardTitle>
          <CardDescription>
            {contributions.length} contributions recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="mx-auto h-12 w-12 mb-4" />
              <p>No contributions found</p>
              <p className="text-sm">Record your first contribution to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Deceased</th>
                    <th className="text-left p-2">Contributor</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((contribution) => (
                    <tr key={contribution.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(contribution.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getDeceasedName(contribution.deceasedId)}
                        </div>
                      </td>
                      <td className="p-2 font-medium">
                        {getContributorName(contribution.contributorId)}
                      </td>
                      <td className="p-2 font-bold text-green-600">
                        ₵{contribution.amount.toLocaleString()}
                      </td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {contribution.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
