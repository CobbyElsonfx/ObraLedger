import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus, Receipt, Calendar, User, DollarSign } from "lucide-react";
import { databaseHelpers, type Expense, type Deceased } from "../../lib/database";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [deceased, setDeceased] = useState<Deceased[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    deceasedId: "",
    description: "",
    amount: "",
    date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesData, deceasedData] = await Promise.all([
        databaseHelpers.exportData().then(data => data.expenses),
        databaseHelpers.getAllDeceased(),
      ]);
      setExpenses(expensesData);
      setDeceased(deceasedData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await databaseHelpers.addExpense({
        deceasedId: parseInt(formData.deceasedId),
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
      });
      setFormData({
        deceasedId: "",
        description: "",
        amount: "",
        date: "",
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const getDeceasedName = (id: number) => {
    return deceased.find(d => d.id === id)?.name || 'Unknown';
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Record and manage funeral expenses
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>
              Record an expense for a specific funeral
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
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Coffin, Transportation, Food"
                    required
                  />
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
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Expense</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₵{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all funerals
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>
            {expenses.length} expenses recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="mx-auto h-12 w-12 mb-4" />
              <p>No expenses found</p>
              <p className="text-sm">Record your first expense to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Deceased</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getDeceasedName(expense.deceasedId)}
                        </div>
                      </td>
                      <td className="p-2 font-medium">{expense.description}</td>
                      <td className="p-2 font-bold text-red-600">
                        ₵{expense.amount.toLocaleString()}
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
