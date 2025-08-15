import { useState } from 'react';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import { Schedule, CreateSchedule, Employee, Order } from '@/shared/types';
import Modal from '@/react-app/components/Modal';
import { Plus, Search, Edit, Trash2, Calendar, Clock, MapPin, CheckCircle, AlertCircle, User } from 'lucide-react';

export default function SchedulePage() {
  const { data: schedules, loading, refetch } = useApi<Schedule[]>('/api/schedules');
  const { data: employees } = useApi<Employee[]>('/api/employees');
  const { data: orders } = useApi<Order[]>('/api/orders');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const filteredSchedules = schedules?.filter(schedule => {
    const matchesSearch = 
      (schedule as any).employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule as any).order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
    const matchesDate = !filterDate || schedule.scheduled_date === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const scheduleData: CreateSchedule = {
      employee_id: formData.get('employee_id') ? Number(formData.get('employee_id')) : null,
      order_id: formData.get('order_id') ? Number(formData.get('order_id')) : null,
      schedule_type: formData.get('schedule_type') as any,
      scheduled_date: formData.get('scheduled_date') as string,
      scheduled_time: formData.get('scheduled_time') as string,
      address: formData.get('address') as string,
      status: formData.get('status') as any,
      notes: formData.get('notes') as string,
    };

    try {
      if (editingSchedule) {
        await apiRequest(`/api/schedules/${editingSchedule.id}`, {
          method: 'PUT',
          body: JSON.stringify(scheduleData),
        });
      } else {
        await apiRequest('/api/schedules', {
          method: 'POST',
          body: JSON.stringify(scheduleData),
        });
      }
      
      setIsModalOpen(false);
      setEditingSchedule(null);
      refetch();
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await apiRequest(`/api/schedules/${id}`, { method: 'DELETE' });
        refetch();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const handleComplete = async (schedule: Schedule) => {
    try {
      await apiRequest(`/api/schedules/${schedule.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...schedule,
          status: 'completed',
          completed_at: new Date().toISOString(),
        }),
      });
      refetch();
    } catch (error) {
      console.error('Error completing schedule:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pickup': return 'bg-orange-100 text-orange-800';
      case 'delivery': return 'bg-purple-100 text-purple-800';
      case 'appointment': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Group schedules by date
  const schedulesByDate = filteredSchedules.reduce((acc, schedule) => {
    const date = schedule.scheduled_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Schedule
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterDate('');
            }}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Schedule Calendar View */}
      <div className="space-y-6">
        {Object.keys(schedulesByDate).length > 0 ? (
          Object.entries(schedulesByDate)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, daySchedules]) => (
              <div key={date} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                      {daySchedules.length} appointment{daySchedules.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {daySchedules
                    .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''))
                    .map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(schedule.status)}
                            <span className="font-medium text-gray-900">
                              {schedule.scheduled_time || 'No time set'}
                            </span>
                          </div>

                          <div className="flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(schedule.schedule_type)}`}>
                              {schedule.schedule_type}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                              {schedule.status}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              {(schedule as any).employee_name && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{(schedule as any).employee_name}</span>
                                </div>
                              )}
                              {(schedule as any).order_number && (
                                <span className="font-medium">#{(schedule as any).order_number}</span>
                              )}
                              {schedule.address && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="truncate max-w-xs">{schedule.address}</span>
                                </div>
                              )}
                            </div>
                            {schedule.notes && (
                              <p className="text-sm text-gray-500 mt-1">{schedule.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {schedule.status === 'scheduled' && (
                            <button
                              onClick={() => handleComplete(schedule)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingSchedule(schedule);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No schedules found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
        }}
        title={editingSchedule ? 'Edit Schedule' : 'New Schedule'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select
                name="employee_id"
                defaultValue={editingSchedule?.employee_id || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select employee</option>
                {employees?.filter(emp => emp.is_active).map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Order</label>
              <select
                name="order_id"
                defaultValue={editingSchedule?.order_id || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select order (optional)</option>
                {orders?.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.order_number} - {order.dog_name || 'No pet name'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="schedule_type"
                defaultValue={editingSchedule?.schedule_type || 'pickup'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
                <option value="appointment">Appointment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                defaultValue={editingSchedule?.status || 'scheduled'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                name="scheduled_date"
                defaultValue={editingSchedule?.scheduled_date || ''}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                name="scheduled_time"
                defaultValue={editingSchedule?.scheduled_time || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              defaultValue={editingSchedule?.address || ''}
              placeholder="Location address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              defaultValue={editingSchedule?.notes || ''}
              rows={3}
              placeholder="Additional notes or instructions"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSchedule(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all"
            >
              {editingSchedule ? 'Update' : 'Create'} Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
