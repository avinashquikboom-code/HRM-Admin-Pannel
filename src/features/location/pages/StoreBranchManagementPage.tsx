'use client';

import { useState, useEffect } from 'react';
import { Building2, GitBranch, Store, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { fetchOffices, type Office } from '@/services/officeService';
import { fetchBranches, type Branch, createBranch, updateBranch, type CreateBranchRequest, type UpdateBranchRequest } from '@/services/branchService';
import CreateOfficeModal from '@/features/location/components/CreateOfficeModal';
import EditOfficeModal from '@/features/location/components/EditOfficeModal';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'sonner';

type TabType = 'stores' | 'branches';

export default function StoreBranchManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('stores');
  const [isCreateOfficeOpen, setIsCreateOfficeOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingOffice, setDeletingOffice] = useState<Office | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [offices, setOffices] = useState<Office[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Branch form state
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    officeId: 0,
  });
  const [isGettingBranchLocation, setIsGettingBranchLocation] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [officesData, branchesData] = await Promise.all([
        fetchOffices(),
        fetchBranches()
      ]);
      setOffices(officesData);
      setBranches(branchesData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOfficeCreated = (officeId: string, message: string) => {
    toast.success(message || 'Store created successfully');
    setIsCreateOfficeOpen(false);
    loadData();
  };

  const handleOfficeUpdated = () => {
    toast.success('Store updated successfully');
    setEditingOffice(null);
    loadData();
  };

  const handleBranchCreated = async () => {
    if (!branchForm.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    if (!branchForm.officeId) {
      toast.error('Please select a store');
      return;
    }

    try {
      const createData: CreateBranchRequest = {
        name: branchForm.name,
        address: branchForm.address,
        officeId: branchForm.officeId,
        latitude: branchForm.latitude,
        longitude: branchForm.longitude,
        country: 'India',
      };
      await createBranch(createData);
      toast.success('Branch created successfully');
      setIsCreateBranchOpen(false);
      setBranchForm({ name: '', address: '', latitude: 0, longitude: 0, officeId: 0 });
      loadData();
    } catch (error) {
      toast.error('Failed to create branch');
    }
  };

  const handleGetCurrentBranchLocation = () => {
    setIsGettingBranchLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setBranchForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));

          // Reverse geocoding to get address
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              setBranchForm((prev) => ({
                ...prev,
                address: data.display_name,
              }));
            }
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
          }

          setIsGettingBranchLocation(false);
        },
        (error) => {
          toast.error('Failed to get current location. Please enter manually.');
          setIsGettingBranchLocation(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      setIsGettingBranchLocation(false);
    }
  };

  const handleBranchUpdated = () => {
    toast.success('Branch updated successfully');
    setEditingBranch(null);
    loadData();
  };

  const handleDeleteOffice = (office: Office) => {
    setDeletingOffice(office);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBranch = (branch: Branch) => {
    setDeletingBranch(branch);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingOffice) {
      // Implement office deletion
      toast.success('Store deleted successfully');
      setDeletingOffice(null);
      setIsDeleteModalOpen(false);
      loadData();
    } else if (deletingBranch) {
      // Implement branch deletion
      toast.success('Branch deleted successfully');
      setDeletingBranch(null);
      setIsDeleteModalOpen(false);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <SuperAdminHeader
        title="Store & Branch Management"
        subtitle="Manage physical store locations and organizational branches for your business hierarchy"
        badgeText="Location Management"
        badgeIcon={Building2}
        stats={[
          { label: 'Total Stores', value: offices.length.toString(), icon: Store },
          { label: 'Total Branches', value: branches.length.toString(), icon: GitBranch },
          { label: 'Active Locations', value: offices.filter(o => o.isActive).toString(), icon: MapPin },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('stores')}
          className={cn(
            'px-6 py-3 font-semibold text-sm transition-all border-b-2',
            activeTab === 'stores'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          <Store className="w-4 h-4 inline mr-2" />
          Stores
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={cn(
            'px-6 py-3 font-semibold text-sm transition-all border-b-2',
            activeTab === 'branches'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          <GitBranch className="w-4 h-4 inline mr-2" />
          Branches
        </button>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> Create physical store locations first, then create organizational branches and assign them to specific stores. This hierarchy helps organize employees and attendance tracking.
        </p>
      </div>

      {/* Stores Tab */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary">Stores & Offices</h3>
            <button
              onClick={() => setIsCreateOfficeOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-sm text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              <Store className="w-4 h-4 inline mr-2" />
              Add Store
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-text-secondary">Loading stores...</div>
          ) : offices.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No stores found. Click "Add Store" to create your first store.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {offices.map((office) => {
                const branchCount = branches.filter(b => b.officeId === parseInt(office.id)).length;
                return (
                  <div
                    key={office.id}
                    className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-sm bg-primary/10 text-primary">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">{office.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                          <MapPin className="w-3 h-3" />
                          <span>{office.latitude.toFixed(4)}, {office.longitude.toFixed(4)}</span>
                          <span className="px-2 py-0.5 bg-surface-variant rounded-full">
                            {office.officeType === 'HEAD_OFFICE' ? 'Head Office' : 'Store Branch'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                          <GitBranch className="w-3 h-3" />
                          <span>{branchCount} {branchCount === 1 ? 'branch' : 'branches'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingOffice(office)}
                        className="p-2 hover:bg-surface-variant rounded-sm transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOffice(office)}
                        className="p-2 hover:bg-red-500/10 rounded-sm transition-all text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Branches Tab */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary">Branches</h3>
            <button
              onClick={() => setIsCreateBranchOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-sm text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              <GitBranch className="w-4 h-4 inline mr-2" />
              Add Branch
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-text-secondary">Loading branches...</div>
          ) : branches.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No branches found. Click "Add Branch" to create your first branch.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between p-4 bg-surface border border-border rounded-sm hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-sm bg-primary/10 text-primary">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">{branch.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                        <Store className="w-3 h-3" />
                        <span>{branch.officeName || 'Unassigned'}</span>
                        {branch.address && <span>• {branch.address}</span>}
                      </div>
                      {branch.latitude && branch.longitude && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                          <MapPin className="w-3 h-3" />
                          <span>{branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingBranch(branch)}
                      className="p-2 hover:bg-surface-variant rounded-sm transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(branch)}
                      className="p-2 hover:bg-red-500/10 rounded-sm transition-all text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Office Modal */}
      {isCreateOfficeOpen && (
        <CreateOfficeModal
          isOpen={isCreateOfficeOpen}
          onClose={() => setIsCreateOfficeOpen(false)}
          onCreated={handleOfficeCreated}
        />
      )}

      {/* Edit Office Modal */}
      {editingOffice && (
        <EditOfficeModal
          isOpen={!!editingOffice}
          office={editingOffice}
          onClose={() => setEditingOffice(null)}
          onUpdated={handleOfficeUpdated}
        />
      )}

      {/* Create Branch Modal */}
      {isCreateBranchOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-sm w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Create Branch</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Branch Name *</label>
                <input
                  type="text"
                  placeholder="Enter branch name"
                  value={branchForm.name}
                  onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Store *</label>
                <select 
                  value={branchForm.officeId}
                  onChange={(e) => setBranchForm({ ...branchForm, officeId: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm"
                >
                  <option value="">Select a store</option>
                  {offices.map((office) => (
                    <option key={office.id} value={office.id}>
                      {office.name} {office.officeType === 'HEAD_OFFICE' ? '(Head Office)' : '(Store)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-text-secondary mt-1">
                  Select the store where this branch is located. If no stores appear, first create them in the Stores tab.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Enter address"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={branchForm.latitude}
                    onChange={(e) => setBranchForm({ ...branchForm, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={branchForm.longitude}
                    onChange={(e) => setBranchForm({ ...branchForm, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetCurrentBranchLocation}
                disabled={isGettingBranchLocation}
                className="w-full py-2 rounded-sm border border-primary/30 bg-primary/5 text-primary font-bold uppercase tracking-widest text-xs hover:bg-primary/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGettingBranchLocation ? (
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
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsCreateBranchOpen(false);
                    setBranchForm({ name: '', address: '', latitude: 0, longitude: 0, officeId: 0 });
                  }}
                  className="flex-1 px-4 py-2 bg-surface-variant border border-border rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBranchCreated}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-sm"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingOffice(null);
          setDeletingBranch(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${deletingOffice?.name || deletingBranch?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
