'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Building2,
  Users
} from 'lucide-react';
import { fetchStores, createStore, updateStore, deleteStore, type Store as StoreType } from '@/services/storeService';
import { fetchBranches, type Branch } from '@/services/branchService';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { cn } from '@/utils/cn';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

export default function StoreManagementPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [deletingStore, setDeletingStore] = useState<StoreType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    country: 'India',
    pincode: '',
    branchId: '',
  });

  const fetchStoresData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchStores(branchFilter);
      setStores(data);
    } catch (error) {
      toast.error('Failed to fetch stores');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranchesData = async () => {
    try {
      const data = await fetchBranches();
      setBranches(data);
    } catch (error) {
      toast.error('Failed to fetch branches');
    }
  };

  useEffect(() => {
    fetchStoresData();
    fetchBranchesData();
  }, [branchFilter]);

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      country: 'India',
      pincode: '',
      branchId: '',
    });
  };

  const handleCreateStore = async () => {
    if (!formData.name.trim()) {
      toast.error('Store name is required');
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = { ...formData };
      if (payload.branchId) {
        payload.branchId = parseInt(payload.branchId);
      } else {
        delete payload.branchId;
      }
      await createStore(payload);
      toast.success('Store created successfully');
      resetForm();
      setIsCreateModalOpen(false);
      fetchStoresData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create store');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStore = async () => {
    if (!editingStore || !formData.name.trim()) {
      toast.error('Store name is required');
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = { ...formData };
      if (payload.branchId) {
        payload.branchId = parseInt(payload.branchId);
      } else {
        delete payload.branchId;
      }
      await updateStore(editingStore.id.toString(), payload);
      toast.success('Store updated successfully');
      setEditingStore(null);
      resetForm();
      fetchStoresData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update store');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!deletingStore) return;

    try {
      setIsSaving(true);
      await deleteStore(deletingStore.id.toString());
      toast.success('Store deleted successfully');
      setDeletingStore(null);
      setIsDeleteModalOpen(false);
      fetchStoresData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete store');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (store: StoreType) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address || '',
      country: store.country,
      pincode: store.pincode || '',
      branchId: store.branchId?.toString() || '',
    });
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (store.code && store.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage retail stores and their assignments</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Store
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </option>
              ))}
            </select>
            <button
              onClick={fetchStoresData}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading stores...</div>
          ) : filteredStores.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No stores found</div>
          ) : (
            filteredStores.map((store) => (
              <motion.div
                key={store.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{store.name}</h3>
                        {store.code && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {store.code}
                          </span>
                        )}
                        <span className={cn(
                          'flex items-center gap-1 text-xs',
                          store.isActive ? 'text-green-600' : 'text-gray-400'
                        )}>
                          {store.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {store.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">

                        {store.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{store.address}</span>
                          </div>
                        )}
                        {store._count && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <Users className="w-3 h-3" />
                            <span>{store._count.employees} employee{store._count.employees !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(store)}
                      className="p-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingStore(store);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Store Modal */}
      {(isCreateModalOpen || editingStore) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingStore ? 'Edit Store' : 'Create New Store'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  placeholder="Enter store name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingStore(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingStore ? handleUpdateStore : handleCreateStore}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : (editingStore ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStore && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingStore(null);
          }}
          onConfirm={handleDeleteStore}
          title="Delete Store"
          message={`Are you sure you want to delete the store "${deletingStore.name}"? This action cannot be undone.`}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
