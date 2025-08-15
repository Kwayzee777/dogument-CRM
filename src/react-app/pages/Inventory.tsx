import { useState } from 'react';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import { InventoryItem, CreateInventoryItem } from '@/shared/types';
import Modal from '@/react-app/components/Modal';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';

export default function Inventory() {
  const { data: inventory, loading, refetch } = useApi<InventoryItem[]>('/api/inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const itemData: CreateInventoryItem = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      quantity: Number(formData.get('quantity')),
      unit_price: formData.get('unit_price') ? Number(formData.get('unit_price')) : undefined,
      sku: formData.get('sku') as string,
    };

    try {
      if (editingItem) {
        await apiRequest(`/api/inventory/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(itemData),
        });
      } else {
        await apiRequest('/api/inventory', {
          method: 'POST',
          body: JSON.stringify(itemData),
        });
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
      refetch();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await apiRequest(`/api/inventory/${id}`, { method: 'DELETE' });
        refetch();
      } catch (error) {
        console.error('Error deleting inventory item:', error);
      }
    }
  };

  const getStockStatusColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600 bg-red-50';
    if (quantity < 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusText = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInventory.length > 0 ? (
          filteredInventory.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                  {item.category && (
                    <p className="text-sm text-purple-600 font-medium mt-1">{item.category}</p>
                  )}
                  {item.sku && (
                    <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
              )}

              <div className="space-y-3">
                {/* Stock Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Stock:</span>
                  <div className="flex items-center space-x-2">
                    {item.quantity < 10 && item.quantity > 0 && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item.quantity)}`}>
                      {getStockStatusText(item.quantity)}
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <span className="text-lg font-bold text-gray-900">{item.quantity}</span>
                </div>

                {/* Price */}
                {item.unit_price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Unit Price:</span>
                    <span className="text-lg font-bold text-green-600">${item.unit_price}</span>
                  </div>
                )}

                {/* Total Value */}
                {item.unit_price && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-700">Total Value:</span>
                    <span className="text-lg font-bold text-purple-600">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No inventory items found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Item' : 'New Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              defaultValue={editingItem?.name || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                defaultValue={editingItem?.category || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                name="sku"
                defaultValue={editingItem?.sku || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              defaultValue={editingItem?.description || ''}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                defaultValue={editingItem?.quantity || 0}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
              <input
                type="number"
                name="unit_price"
                defaultValue={editingItem?.unit_price || ''}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
            >
              {editingItem ? 'Update' : 'Create'} Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
