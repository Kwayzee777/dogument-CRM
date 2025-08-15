import { useState } from 'react';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import { Employee, CreateEmployee } from '@/shared/types';
import Modal from '@/react-app/components/Modal';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

export default function Employees() {
  const { data: employees, loading, refetch } = useApi<Employee[]>('/api/employees');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees?.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const employeeData: CreateEmployee = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as string,
      is_active: formData.get('is_active') === 'on',
    };

    try {
      if (editingEmployee) {
        await apiRequest(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          body: JSON.stringify(employeeData),
        });
      } else {
        await apiRequest('/api/employees', {
          method: 'POST',
          body: JSON.stringify(employeeData),
        });
      }
      
      setIsModalOpen(false);
      setEditingEmployee(null);
      refetch();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await apiRequest(`/api/employees/${id}`, { method: 'DELETE' });
        refetch();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const toggleActiveStatus = async (employee: Employee) => {
    try {
      await apiRequest(`/api/employees/${employee.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...employee,
          is_active: !employee.is_active,
        }),
      });
      refetch();
    } catch (error) {
      console.error('Error updating employee status:', error);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div key={employee.id} className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 ${
              employee.is_active ? 'border-green-400' : 'border-gray-300'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                    <button
                      onClick={() => toggleActiveStatus(employee)}
                      className={`p-1 rounded-full ${
                        employee.is_active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {employee.is_active ? (
                        <UserCheck className="w-5 h-5" />
                      ) : (
                        <UserX className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {employee.role && (
                    <p className="text-sm text-amber-600 font-medium mb-2">{employee.role}</p>
                  )}
                  
                  <div className="space-y-1">
                    {employee.email && (
                      <p className="text-sm text-gray-600">{employee.email}</p>
                    )}
                    {employee.phone && (
                      <p className="text-sm text-gray-600">{employee.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingEmployee(employee);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  employee.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </span>
                <p className="text-xs text-gray-500">
                  Added {new Date(employee.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <UserCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No employees found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        title={editingEmployee ? 'Edit Employee' : 'New Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              defaultValue={editingEmployee?.name || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={editingEmployee?.email || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                defaultValue={editingEmployee?.phone || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              name="role"
              defaultValue={editingEmployee?.role || ''}
              placeholder="e.g., Driver, Manager, Customer Service"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              defaultChecked={editingEmployee?.is_active ?? true}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Active employee
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingEmployee(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              {editingEmployee ? 'Update' : 'Create'} Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
