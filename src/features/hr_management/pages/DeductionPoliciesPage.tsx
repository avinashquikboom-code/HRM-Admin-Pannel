import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface DeductionPolicy {
  id: number;
  name: string;
  type: string;
  deductionType: string;
  deductionValue: number;
  maxDeduction: number | null;
  applicableDays: string[];
  branchId: number | null;
  departmentId: number | null;
  officeId: number | null;
  isActive: boolean;
  description: string | null;
  branch?: { id: number; name: string; code: string };
  department?: { id: number; name: string; code: string };
  office?: { id: number; name: string; code: string };
}

interface Branch {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

const DeductionPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<DeductionPolicy[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [open, setOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<DeductionPolicy | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'LATE_MARK',
    deductionType: 'FIXED_AMOUNT',
    deductionValue: '',
    maxDeduction: '',
    applicableDays: [] as string[],
    branchId: '',
    departmentId: '',
    officeId: '',
    description: '',
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchPolicies();
    fetchBranches();
  }, []);

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/policies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPolicies(data.policies);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/branches', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleOpen = () => {
    setEditingPolicy(null);
    setFormData({
      name: '',
      type: 'LATE_MARK',
      deductionType: 'FIXED_AMOUNT',
      deductionValue: '',
      maxDeduction: '',
      applicableDays: [],
      branchId: '',
      departmentId: '',
      officeId: '',
      description: '',
    });
    setOpen(true);
  };

  const handleEdit = (policy: DeductionPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      type: policy.type,
      deductionType: policy.deductionType,
      deductionValue: policy.deductionValue.toString(),
      maxDeduction: policy.maxDeduction?.toString() || '',
      applicableDays: policy.applicableDays,
      branchId: policy.branchId?.toString() || '',
      departmentId: policy.departmentId?.toString() || '',
      officeId: policy.officeId?.toString() || '',
      description: policy.description || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPolicy(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingPolicy ? `/api/policies/${editingPolicy.id}` : '/api/policies';
      const method = editingPolicy ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          deductionValue: parseFloat(formData.deductionValue),
          maxDeduction: formData.maxDeduction ? parseFloat(formData.maxDeduction) : null,
          branchId: formData.branchId ? parseInt(formData.branchId) : null,
          departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
          officeId: formData.officeId ? parseInt(formData.officeId) : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchPolicies();
        handleClose();
      }
    } catch (error) {
      console.error('Error saving policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableDays: prev.applicableDays.includes(day)
        ? prev.applicableDays.filter((d) => d !== day)
        : [...prev.applicableDays, day],
    }));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'LATE_MARK':
        return 'Late Mark';
      case 'LEAVE':
        return 'Leave';
      case 'ABSENT':
        return 'Absent';
      default:
        return type;
    }
  };

  const getDeductionTypeLabel = (type: string) => {
    switch (type) {
      case 'FIXED_AMOUNT':
        return 'Fixed Amount';
      case 'PERCENTAGE':
        return 'Percentage';
      case 'PER_DAY':
        return 'Per Day';
      default:
        return type;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Deduction Policies
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Create Policy
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Deduction Type</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Max Deduction</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>{policy.name}</TableCell>
                    <TableCell>
                      <Chip label={getTypeLabel(policy.type)} size="small" />
                    </TableCell>
                    <TableCell>{getDeductionTypeLabel(policy.deductionType)}</TableCell>
                    <TableCell>
                      {policy.deductionType === 'PERCENTAGE'
                        ? `${policy.deductionValue}%`
                        : `₹${policy.deductionValue}`}
                    </TableCell>
                    <TableCell>
                      {policy.maxDeduction ? `₹${policy.maxDeduction}` : '-'}
                    </TableCell>
                    <TableCell>
                      {policy.branch ? policy.branch.name : 'All Branches'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={policy.isActive ? 'Active' : 'Inactive'}
                        color={policy.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEdit(policy)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(policy.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create Policy'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Policy Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Policy Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Policy Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="LATE_MARK">Late Mark</MenuItem>
                  <MenuItem value="LEAVE">Leave</MenuItem>
                  <MenuItem value="ABSENT">Absent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Deduction Type</InputLabel>
                <Select
                  value={formData.deductionType}
                  label="Deduction Type"
                  onChange={(e) => setFormData({ ...formData, deductionType: e.target.value })}
                >
                  <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                  <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                  <MenuItem value="PER_DAY">Per Day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Deduction Value"
                type="number"
                value={formData.deductionValue}
                onChange={(e) => setFormData({ ...formData, deductionValue: e.target.value })}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Max Deduction (Optional)"
                type="number"
                value={formData.maxDeduction}
                onChange={(e) => setFormData({ ...formData, maxDeduction: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Branch (Optional)</InputLabel>
                <Select
                  value={formData.branchId}
                  label="Branch (Optional)"
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                >
                  <MenuItem value="">All Branches</MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" gutterBottom>
                Applicable Days
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {daysOfWeek.map((day) => (
                  <Chip
                    key={day}
                    label={day}
                    clickable
                    color={formData.applicableDays.includes(day) ? 'primary' : 'default'}
                    onClick={() => handleDayToggle(day)}
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : editingPolicy ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeductionPoliciesPage;
