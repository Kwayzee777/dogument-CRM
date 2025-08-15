import { useState } from 'react';
import { useApi, apiRequest } from '@/react-app/hooks/useApi';
import { Quote, Customer, CreateQuote } from '@/shared/types';
import Modal from '@/react-app/components/Modal';
import { Plus, Search, Edit, Trash2, FileText, Mail, Check } from 'lucide-react';

export default function Quotes() {
  const { data: quotes, loading, refetch } = useApi<Quote[]>('/api/quotes');
  const { data: customers } = useApi<Customer[]>('/api/customers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedQuoteId, setCopiedQuoteId] = useState<number | null>(null);

  const filteredQuotes = quotes?.filter(quote => 
    quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.dog_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quote as any).customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.departure_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.destination_city?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const generateQuoteNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `DPT-${timestamp}`;
  };

  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const flightCost = Number(formData.get('flight_cost')) || 0;
    const boardingCost = Number(formData.get('boarding_cost')) || 0;
    const medicalCost = Number(formData.get('medical_cost')) || 0;
    const additionalFees = Number(formData.get('additional_fees')) || 0;

    const quoteData: CreateQuote = {
      customer_id: formData.get('customer_id') ? Number(formData.get('customer_id')) : null,
      quote_number: formData.get('quote_number') as string || generateQuoteNumber(),
      status: formData.get('status') as any,
      dog_name: formData.get('dog_name') as string,
      dog_breed: formData.get('dog_breed') as string,
      dog_weight: formData.get('dog_weight') ? Number(formData.get('dog_weight')) : undefined,
      departure_city: formData.get('departure_city') as string,
      destination_city: formData.get('destination_city') as string,
      travel_date: formData.get('travel_date') as string,
      flight_cost: flightCost,
      boarding_cost: boardingCost,
      medical_cost: medicalCost,
      additional_fees: additionalFees,
      notes: formData.get('notes') as string,
      valid_until: formData.get('valid_until') as string,
    };

    try {
      if (editingQuote) {
        await apiRequest(`/api/quotes/${editingQuote.id}`, {
          method: 'PUT',
          body: JSON.stringify(quoteData),
        });
      } else {
        await apiRequest('/api/quotes', {
          method: 'POST',
          body: JSON.stringify(quoteData),
        });
      }
      
      setIsModalOpen(false);
      setEditingQuote(null);
      refetch();
    } catch (error) {
      console.error('Error saving quote:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this quote?')) {
      try {
        await apiRequest(`/api/quotes/${id}`, { method: 'DELETE' });
        refetch();
      } catch (error) {
        console.error('Error deleting quote:', error);
      }
    }
  };

  const generateEmailQuote = (quote: Quote) => {
    const customer = customers?.find(c => c.id === quote.customer_id);
    const validUntil = quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : '30 days from quote date';
    
    return `Subject: Pet Travel Quote - ${quote.quote_number}

Dear ${customer?.name || 'Valued Customer'},

Thank you for considering Dogument Pet Travel for your pet's journey. We are pleased to provide you with the following quote for transporting your beloved ${quote.dog_name || 'pet'}.

QUOTE DETAILS
Quote Number: ${quote.quote_number}
Pet Name: ${quote.dog_name || 'N/A'}
Breed: ${quote.dog_breed || 'N/A'}
Weight: ${quote.dog_weight ? `${quote.dog_weight} lbs` : 'N/A'}
Route: ${quote.departure_city || 'N/A'} → ${quote.destination_city || 'N/A'}
Travel Date: ${quote.travel_date ? new Date(quote.travel_date).toLocaleDateString() : 'TBD'}

COST BREAKDOWN
Flight Costs: $${quote.flight_cost.toFixed(2)}
Boarding Fees: $${quote.boarding_cost.toFixed(2)}
Medical Expenses (Health Certificates & Documents): $${quote.medical_cost.toFixed(2)}
Additional Fees: $${quote.additional_fees.toFixed(2)}

TOTAL: $${quote.total_amount.toFixed(2)}

${quote.notes ? `\nADDITIONAL NOTES:\n${quote.notes}\n` : ''}
This quote is valid until: ${validUntil}

Our experienced team ensures your pet's safety and comfort throughout the journey. All necessary health certificates, documentation, and compliance with international travel requirements are included in our medical expenses.

To proceed with booking or if you have any questions, please don't hesitate to contact us.

Best regards,
Dogument Pet Travel Team

---
This quote was generated on ${new Date().toLocaleDateString()}`;
  };

  const copyToClipboard = async (quote: Quote) => {
    try {
      const emailText = generateEmailQuote(quote);
      await navigator.clipboard.writeText(emailText);
      setCopiedQuoteId(quote.id);
      setTimeout(() => setCopiedQuoteId(null), 2000);
    } catch (error) {
      console.error('Failed to copy quote:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quote Generator</h1>
          <p className="text-gray-600 mt-1">Create and manage quotes for Dogument Pet Travel</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Quote
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search quotes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuotes.length > 0 ? (
          filteredQuotes.map((quote) => (
            <div key={quote.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-pink-400">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">#{quote.quote_number}</h3>
                  <p className="text-sm text-pink-600 font-medium">
                    {(quote as any).customer_name || 'No customer'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(quote)}
                    className={`p-2 rounded-lg transition-colors ${
                      copiedQuoteId === quote.id
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-400 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                    title="Copy email quote"
                  >
                    {copiedQuoteId === quote.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingQuote(quote);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pet & Travel Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pet:</span>
                  <span className="font-medium">{quote.dog_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium text-right">
                    {quote.departure_city || 'N/A'} → {quote.destination_city || 'N/A'}
                  </span>
                </div>
                {quote.travel_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(quote.travel_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Flight Costs:</span>
                    <span>${quote.flight_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Boarding Fees:</span>
                    <span>${quote.boarding_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Expenses:</span>
                    <span>${quote.medical_cost.toFixed(2)}</span>
                  </div>
                  {quote.additional_fees > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Fees:</span>
                      <span>${quote.additional_fees.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-pink-600">${quote.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status & Date */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                  {quote.order_id && (
                    <span className="text-xs text-green-600 mt-1 font-medium">
                      Order Created: ORD-{quote.quote_number.split('-')[1]}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(quote.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No quotes found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuote(null);
        }}
        title={editingQuote ? 'Edit Quote' : 'New Quote'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote Number</label>
              <input
                type="text"
                name="quote_number"
                defaultValue={editingQuote?.quote_number || generateQuoteNumber()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                name="customer_id"
                defaultValue={editingQuote?.customer_id || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Select customer</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
              <input
                type="text"
                name="dog_name"
                defaultValue={editingQuote?.dog_name || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <input
                type="text"
                name="dog_breed"
                defaultValue={editingQuote?.dog_breed || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
              <input
                type="number"
                name="dog_weight"
                defaultValue={editingQuote?.dog_weight || ''}
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure City</label>
              <input
                type="text"
                name="departure_city"
                defaultValue={editingQuote?.departure_city || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination City</label>
              <input
                type="text"
                name="destination_city"
                defaultValue={editingQuote?.destination_city || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
              <input
                type="date"
                name="travel_date"
                defaultValue={editingQuote?.travel_date || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                name="valid_until"
                defaultValue={editingQuote?.valid_until || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flight Costs</label>
                <input
                  type="number"
                  name="flight_cost"
                  defaultValue={editingQuote?.flight_cost || 0}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boarding Fees</label>
                <input
                  type="number"
                  name="boarding_cost"
                  defaultValue={editingQuote?.boarding_cost || 0}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Expenses</label>
                <input
                  type="number"
                  name="medical_cost"
                  defaultValue={editingQuote?.medical_cost || 0}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Fees</label>
                <input
                  type="number"
                  name="additional_fees"
                  defaultValue={editingQuote?.additional_fees || 0}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                defaultValue={editingQuote?.status || 'draft'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              defaultValue={editingQuote?.notes || ''}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Special requirements, additional services, etc."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingQuote(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all"
            >
              {editingQuote ? 'Update' : 'Create'} Quote
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
