import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Users, UserCheck, DollarSign, Receipt, TrendingUp, TrendingDown, Plus, Calendar, AlertCircle, CheckCircle, FileText, Settings, Info } from "lucide-react";
import { databaseHelpers } from "../../lib/database";
import { SimpleBarChart, SimpleLineChart, SimpleDoughnutChart, StatCard, MetricGrid } from "../../components/ui/charts";
import { SyncStatus } from "../../components/ui/sync-status";
import { authService } from "../../lib/auth";
import { syncService } from "../../lib/syncService";

interface DashboardStats {
  totalDeceased: number;
  totalContributors: number;
  totalContributions: number;
  totalExpenses: number;
  balance: number;
  recentDeceased: any[];
  recentContributions: any[];
  pendingDeceased: number;
  overdueContributions: number;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalDeceased: 0,
    totalContributors: 0,
    totalContributions: 0,
    totalExpenses: 0,
    balance: 0,
    recentDeceased: [],
    recentContributions: [],
    pendingDeceased: 0,
    overdueContributions: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [deceased, contributors, contributions, expenses] = await Promise.all([
        databaseHelpers.getAllDeceased(),
        databaseHelpers.getAllContributors(),
        databaseHelpers.getAllContributions(),
        databaseHelpers.getAllExpenses()
      ]);

      const totalContributions = contributions.reduce((sum: number, c: any) => sum + c.amount, 0);
      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      const balance = totalContributions - totalExpenses;

      // Get recent deceased (last 5)
      const recentDeceased = deceased
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Get recent contributions (last 5)
      const recentContributions = contributions
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      // Count pending deceased
      const pendingDeceased = deceased.filter(d => d.status === 'pending').length;

