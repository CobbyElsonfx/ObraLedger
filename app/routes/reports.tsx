import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FileText, Download, Calendar, Users, DollarSign, Receipt, Filter, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { databaseHelpers } from "../../lib/database";
import { SimpleBarChart, SimpleLineChart, SimpleDoughnutChart } from "../../components/ui/charts";

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [filteredData, setFilteredData] = useState<any>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    deceasedId: "",
    contributorId: "",
    status: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    if (reportData) {
      applyFilters();
    }
  }, [filters, reportData]);

  const loadReportData = async () => {
    try {
      const data = await databaseHelpers.exportData();
      setReportData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Failed to load report data:', error);
    }
  };

  const applyFilters = () => {
    if (!reportData) return;

    let filtered = { ...reportData };

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      const startDate = filters.startDate ? new Date(filters.startDate) : new Date(0);
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date();

      filtered.contributions = reportData.contributions.filter((c: any) => {
        const contributionDate = new Date(c.date);
        return contributionDate >= startDate && contributionDate <= endDate;
      });

      filtered.expenses = reportData.expenses.filter((e: any) => {
        const expenseDate = new Date(e.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }

    // Filter by deceased
    if (filters.deceasedId) {
      filtered.contributions = filtered.contributions.filter((c: any) => 
        c.deceasedId === parseInt(filters.deceasedId)
      );
      filtered.expenses = filtered.expenses.filter((e: any) => 
        e.deceasedId === parseInt(filters.deceasedId)
      );
    }

    // Filter by contributor
    if (filters.contributorId) {
      filtered.contributions = filtered.contributions.filter((c: any) => 
        c.contributorId === parseInt(filters.contributorId)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered.deceased = filtered.deceased.filter((d: any) => 
        d.status === filters.status
      );
    }

    setFilteredData(filtered);
  };

  const exportToJSON = () => {
    if (!filteredData) return;
    
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obra-ledger-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!filteredData) return;
    
    // Create CSV content for contributions
    const csvContent = [
      ['Date', 'Deceased', 'Contributor', 'Amount', 'Notes'].join(','),
      ...filteredData.contributions.map((c: any) => [
        new Date(c.date).toLocaleDateString(),
        filteredData.deceased.find((d: any) => d.id === c.deceasedId)?.name || 'Unknown',
        filteredData.contributors.find((cont: any) => cont.id === c.contributorId)?.name || 'Unknown',
        c.amount,
        c.notes || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributions-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      deceasedId: "",
      contributorId: "",
      status: "",
    });
  };

  const generateChartData = () => {
    if (!filteredData) return {};

    // Monthly contributions data
    const monthlyContributions = new Array(12).fill(0);
    const monthlyExpenses = new Array(12).fill(0);
    
    filteredData.contributions.forEach((c: any) => {
      const month = new Date(c.date).getMonth();
      monthlyContributions[month] += c.amount;
    });

    filteredData.expenses.forEach((e: any) => {
      const month = new Date(e.date).getMonth();
      monthlyExpenses[month] += e.amount;
    });

    // Religion distribution
    const religionData = filteredData.contributors.reduce((acc: any, c: any) => {
      acc[c.religion] = (acc[c.religion] || 0) + 1;
      return acc;
    }, {});

    // Status distribution
    const statusData = filteredData.deceased.reduce((acc: any, d: any) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {});

    return {
      monthlyContributions,
      monthlyExpenses,
      religionData,
      statusData
    };
  };

  if (!reportData || !filteredData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📊 Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports and view analytics
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading report data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalContributions = filteredData.contributions.reduce((sum: number, c: any) => sum + c.amount, 0);
  const totalExpenses = filteredData.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const balance = totalContributions - totalExpenses;
  const chartData = generateChartData();

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">📊 Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports and view analytics for your funeral management system
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button onClick={exportToJSON} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Reports
            </CardTitle>
            <CardDescription>
              Filter data by date range, specific records, and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="deceasedId">Deceased Person</Label>
                <select
                  id="deceasedId"
                  value={filters.deceasedId}
                  onChange={(e) => setFilters({ ...filters, deceasedId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All deceased</option>
                  {reportData.deceased.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="contributorId">Contributor</Label>
                <select
                  id="contributorId"
                  value={filters.contributorId}
                  onChange={(e) => setFilters({ ...filters, contributorId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All contributors</option>
                  {reportData.contributors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deceased</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.deceased.length}</div>
            <p className="text-xs text-muted-foreground">
              Funeral records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.contributors.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered contributors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₵{totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Money collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₵{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Money spent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Financial Overview
            </CardTitle>
            <CardDescription>
              Contributions and expenses by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={{
                labels: monthNames,
                datasets: [
                  {
                    label: 'Contributions',
                    data: chartData.monthlyContributions || [],
                    backgroundColor: ['rgba(34, 197, 94, 0.8)'],
                    borderColor: ['rgb(34, 197, 94)'],
                    borderWidth: 1
                  },
                  {
                    label: 'Expenses',
                    data: chartData.monthlyExpenses || [],
                    backgroundColor: ['rgba(239, 68, 68, 0.8)'],
                    borderColor: ['rgb(239, 68, 68)'],
                    borderWidth: 1
                  }
                ]
              }}
              title=""
              description=""
              type="bar"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Contributors by Religion
            </CardTitle>
            <CardDescription>
              Distribution of contributors by religious affiliation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleDoughnutChart
              data={{
                labels: Object.keys(chartData.religionData || {}),
                datasets: [{
                  label: 'Contributors by Religion',
                  data: Object.values(chartData.religionData || {}),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                  ]
                }]
              }}
              title=""
              description=""
              type="doughnut"
            />
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <CardDescription>
              Overview of income, expenses, and balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Total Contributions:</span>
                <span className="font-bold text-green-600 text-lg">₵{totalContributions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium">Total Expenses:</span>
                <span className="font-bold text-red-600 text-lg">₵{totalExpenses.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-lg">Net Balance:</span>
                <span className={`font-bold text-lg ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₵{balance.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest contributions and expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredData.contributions.slice(0, 10).map((contribution: any) => (
                <div key={contribution.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">
                      {filteredData.contributors.find((c: any) => c.id === contribution.contributorId)?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contribution.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    +₵{contribution.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {filteredData.contributions.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No contributions found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 How to Use Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-700">
            <p><strong>1. Filtering:</strong> Use the filter options to narrow down data by date range, specific deceased persons, contributors, or status.</p>
            <p><strong>2. Charts:</strong> View dynamic charts showing monthly financial trends and contributor demographics.</p>
            <p><strong>3. Export:</strong> Download reports in JSON or CSV format for external analysis.</p>
            <p><strong>4. Real-time:</strong> All data is updated in real-time as you add or modify records.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
