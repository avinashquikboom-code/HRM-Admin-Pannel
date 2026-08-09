'use client';
import React, { useState, useEffect } from 'react';
import { featureAccessService, FeatureAccess, FeatureAccessRequest } from '@/services/featureAccessService';
import { useEmployees } from '@/hooks/useEmployees';
import { Loader2, Settings, Check, X, ShieldAlert } from 'lucide-react';

export default function EmployeeFeaturesView() {
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'REQUESTS'>('EMPLOYEES');
  const { employees, isLoading: employeesLoading } = useEmployees({ limit: 100 });
  const [requests, setRequests] = useState<FeatureAccessRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [features, setFeatures] = useState<FeatureAccess[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'REQUESTS') {
      loadRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadFeatures(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const data = await featureAccessService.getPendingRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadFeatures = async (empId: number) => {
    setFeaturesLoading(true);
    try {
      const data = await featureAccessService.getAllFeaturesForEmployee(empId);
      setFeatures(data);
    } catch (e) {
      console.error(e);
    } finally {
      setFeaturesLoading(false);
    }
  };

  const handleToggleFeature = async (featureName: string, currentStatus: boolean) => {
    if (!selectedEmployeeId) return;
    try {
      await featureAccessService.updateFeatureAccess(selectedEmployeeId, featureName, {
        isEnabled: !currentStatus,
        reason: 'Updated by Admin via Panel'
      });
      loadFeatures(selectedEmployeeId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProcessRequest = async (reqId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await featureAccessService.processRequest(reqId, status, { reviewNote: 'Processed via admin panel' });
      loadRequests();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-7xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldAlert className="text-indigo-600" />
          Feature Access Control
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${activeTab === 'EMPLOYEES' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Employee Access
          </button>
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${activeTab === 'REQUESTS' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Pending Requests
          </button>
        </div>
      </div>

      {activeTab === 'EMPLOYEES' && (
        <div className="flex gap-6 min-h-[500px]">
          <div className="w-1/3 border-r pr-4">
            <h3 className="font-semibold text-gray-700 mb-4">Select Employee</h3>
            {employeesLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {employees.map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${selectedEmployeeId === emp.id ? 'bg-indigo-50 border border-indigo-200 text-indigo-700' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div className="font-medium">{emp.firstName} {emp.lastName}</div>
                    <div className="text-xs text-gray-500">{emp.user?.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-2/3 pl-2">
            {!selectedEmployeeId ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Settings size={48} className="mb-4 opacity-50" />
                <p>Select an employee to manage their feature access</p>
              </div>
            ) : featuresLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
            ) : (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Feature Toggles</h3>
                <div className="grid gap-4">
                  {features.length === 0 ? (
                    <div className="text-gray-500 text-sm italic">No features registered. Seed the database or wait for initialization.</div>
                  ) : (
                    features.map(feat => (
                      <div key={feat.id} className="border p-4 rounded-lg flex justify-between items-center hover:shadow-sm transition-shadow">
                        <div>
                          <div className="font-bold text-gray-800 capitalize">{feat.featureName.replace(/-/g, ' ')}</div>
                          <div className="text-xs text-gray-500 mt-1">Status: {feat.isEnabled ? 'Enabled' : 'Disabled'}</div>
                          {feat.validToDate && (
                            <div className="text-xs text-orange-600 mt-1">Expires: {new Date(feat.validToDate).toLocaleDateString()}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleFeature(feat.featureName, feat.isEnabled)}
                          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${feat.isEnabled ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          {feat.isEnabled ? 'Revoke Access' : 'Grant Access'}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'REQUESTS' && (
        <div>
          {requestsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No pending access requests.</div>
          ) : (
            <div className="grid gap-4">
              {requests.map(req => (
                <div key={req.id} className="border border-gray-200 rounded-lg p-5 flex justify-between items-start bg-gray-50">
                  <div>
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      {req.employee?.firstName} {req.employee?.lastName} 
                      <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full capitalize">{req.featureName}</span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-2">"{req.reason}"</p>
                    <p className="text-xs text-gray-500 mt-2">Requested Duration: {req.requestedFromDate.split('T')[0]} to {req.requestedToDate.split('T')[0]}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleProcessRequest(req.id, 'APPROVED')}
                      className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-md flex items-center gap-1"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleProcessRequest(req.id, 'REJECTED')}
                      className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md flex items-center gap-1"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