      // Count overdue contributions (simplified - contributions older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const overdueContributions = contributions.filter(c => 
        new Date(c.date) < thirtyDaysAgo
      ).length;

      setStats({
        totalDeceased: deceased.length,
        totalContributors: contributors.length,
        totalContributions,
        totalExpenses,
        balance,
        recentDeceased,
        recentContributions,
        pendingDeceased,
        overdueContributions
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getBalanceIcon = (balance: number) => {
    return balance >= 0 ? TrendingUp : TrendingDown;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your funeral management system</p>
        </div>
        <div className="flex gap-2 items-center">
          <SyncStatus />
          <Button onClick={() => onNavigate?.('deceased')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Deceased
          </Button>
          <Button variant="outline" onClick={() => onNavigate?.('contributions')}>
            <DollarSign className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deceased</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeceased}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingDeceased} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContributors}</div>
            <p className="text-xs text-muted-foreground">
              Active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalContributions)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueContributions} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            {React.createElement(getBalanceIcon(stats.balance), { className: "h-4 w-4 text-muted-foreground" })}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalanceColor(stats.balance)}`}>
              {formatCurrency(stats.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.balance >= 0 ? 'Positive balance' : 'Negative balance'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deceased */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Deceased Records</CardTitle>
                <CardDescription>Latest funeral records added to the system</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate?.('deceased')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentDeceased.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent records</p>
              ) : (
                stats.recentDeceased.map((deceased) => (
                  <div 
                    key={deceased.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onNavigate?.('deceased')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        deceased.status === 'completed' ? 'bg-green-500' : 
                        deceased.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium">{deceased.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(deceased.deathDate)} • {deceased.age} years
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize">{deceased.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(deceased.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Contributions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Contributions</CardTitle>
                <CardDescription>Latest payments recorded in the system</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate?.('contributions')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentContributions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent contributions</p>
              ) : (
                stats.recentContributions.map((contribution) => (
                  <div 
                    key={contribution.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onNavigate?.('contributions')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(contribution.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          Contribution ID: {contribution.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(contribution.date)}</p>
                      <p className="text-xs text-muted-foreground">
                        {contribution.notes || 'No notes'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

             {/* Charts Section */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {(() => {
           // Generate dynamic chart data
           const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
           const currentMonth = new Date().getMonth();
           const last6Months = monthNames.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
           
           // Calculate monthly contributions
           const monthlyContributions = new Array(6).fill(0);
           stats.recentContributions.forEach((contribution: any) => {
             const month = new Date(contribution.date).getMonth();
             const monthIndex = Math.max(0, currentMonth - 5);
             if (month >= monthIndex && month <= currentMonth) {
               monthlyContributions[month - monthIndex] += contribution.amount;
             }
           });

           // Calculate religion distribution
           const religionData = stats.recentContributions.reduce((acc: any, contribution: any) => {
             const contributor = stats.recentContributors?.find((c: any) => c.id === contribution.contributorId);
             if (contributor) {
               acc[contributor.religion] = (acc[contributor.religion] || 0) + 1;
             }
             return acc;
           }, {});

           // Calculate monthly expenses (simplified)
           const monthlyExpenses = new Array(6).fill(0);
           // This would be populated with actual expense data

           return (
             <>
               <SimpleBarChart
                 data={{
                   labels: last6Months,
                   datasets: [{
                     label: 'Contributions',
                     data: monthlyContributions,
                     backgroundColor: ['rgba(34, 197, 94, 0.8)'],
                     borderColor: ['rgb(34, 197, 94)'],
                     borderWidth: 1
                   }]
                 }}
                 title="Monthly Contributions"
                 description="Contribution trends over the last 6 months"
                 type="bar"
               />
               
               <SimpleDoughnutChart
                 data={{
                   labels: Object.keys(religionData).length > 0 ? Object.keys(religionData) : ['No Data'],
                   datasets: [{
                     label: 'Contributors by Religion',
                     data: Object.keys(religionData).length > 0 ? Object.values(religionData) : [1],
                     backgroundColor: [
                       'rgba(59, 130, 246, 0.8)',
                       'rgba(16, 185, 129, 0.8)',
                       'rgba(245, 158, 11, 0.8)'
                     ]
                   }]
                 }}
                 title="Contributors by Religion"
                 description="Distribution of contributors by religious affiliation"
                 type="doughnut"
               />
               
               <SimpleLineChart
                 data={{
                   labels: last6Months,
                   datasets: [{
                     label: 'Expenses',
                     data: monthlyExpenses,
                     backgroundColor: ['rgba(239, 68, 68, 0.8)'],
                     borderColor: ['rgb(239, 68, 68)'],
                     borderWidth: 1
                   }]
                 }}
                 title="Monthly Expenses"
                 description="Expense trends over the last 6 months"
                 type="line"
               />
             </>
           );
         })()}
       </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate?.('deceased')}>
              <Users className="h-6 w-6 mb-2" />
              <span>Add Deceased</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate?.('contributors')}>
              <UserCheck className="h-6 w-6 mb-2" />
              <span>Add Contributor</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate?.('contributions')}>
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Record Payment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate?.('expenses')}>
              <Receipt className="h-6 w-6 mb-2" />
              <span>Add Expense</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate?.('reports')}>
              <FileText className="h-6 w-6 mb-2" />
              <span>View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => onNavigate?.('settings')}>
              <Settings className="h-6 w-6 mb-2" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

             {/* Alerts */}
       {(stats.pendingDeceased > 0 || stats.overdueContributions > 0) && (
         <Card className="border-yellow-200 bg-yellow-50">
           <CardHeader>
             <CardTitle className="flex items-center text-yellow-800">
               <AlertCircle className="h-5 w-5 mr-2" />
               Action Required
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-2">
               {stats.pendingDeceased > 0 && (
                 <div className="flex items-center text-yellow-700 cursor-pointer hover:text-yellow-800" 
                      onClick={() => onNavigate?.('deceased')}>
                   <AlertCircle className="h-4 w-4 mr-2" />
                   {stats.pendingDeceased} deceased records are pending completion
                   <span className="ml-2 text-xs underline">Click to view</span>
                 </div>
               )}
               {stats.overdueContributions > 0 && (
                 <div className="flex items-center text-yellow-700 cursor-pointer hover:text-yellow-800"
                      onClick={() => onNavigate?.('contributions')}>
                   <AlertCircle className="h-4 w-4 mr-2" />
                   {stats.overdueContributions} contributions are overdue
                   <span className="ml-2 text-xs underline">Click to view</span>
                 </div>
               )}
             </div>
           </CardContent>
         </Card>
       )}

       {/* User Instructions */}
       <Card className="border-green-200 bg-green-50">
         <CardHeader>
           <CardTitle className="flex items-center text-green-800">
             <Info className="h-5 w-5 mr-2" />
             Welcome to Obra Ledger! 🎉
           </CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-3 text-sm text-green-700">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <h4 className="font-medium mb-2">📊 Dashboard Features:</h4>
                 <ul className="space-y-1 text-xs">
                   <li>• Real-time statistics and charts</li>
                   <li>• Quick access to all modules</li>
                   <li>• Cloud sync status indicator</li>
                   <li>• Recent activity overview</li>
                 </ul>
               </div>
               <div>
                 <h4 className="font-medium mb-2">🚀 Getting Started:</h4>
                 <ul className="space-y-1 text-xs">
                   <li>• Add deceased records first</li>
                   <li>• Register contributors</li>
                   <li>• Record contributions and expenses</li>
                   <li>• Generate reports for insights</li>
                 </ul>
               </div>
             </div>
             <div className="mt-3 p-2 bg-white/50 rounded border border-green-200">
               <p className="text-xs">
                 <strong>💡 Pro Tip:</strong> Use the search bar in the sidebar to quickly find any record. 
                 The system works offline and syncs automatically when you're online!
               </p>
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Debug Status (Development Only) */}
       {process.env.NODE_ENV === 'development' && (
         <Card className="border-gray-200 bg-gray-50">
           <CardHeader>
             <CardTitle className="flex items-center text-gray-800">
               <Info className="h-5 w-5 mr-2" />
               System Status (Debug)
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-2 text-xs text-gray-700">
               <div className="flex justify-between">
                 <span>Authentication:</span>
                 <span className={authService.isAuthenticated() ? 'text-green-600' : 'text-red-600'}>
                   {authService.isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}
                 </span>
               </div>
               <div className="flex justify-between">
                 <span>Token Type:</span>
                 <span>
                   {authService.getToken()?.startsWith('eyJ') ? 'JWT' : 'Base64'}
                 </span>
               </div>
               <div className="flex justify-between">
                 <span>Backend Available:</span>
                 <span className={syncService.isBackendAvailable() ? 'text-green-600' : 'text-red-600'}>
                   {syncService.isBackendAvailable() ? 'Available' : 'Unavailable'}
                 </span>
               </div>
               <div className="flex justify-between">
                 <span>Online Status:</span>
                 <span className={navigator.onLine ? 'text-green-600' : 'text-red-600'}>
                   {navigator.onLine ? 'Online' : 'Offline'}
                 </span>
               </div>
             </div>
           </CardContent>
         </Card>
       )}
     </div>
   );
 }
