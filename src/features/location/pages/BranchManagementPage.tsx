'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Building2, 
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
  Store,
  Loader2
} from 'lucide-react';
import { fetchBranches, createBranch, updateBranch, deleteBranch, type Branch, type CreateBranchRequest, type UpdateBranchRequest } from '@/services/branchService';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import { cn } from '@/utils/cn';
import { fetchOffices, type Office } from '@/services/officeService';

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

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
    email: '',
    officeId: 0,
    latitude: 0,
    longitude: 0,
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const fetchBranchesData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchBranches();
      setBranches(data);
    } catch (error) {
      toast.error('Failed to fetch branches');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOfficesData = async () => {
    try {
      setIsLoadingOffices(true);
      const data = await fetchOffices();
      setOffices(data);
    } catch (error) {
      toast.error('Failed to fetch offices');
    } finally {
      setIsLoadingOffices(false);
    }
  };

  useEffect(() => {
    fetchBranchesData();
    fetchOfficesData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      phone: '',
      email: '',
      officeId: 0,
      latitude: 0,
      longitude: 0,
    });
  };

  const handleCreateBranch = async () => {
    if (!formData.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    if (!formData.officeId) {
      toast.error('Please select a store');
      return;
    }

    try {
      setIsSaving(true);
      const createData: CreateBranchRequest = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        phone: formData.phone,
        email: formData.email,
        officeId: formData.officeId,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      await createBranch(createData);
      toast.success('Branch created successfully');
      resetForm();
      setIsCreateModalOpen(false);
      fetchBranchesData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create branch');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch || !formData.name.trim()) {
      toast.error('Branch name is required');
      return;
    }

    try {
      setIsSaving(true);
      const updateData: UpdateBranchRequest = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        phone: formData.phone,
        email: formData.email,
        officeId: formData.officeId || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      await updateBranch(editingBranch.id.toString(), updateData);
      toast.success('Branch updated successfully');
      setEditingBranch(null);
      resetForm();
      fetchBranchesData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update branch');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));

          // Reverse geocoding to get address
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              setFormData((prev) => ({
                ...prev,
                address: data.display_name,
              }));
            }
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
          }

          setIsGettingLocation(false);
        },
        (error) => {
          toast.error('Failed to get current location. Please enter manually.');
          setIsGettingLocation(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      setIsGettingLocation(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranch) return;

    try {
      setIsSaving(true);
      await deleteBranch(deletingBranch.id.toString());
      toast.success('Branch deleted successfully');
      setDeletingBranch(null);
      setIsDeleteModalOpen(false);
      fetchBranchesData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete branch');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country,
      pincode: branch.pincode || '',
      phone: branch.phone || '',
      email: branch.email || '',
      officeId: branch.officeId || 0,
      latitude: branch.latitude || 0,
      longitude: branch.longitude || 0,
    });
  };

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.code && branch.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (branch.city && branch.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create organizational branches and assign them to specific stores/offices</p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>How it works:</strong> First create stores/offices in Location page, then create branches here and assign them to those stores. Branches help organize employees within a store location.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Branch
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchBranchesData}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading branches...</div>
          ) : filteredBranches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No branches found</div>
          ) : (
            filteredBranches.map((branch) => (
              <motion.div
                key={branch.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-green-100 text-green-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{branch.name}</h3>
                        {branch.code && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {branch.code}
                          </span>
                        )}
                        <span className={cn(
                          'flex items-center gap-1 text-xs',
                          branch.isActive ? 'text-green-600' : 'text-gray-400'
                        )}>
                          {branch.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {branch.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{branch.address}</span>
                          </div>
                        )}
                        {(branch.city || branch.state) && (
                          <div className="text-sm text-gray-600">
                            {branch.city}{branch.city && branch.state && ', '}{branch.state}
                          </div>
                        )}
                        {branch.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>{branch.email}</span>
                          </div>
                        )}
                        {branch.officeName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                            <Store className="w-3 h-3" />
                            <span>{branch.officeName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(branch)}
                      className="p-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingBranch(branch);
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

      {/* Create/Edit Branch Modal */}
      {(isCreateModalOpen || editingBranch) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingBranch ? 'Edit Branch' : 'Create New Branch'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  placeholder="Enter branch name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store *</label>
                <select
                  value={formData.officeId}
                  onChange={(e) => setFormData({ ...formData, officeId: parseInt(e.target.value) || 0 })}
                  disabled={isLoadingOffices}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select a store</option>
                  {offices.map((office) => (
                    <option key={office.id} value={office.id}>
                      {office.name} {office.officeType === 'HEAD_OFFICE' ? '(Head Office)' : '(Store)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the store/office where this branch is located. If no stores appear, first create them in the Location page.
                </p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="w-full py-2 rounded-sm border border-primary/30 bg-primary/5 text-primary font-bold uppercase tracking-widest text-xs hover:bg-primary/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin size={14} />
                    Get Current Location
                  </>
                )}
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingBranch(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingBranch ? handleUpdateBranch : handleCreateBranch}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : (editingBranch ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBranch && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingBranch(null);
          }}
          onConfirm={handleDeleteBranch}
          title="Delete Branch"
          message={`Are you sure you want to delete the branch "${deletingBranch.name}"? This action cannot be undone.`}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
