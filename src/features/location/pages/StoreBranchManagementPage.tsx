'use client';

import { useState, useEffect, useMemo } from 'react';
import { Building2, Store, MapPin, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import SuperAdminHeader from '@/components/SuperAdminHeader';
import { fetchStores, createStore, updateStore, deleteStore, type Store as StoreType } from '@/services/storeService';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'sonner';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function StoreBranchManagementPage() {
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [deletingStore, setDeletingStore] = useState<StoreType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [storePage, setStorePage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Store form state
  const [storeForm, setStoreForm] = useState({
    name: '',
    code: '',
    address: '',
    country: 'India',
    pincode: '',
    branchId: '',
    latitude: 0,
    longitude: 0,
    maxPunchRadiusMeters: 50,
  });
  const { getPosition: getStorePosition, status: storeGeoStatus } = useGeolocation();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const storesData = await fetchStores();
      setStores(storesData);
    } catch (error) {
      console.error('Failed to load stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGetCurrentStoreLocation = () => {
    getStorePosition(async (coords) => {
      setStoreForm((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));

      // Reverse geocoding to get address
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await res.json();
        if (data && data.display_name) {
          setStoreForm((prev) => ({
            ...prev,
            address: data.display_name,
          }));
        }
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
      }
    });
  };

  // Store actions
  const handleStoreCreated = async () => {
    if (!storeForm.name.trim()) {
      toast.error('Store name is required');
      return;
    }
    try {
      const { branchId: _unused, ...payload } = storeForm as any;
      await createStore(payload);
      toast.success('Store created successfully');
      setIsCreateStoreOpen(false);
      setStoreForm({ name: '', code: '', address: '', country: 'India', pincode: '', branchId: '', latitude: 0, longitude: 0, maxPunchRadiusMeters: 50 });
      loadData();
    } catch (error) {
      toast.error('Failed to create store');
    }
  };

  const handleStoreUpdated = async () => {
    if (!editingStore) return;
    if (!storeForm.name.trim()) {
      toast.error('Store name is required');
      return;
    }
    try {
      const { branchId: _unused, ...payload } = storeForm as any;
      await updateStore(editingStore.id.toString(), payload);
      toast.success('Store updated successfully');
      setEditingStore(null);
      setStoreForm({ name: '', code: '', address: '', country: 'India', pincode: '', branchId: '', latitude: 0, longitude: 0, maxPunchRadiusMeters: 50 });
      loadData();
    } catch (error) {
      toast.error('Failed to update store');
    }
  };

  const handleDeleteStoreClick = (store: StoreType) => {
    setDeletingStore(store);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (deletingStore) {
        await deleteStore(deletingStore.id.toString());
        toast.success('Store deleted successfully');
        setDeletingStore(null);
        setIsDeleteModalOpen(false);
        loadData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete');
    }
  };

  const paginatedStores = useMemo(() => {
    const startIndex = (storePage - 1) * ITEMS_PER_PAGE;
    return stores.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [stores, storePage]);

  const totalStorePages = Math.ceil(stores.length / ITEMS_PER_PAGE);

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
          title="Store Management"
          subtitle="Manage physical store locations for your business hierarchy"
          badgeText="Location Management"
          badgeIcon={Building2}
          stats={[
            { label: 'Total Stores', value: stores.length.toString(), icon: Store },
            { label: 'Active Locations', value: stores.filter(o => o.isActive).length.toString(), icon: MapPin },
          ]}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary">Stores</h3>
            <button
              onClick={() => setIsCreateStoreOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-sm text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              <Store className="w-4 h-4 inline mr-2" />
              Add Store
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-text-secondary">Loading stores...</div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No stores found. Click "Add Store" to create your first store.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedStores.map((store) => {
                  return (
                    <div
                      key={store.id}
                      className="flex flex-col justify-between p-4 bg-surface border border-border rounded-sm hover:border-primary/30 transition-all gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-sm bg-primary/10 text-primary shrink-0">
                          <Store className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-text-primary truncate">{store.name}</h4>
                          {store.address && (
                            <p className="mt-2 text-xs text-text-secondary truncate">
                              {store.address}
                            </p>
                          )}
                          {store.latitude && store.longitude && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                              <MapPin className="w-3 h-3 text-primary" />
                              <span className="truncate">
                                {Number(store.latitude).toFixed(4)}, {Number(store.longitude).toFixed(4)} ({store.maxPunchRadiusMeters || 50}m)
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                            <Users className="w-3 h-3" />
                            <span>{store._count?.employees || 0} employees</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-auto">
                        <button
                          onClick={() => {
                            setEditingStore(store);
                            setStoreForm({
                              name: store.name,
                              code: store.code || '',
                              address: store.address || '',
                              country: store.country || 'India',
                              pincode: store.pincode || '',
                              branchId: store.branchId?.toString() || '',
                              latitude: Number(store.latitude) || 0,
                              longitude: Number(store.longitude) || 0,
                              maxPunchRadiusMeters: Number(store.maxPunchRadiusMeters) || 50,
                            });
                          }}
                          className="p-2 hover:bg-surface-variant rounded-sm text-text-secondary hover:text-primary transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStoreClick(store)}
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
                    Showing <span className="font-medium text-text-primary">{(storePage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium text-text-primary">{Math.min(storePage * ITEMS_PER_PAGE, stores.length)}</span> of <span className="font-medium text-text-primary">{stores.length}</span> stores
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

        {/* Create/Edit Store Modal */}
        {(isCreateStoreOpen || editingStore) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-sm w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-text-primary mb-4">{editingStore ? 'Edit Store' : 'Create Store'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Store Name *</label>
                  <input
                    type="text"
                    placeholder="Enter store name"
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Store Code</label>
                  <input
                    type="text"
                    placeholder="Enter store code"
                    value={storeForm.code}
                    onChange={(e) => setStoreForm({ ...storeForm, code: e.target.value })}
                    className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="Enter address"
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm text-text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={storeForm.latitude}
                      onChange={(e) => setStoreForm({ ...storeForm, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={storeForm.longitude}
                      onChange={(e) => setStoreForm({ ...storeForm, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-surface-variant border border-border rounded-sm text-text-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1 flex justify-between">
                    <span>Max Punch Radius (Meters)</span>
                    <span className="text-primary font-bold">{storeForm.maxPunchRadiusMeters || 50}m</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={storeForm.maxPunchRadiusMeters || 50}
                    onChange={(e) => setStoreForm({ ...storeForm, maxPunchRadiusMeters: parseInt(e.target.value) })}
                    className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGetCurrentStoreLocation}
                  disabled={storeGeoStatus === 'loading'}
                  className="w-full py-2 rounded-sm border border-primary/30 bg-primary/5 text-primary font-bold uppercase tracking-widest text-xs hover:bg-primary/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {storeGeoStatus === 'loading' ? (
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
                      setIsCreateStoreOpen(false);
                      setEditingStore(null);
                      setStoreForm({ name: '', code: '', address: '', country: 'India', pincode: '', branchId: '', latitude: 0, longitude: 0, maxPunchRadiusMeters: 50 });
                    }}
                    className="flex-1 px-4 py-2 bg-surface-variant border border-border rounded-sm text-text-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingStore ? handleStoreUpdated : handleStoreCreated}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-sm font-semibold"
                  >
                    {editingStore ? 'Save' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Branch Modal */}

      </motion.div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingStore(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Store"
        message={`Are you sure you want to delete this store? This action cannot be undone.`}
      />
    </motion.div>
  );
}
