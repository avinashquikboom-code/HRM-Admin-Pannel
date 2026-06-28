import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  getCommissionPolicies,
  createCommissionPolicy,
  updateCommissionPolicy,
  deleteCommissionPolicy,
  type CommissionPolicy 
} from '@/services/commissionService';
import { fetchOffices } from '@/services/officeService';
import { fetchEmployees } from '@/services/employeeService';
import { fetchDepartments } from '@/services/departmentService';
import { toast } from 'sonner';

export default function CommissionPolicies() {
  const [policies, setPolicies] = useState<CommissionPolicy[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CommissionPolicy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    commissionType: 'PERCENTAGE',
    commissionValue: 0,
    priority: 0,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    storeId: '',
    employeeId: '',
    departmentId: '',
    designationId: '',
    roleId: '',
    targetAmount: 0,
    targetBonus: 0,
    monthlyBonus: 0,
    quarterlyBonus: 0,
    yearlyBonus: 0,
    maxCommission: 0,
    minTarget: 0,
    isActive: true,
  });

  useEffect(() => {
    loadPolicies();
    loadDropdownData();
  }, []);

  const loadPolicies = async () => {
    setIsLoading(true);
    try {
      const response = await getCommissionPolicies();
      setPolicies(response.policies);
    } catch (error) {
      console.error('Failed to load policies:', error);
      toast.error('Failed to load commission policies');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [storesRes, employeesRes, departmentsRes] = await Promise.all([
        fetchOffices(),
        fetchEmployees(),
        fetchDepartments(),
      ]);
      setStores(Array.isArray(storesRes) ? storesRes : []);
      setEmployees(Array.isArray(employeesRes) ? employeesRes : employeesRes?.employees || []);
      setDepartments(Array.isArray(departmentsRes) ? departmentsRes : departmentsRes?.departments || []);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    }
  };

  const handleCreate = () => {
    setEditingPolicy(null);
    setFormData({
      name: '',
      description: '',
      commissionType: 'PERCENTAGE',
      commissionValue: 0,
      priority: 0,
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      storeId: '',
      employeeId: '',
      departmentId: '',
      designationId: '',
      roleId: '',
      targetAmount: 0,
      targetBonus: 0,
      monthlyBonus: 0,
      quarterlyBonus: 0,
      yearlyBonus: 0,
      maxCommission: 0,
      minTarget: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (policy: CommissionPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description || '',
      commissionType: policy.commissionType,
      commissionValue: policy.commissionValue,
      priority: policy.priority,
      effectiveFrom: new Date(policy.effectiveFrom).toISOString().split('T')[0],
      effectiveTo: policy.effectiveTo ? new Date(policy.effectiveTo).toISOString().split('T')[0] : '',
      storeId: policy.storeId?.toString() || '',
      employeeId: policy.employeeId?.toString() || '',
      departmentId: policy.departmentId?.toString() || '',
      designationId: policy.designationId?.toString() || '',
      roleId: policy.roleId || '',
      targetAmount: policy.targetAmount || 0,
      targetBonus: policy.targetBonus || 0,
      monthlyBonus: policy.monthlyBonus || 0,
      quarterlyBonus: policy.quarterlyBonus || 0,
      yearlyBonus: policy.yearlyBonus || 0,
      maxCommission: policy.maxCommission || 0,
      minTarget: policy.minTarget || 0,
      isActive: policy.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this commission policy?')) return;
    
    try {
      await deleteCommissionPolicy(id.toString());
      toast.success('Commission policy deleted successfully');
      loadPolicies();
    } catch (error) {
      console.error('Failed to delete policy:', error);
      toast.error('Failed to delete commission policy');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        commissionType: formData.commissionType as 'PERCENTAGE' | 'FIXED' | 'NONE',
        storeId: formData.storeId ? parseInt(formData.storeId) : undefined,
        employeeId: formData.employeeId ? parseInt(formData.employeeId) : undefined,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
        designationId: formData.designationId ? parseInt(formData.designationId) : undefined,
        effectiveTo: formData.effectiveTo || undefined,
      };

      if (editingPolicy) {
        await updateCommissionPolicy(editingPolicy.id.toString(), submitData);
        toast.success('Commission policy updated successfully');
      } else {
        await createCommissionPolicy(submitData);
        toast.success('Commission policy created successfully');
      }
      
      setIsDialogOpen(false);
      loadPolicies();
    } catch (error) {
      console.error('Failed to save policy:', error);
      toast.error('Failed to save commission policy');
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (policy.description && policy.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && policy.isActive) ||
                         (filterStatus === 'inactive' && !policy.isActive);
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority: number) => {
    const labels: Record<number, string> = {
      0: 'Head Office',
      1: 'Store',
      2: 'Employee',
    };
    const colors: Record<number, string> = {
      0: 'bg-purple-100 text-purple-800',
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-green-100 text-green-800',
    };
    return (
      <Badge className={colors[priority] || 'bg-gray-100 text-gray-800'}>
        {labels[priority] || 'Unknown'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading commission policies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commission Policies</h1>
          <p className="text-muted-foreground mt-1">
            Configure commission rules for employees
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Effective From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{policy.commissionType}</Badge>
                  </TableCell>
                  <TableCell>
                    {policy.commissionType === 'PERCENTAGE' 
                      ? `${policy.commissionValue}%` 
                      : `₹${policy.commissionValue}`}
                  </TableCell>
                  <TableCell>{getPriorityBadge(policy.priority)}</TableCell>
                  <TableCell>
                    {policy.employeeId && <span className="text-xs bg-green-100 px-2 py-1 rounded">Employee</span>}
                    {policy.storeId && <span className="text-xs bg-blue-100 px-2 py-1 rounded ml-1">Store</span>}
                    {policy.departmentId && <span className="text-xs bg-purple-100 px-2 py-1 rounded ml-1">Department</span>}
                    {!policy.employeeId && !policy.storeId && !policy.departmentId && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">Global</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(policy.effectiveFrom).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={policy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(policy)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(policy.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPolicies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No commission policies found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? 'Edit Commission Policy' : 'Create Commission Policy'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Policy Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commission Type *</Label>
                  <Select
                    value={formData.commissionType}
                    onValueChange={(value) => setFormData({ ...formData, commissionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      <SelectItem value="NONE">No Commission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Commission Value *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.commissionValue}
                    onChange={(e) => setFormData({ ...formData, commissionValue: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select
                    value={formData.priority.toString()}
                    onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Head Office (0)</SelectItem>
                      <SelectItem value="1">Store (1)</SelectItem>
                      <SelectItem value="2">Employee (2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Effective From *</Label>
                  <Input
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Effective To</Label>
                  <Input
                    type="date"
                    value={formData.effectiveTo}
                    onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store</Label>
                  <Select
                    value={formData.storeId}
                    onValueChange={(value) => setFormData({ ...formData, storeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Stores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Stores</SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      <SelectItem value="">All Employees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()} className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                              {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-text-primary">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-[10px] text-text-secondary">
                                {emp.employeeCode || emp.id}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Bonus & Limits
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Target Bonus</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.targetBonus}
                      onChange={(e) => setFormData({ ...formData, targetBonus: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Bonus</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.monthlyBonus}
                      onChange={(e) => setFormData({ ...formData, monthlyBonus: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Commission</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.maxCommission}
                      onChange={(e) => setFormData({ ...formData, maxCommission: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPolicy ? 'Update' : 'Create'} Policy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
