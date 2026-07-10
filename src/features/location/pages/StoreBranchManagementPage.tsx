'use client';

import { useState, useEffect, useMemo } from 'react';
import { Building2, GitBranch, Store, MapPin, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { fetchOffices, deleteOffice, type Office } from '@/services/officeService';
import { fetchBranches, type Branch, createBranch, updateBranch, deleteBranch, type CreateBranchRequest, type UpdateBranchRequest } from '@/services/branchService';
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
  
  // Pagination state
  const [storePage, setStorePage] = useState(1);
  const [branchPage, setBranchPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  
  // Branch form state
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    officeId: 0,
    maxPunchRadiusMeters: 50,
  });
  const [isGettingBranchLocation, setIsGettingBranchLocation] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load offices first
      const officesData = await fetchOffices();
      setOffices(officesData);
      
      // Load branches separately
      try {
        const branchesData = await fetchBranches();
        setBranches(branchesData);
      } catch (branchError) {
        console.error('Failed to load branches:', branchError);
        // Continue even if branches fail
        setBranches([]);
      }
    } catch (error) {
      console.error('Failed to load offices:', error);
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
        maxPunchRadiusMeters: branchForm.maxPunchRadiusMeters,
      };
      await createBranch(createData);
      toast.success('Branch created successfully');
      setIsCreateBranchOpen(false);
      setBranchForm({ name: '', address: '', latitude: 0, longitude: 0, officeId: 0, maxPunchRadiusMeters: 50 });
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

  const handleBranchUpdated = async () => {
    if (!editingBranch) return;
    if (!branchForm.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    if (!branchForm.officeId) {
      toast.error('Please select a store');
      return;
    }

    try {
      const updateData: UpdateBranchRequest = {
        name: branchForm.name,
        address: branchForm.address,
        officeId: branchForm.officeId,
        latitude: branchForm.latitude,
        longitude: branchForm.longitude,
        maxPunchRadiusMeters: branchForm.maxPunchRadiusMeters,
      };
      await updateBranch(editingBranch.id.toString(), updateData);
      toast.success('Branch updated successfully');
      setEditingBranch(null);
      setBranchForm({ name: '', address: '', latitude: 0, longitude: 0, officeId: 0, maxPunchRadiusMeters: 50 });
      loadData();
    } catch (error) {
      toast.error('Failed to update branch');
    }
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
    try {
      if (deletingOffice) {
        await deleteOffice(deletingOffice.id.toString());
        toast.success('Store deleted successfully');
        setDeletingOffice(null);
        setIsDeleteModalOpen(false);
        loadData();
      } else if (deletingBranch) {
        await deleteBranch(deletingBranch.id.toString());
        toast.success('Branch deleted successfully');
        setDeletingBranch(null);
        setIsDeleteModalOpen(false);
        loadData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete');
    }
  };

  const paginatedOffices = useMemo(() => {
    const startIndex = (storePage - 1) * ITEMS_PER_PAGE;
    return offices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [offices, storePage]);

  const totalStorePages = Math.ceil(offices.length / ITEMS_PER_PAGE);

  const paginatedBranches = useMemo(() => {
    const startIndex = (branchPage - 1) * ITEMS_PER_PAGE;
    return branches.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [branches, branchPage]);

  const totalBranchPages = Math.ceil(branches.length / ITEMS_PER_PAGE);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.04 },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 pb-10"
    >
      <motion.div variants={itemVariants}>
        <SuperAdminHeader
          title="Store & Branch Management"
          subtitle="Manage physical store locations and organizational branches for your business hierarchy"
          badgeText="Location Management"
          badgeIcon={Building2}
          stats={[
            { label: 'Total Stores', value: offices.length.toString(), icon: Store },
            { label: 'Total Branches', value: branches.length.toString(), icon: GitBranch },
            { label: 'Active Locations', value: offices.filter(o => o.isActive).length.toString(), icon: MapPin },
          ]}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
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

      {/* Stores Tab */}
      {activeTab === 'stores' && (
        <div className="space-y-3">
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedOffices.map((office) => {
                  const branchCount = branches.filter(b => b.officeId === parseInt(office.id)).length;
                return (
                  <div
                    key={office.id}
                    className="flex flex-col justify-between p-4 bg-surface border border-border rounded-sm hover:border-primary/30 transition-all gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-sm bg-primary/10 text-primary shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-text-primary truncate">{office.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-text-secondary">
                          <span className="px-2 py-0.5 bg-surface-variant rounded-full whitespace-nowrap">
                            {office.officeType === 'HEAD_OFFICE' ? 'Head Office' : 'Store Branch'}
                          </span>
                          <span className="flex items-center gap-1 whitespace-nowrap">
                            <MapPin className="w-3 h-3" />
                            {office.latitude.toFixed(4)}, {office.longitude.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                          <GitBranch className="w-3 h-3" />
                          <span>{branchCount} {branchCount === 1 ? 'branch' : 'branches'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                          <Users className="w-3 h-3" />
                          <span>{office._count?.employees || 0} employees</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-auto">
                      <button
                        onClick={() => setEditingOffice(office)}
                        className="p-2 hover:bg-surface-variant rounded-sm text-text-secondary hover:text-primary transition-all"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteOffice(office)}
                        className="p-2 hover:bg-surface-variant rounded-sm transition-all text-text-secondary hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
              
              {totalStorePages > 1 && (
                <div className="flex items-center justify-between mt-6 border-t border-border pt-4">
                  <p className="text-sm text-text-secondary">
                    Showing <span className="font-medium text-text-primary">{(storePage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-text-primary">{Math.min(storePage * ITEMS_PER_PAGE, offices.length)}</span> of <span className="font-medium text-text-primary">{offices.length}</span> stores
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStorePage(p => Math.max(1, p - 1))}
                      disabled={storePage === 1}
                      className="p-2 rounded-sm border border-border bg-surface text-text-secondary hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalStorePages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setStorePage(page)}
                          className={cn(
                            "w-8 h-8 rounded-sm text-sm font-medium transition-all",
                            storePage === page
                              ? "bg-primary text-white"
                              : "border border-border bg-surface text-text-secondary hover:bg-surface-variant"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setStorePage(p => Math.min(totalStorePages, p + 1))}
                      disabled={storePage === totalStorePages}
                      className="p-2 rounded-sm border border-border bg-surface text-text-secondary hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Branches Tab */}
      {activeTab === 'branches' && (
        <div className="space-y-3">
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex flex-col justify-between p-4 bg-surface border border-border rounded-sm hover:border-primary/30 transition-all gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-sm bg-primary/10 text-primary shrink-0">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text-primary truncate">{branch.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-text-secondary">
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Store className="w-3 h-3" />
                          {branch.officeName || 'Unassigned'}
                        </span>
                      </div>
                      {branch.address && (
                        <p className="mt-2 text-xs text-text-secondary truncate">
                          {branch.address}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                        <Users className="w-3 h-3" />
                        <span>{branch.stores?.reduce((acc, s) => acc + (s._count?.employees || 0), 0) || 0} employees</span>
                      </div>
                      {branch.latitude && branch.longitude && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                          <MapPin className="w-3 h-3" />
                          <span>{branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-auto">
                    <button
                      onClick={() => {
                        setEditingBranch(branch);
                        setBranchForm({
                          name: branch.name,
                          address: branch.address || '',
                          latitude: branch.latitude || 0,
                          longitude: branch.longitude || 0,
                          officeId: branch.officeId || 0,
                          maxPunchRadiusMeters: branch.maxPunchRadiusMeters || 50
                        });
                      }}
                      className="p-2 hover:bg-surface-variant rounded-sm text-text-secondary hover:text-primary transition-all"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBranch(branch)}
                      className="p-2 hover:bg-surface-variant rounded-sm transition-all text-text-secondary hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              </div>
              
              {totalBranchPages > 1 && (
                <div className="flex items-center justify-between mt-6 border-t border-border pt-4">
                  <p className="text-sm text-text-secondary">
                    Showing <span className="font-medium text-text-primary">{(branchPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-text-primary">{Math.min(branchPage * ITEMS_PER_PAGE, branches.length)}</span> of <span className="font-medium text-text-primary">{branches.length}</span> branches
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBranchPage(p => Math.max(1, p - 1))}
                      disabled={branchPage === 1}
                      className="p-2 rounded-sm border border-border bg-surface text-text-secondary hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalBranchPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setBranchPage(page)}
                          className={cn(
                            "w-8 h-8 rounded-sm text-sm font-medium transition-all",
                            branchPage === page
                              ? "bg-primary text-white"
                              : "border border-border bg-surface text-text-secondary hover:bg-surface-variant"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setBranchPage(p => Math.min(totalBranchPages, p + 1))}
                      disabled={branchPage === totalBranchPages}
                      className="p-2 rounded-sm border border-border bg-surface text-text-secondary hover:bg-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
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

      {/* Create/Edit Branch Modal */}
      {(isCreateBranchOpen || editingBranch) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-sm w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">{editingBranch ? 'Edit Branch' : 'Create Branch'}</h2>
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
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1 flex justify-between">
                  <span>Max Punch Radius (Meters)</span>
                  <span className="text-primary font-bold">{branchForm.maxPunchRadiusMeters || 50}m</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={branchForm.maxPunchRadiusMeters || 50}
                  onChange={(e) => setBranchForm({ ...branchForm, maxPunchRadiusMeters: parseInt(e.target.value) })}
                  className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                />
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
                    setEditingBranch(null);
                    setBranchForm({ name: '', address: '', latitude: 0, longitude: 0, officeId: 0, maxPunchRadiusMeters: 50 });
                  }}
                  className="flex-1 px-4 py-2 bg-surface-variant border border-border rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={editingBranch ? handleBranchUpdated : handleBranchCreated}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-sm"
                >
                  {editingBranch ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </motion.div>

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
    </motion.div>
  );
}
