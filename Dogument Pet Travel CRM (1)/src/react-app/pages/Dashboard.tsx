import { useApi } from '@/react-app/hooks/useApi';
import { Order, Customer, Quote, InventoryItem, Employee, Schedule } from '@/shared/types';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  UserCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Calendar
} from 'lucide-react';

export default function Dashboard() {
  const { data: orders } = useApi<Order[]>('/api/orders');
  const { data: customers } = useApi<Customer[]>('/api/customers');
  const { data: quotes } = useApi<Quote[]>('/api/quotes');
  const { data: inventory } = useApi<InventoryItem[]>('/api/inventory');
  const { data: employees } = useApi<Employee[]>('/api/employees');
  const { data: schedules } = useApi<Schedule[]>('/api/schedules');

  // Calculate statistics
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
  const activeQuotes = quotes?.filter(quote => quote.status === 'sent').length || 0;
  const lowStockItems = inventory?.filter(item => item.quantity < 10).length || 0;
  const activeEmployees = employees?.filter(employee => employee.is_active).length || 0;
  const todaysSchedules = schedules?.filter(schedule => {
    const today = new Date().toISOString().split('T')[0];
    return schedule.scheduled_date === today;
  }).length || 0;
  const pendingSchedules = schedules?.filter(schedule => schedule.status === 'scheduled').length || 0;

  // Recent orders
  const recentOrders = orders?.slice(0, 5) || [];
  const recentQuotes = quotes?.slice(0, 5) || [];

  const stats = [
    {
      name: 'Total Customers',
      value: customers?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      name: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+18%',
    },
    {
      name: 'Active Orders',
      value: pendingOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: '+5%',
    },
    {
      name: 'Active Quotes',
      value: activeQuotes,
      icon: FileText,
      color: 'bg-pink-500',
      change: '+23%',
    },
    {
      name: "Today's Schedule",
      value: todaysSchedules,
      icon: Calendar,
      color: 'bg-indigo-500',
      change: pendingSchedules > 0 ? `${pendingSchedules} pending` : 'All complete',
    },
  ];

  const alerts = [
    ...(lowStockItems > 0 ? [{
      type: 'warning' as const,
      message: `${lowStockItems} inventory item${lowStockItems > 1 ? 's' : ''} running low on stock`,
      action: 'View Inventory'
    }] : []),
    ...(pendingOrders > 5 ? [{
      type: 'info' as const,
      message: `${pendingOrders} orders pending confirmation`,
      action: 'View Orders'
    }] : []),
    ...(todaysSchedules > 0 ? [{
      type: 'info' as const,
      message: `${todaysSchedules} appointment${todaysSchedules > 1 ? 's' : ''} scheduled for today`,
      action: 'View Schedule'
    }] : []),
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to Dogument Pet Travel CRM</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'
            }`}>
              <div className="flex items-center">
                <AlertTriangle className={`w-5 h-5 mr-3 ${
                  alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
                <span className="text-sm font-medium text-gray-900">{alert.message}</span>
              </div>
              <button className={`text-sm font-medium ${
                alert.type === 'warning' ? 'text-yellow-600 hover:text-yellow-800' : 'text-blue-600 hover:text-blue-800'
              }`}>
                {alert.action}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">#{order.order_number}</p>
                    <p className="text-sm text-gray-600">{order.dog_name || 'No pet name'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-sm text-gray-900 mt-1">${order.total_amount || 0}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Quotes</h3>
          <div className="space-y-4">
            {recentQuotes.length > 0 ? (
              recentQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">#{quote.quote_number}</p>
                    <p className="text-sm text-gray-600">{quote.dog_name || 'No pet name'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                    <p className="text-sm text-gray-900 mt-1">${quote.total_amount}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No quotes yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-amber-100 p-4 rounded-xl inline-block mb-3">
              <UserCheck className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeEmployees}</p>
            <p className="text-sm text-gray-600">Active Employees</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 p-4 rounded-xl inline-block mb-3">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{inventory?.length || 0}</p>
            <p className="text-sm text-gray-600">Inventory Items</p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 p-4 rounded-xl inline-block mb-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
            <p className="text-sm text-gray-600">Low Stock Alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
