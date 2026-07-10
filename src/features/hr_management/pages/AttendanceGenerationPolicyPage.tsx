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
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, PlayArrow as GenerateIcon } from '@mui/icons-material';

interface AttendanceGenerationPolicy {
  id: number;
  isEnabled: boolean;
  generationMode: string;
  autoGenerateCurrentMonth: boolean;
  autoGenerateFutureMonths: boolean;
  numberOfFutureMonths: number;
  payrollCutoffDate: number;
  attendanceFreezeDate: number;
  autoGenerateWeeklyOffs: boolean;
  autoApplyHolidays: boolean;
  autoApplyShiftCalendar: boolean;
  autoMarkAbsentAfterWorkingHours: boolean;
  autoApplyHalfDayRules: boolean;
  autoApplyLateMarkRules: boolean;
  autoApplyEarlyExitRules: boolean;
  branchId: number | null;
  departmentId: number | null;
  officeId: number | null;
  description: string | null;
}

const AttendanceGenerationPolicyPage: React.FC = () => {
  const [policies, setPolicies] = useState<AttendanceGenerationPolicy[]>([]);
  const [open, setOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AttendanceGenerationPolicy | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    isEnabled: false,
    generationMode: 'MONTHLY',
    autoGenerateCurrentMonth: true,
    autoGenerateFutureMonths: false,
    numberOfFutureMonths: 1,
    payrollCutoffDate: 25,
    attendanceFreezeDate: 28,
    autoGenerateWeeklyOffs: true,
    autoApplyHolidays: true,
    autoApplyShiftCalendar: true,
    autoMarkAbsentAfterWorkingHours: false,
    autoApplyHalfDayRules: true,
    autoApplyLateMarkRules: true,
    autoApplyEarlyExitRules: true,
    branchId: '',
    departmentId: '',
    officeId: '',
    description: '',
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/attendance-generation-policies', {
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

  const handleOpen = () => {
    setEditingPolicy(null);
    setFormData({
      isEnabled: false,
      generationMode: 'MONTHLY',
      autoGenerateCurrentMonth: true,
      autoGenerateFutureMonths: false,
      numberOfFutureMonths: 1,
      payrollCutoffDate: 25,
      attendanceFreezeDate: 28,
      autoGenerateWeeklyOffs: true,
      autoApplyHolidays: true,
      autoApplyShiftCalendar: true,
      autoMarkAbsentAfterWorkingHours: false,
      autoApplyHalfDayRules: true,
      autoApplyLateMarkRules: true,
      autoApplyEarlyExitRules: true,
      branchId: '',
      departmentId: '',
      officeId: '',
      description: '',
    });
    setOpen(true);
  };

  const handleEdit = (policy: AttendanceGenerationPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      isEnabled: policy.isEnabled,
      generationMode: policy.generationMode,
      autoGenerateCurrentMonth: policy.autoGenerateCurrentMonth,
      autoGenerateFutureMonths: policy.autoGenerateFutureMonths,
      numberOfFutureMonths: policy.numberOfFutureMonths,
      payrollCutoffDate: policy.payrollCutoffDate,
      attendanceFreezeDate: policy.attendanceFreezeDate,
      autoGenerateWeeklyOffs: policy.autoGenerateWeeklyOffs,
      autoApplyHolidays: policy.autoApplyHolidays,
      autoApplyShiftCalendar: policy.autoApplyShiftCalendar,
      autoMarkAbsentAfterWorkingHours: policy.autoMarkAbsentAfterWorkingHours,
      autoApplyHalfDayRules: policy.autoApplyHalfDayRules,
      autoApplyLateMarkRules: policy.autoApplyLateMarkRules,
      autoApplyEarlyExitRules: policy.autoApplyEarlyExitRules,
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
      const url = editingPolicy ? `/api/attendance-generation-policies/${editingPolicy.id}` : '/api/attendance-generation-policies';
      const method = editingPolicy ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
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
      const response = await fetch(`/api/attendance-generation-policies/${id}`, {
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

  const handleGenerate = async (policyId: number) => {
    if (!window.confirm('Are you sure you want to generate attendance calendar for this policy?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance-generation-policies/${policyId}/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        alert(`Calendar generated successfully: ${JSON.stringify(data.results)}`);
      } else {
        alert('Failed to generate calendar: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating calendar:', error);
      alert('Error generating calendar');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Attendance Generation Policies
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
                  <TableCell>Status</TableCell>
                  <TableCell>Generation Mode</TableCell>
                  <TableCell>Current Month</TableCell>
                  <TableCell>Future Months</TableCell>
                  <TableCell>Payroll Cutoff</TableCell>
                  <TableCell>Freeze Date</TableCell>
                  <TableCell>Auto Weekly Offs</TableCell>
                  <TableCell>Auto Holidays</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <Chip
                        label={policy.isEnabled ? 'Enabled' : 'Disabled'}
                        color={policy.isEnabled ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{policy.generationMode}</TableCell>
                    <TableCell>{policy.autoGenerateCurrentMonth ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {policy.autoGenerateFutureMonths ? `${policy.numberOfFutureMonths} months` : 'No'}
                    </TableCell>
                    <TableCell>{policy.payrollCutoffDate}</TableCell>
                    <TableCell>{policy.attendanceFreezeDate}</TableCell>
                    <TableCell>{policy.autoGenerateWeeklyOffs ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{policy.autoApplyHolidays ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEdit(policy)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleGenerate(policy.id)} color="primary">
                        <GenerateIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(policy.id)} color="error">
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
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  />
                }
                label="Enable Automatic Attendance Generation"
              />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>Generation Mode</InputLabel>
                <Select
                  value={formData.generationMode}
                  label="Generation Mode"
                  onChange={(e) => setFormData({ ...formData, generationMode: e.target.value })}
                >
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoGenerateCurrentMonth}
                    onChange={(e) => setFormData({ ...formData, autoGenerateCurrentMonth: e.target.checked })}
                  />
                }
                label="Auto Generate Current Month"
              />
            </Grid>
            <Grid size={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoGenerateFutureMonths}
                    onChange={(e) => setFormData({ ...formData, autoGenerateFutureMonths: e.target.checked })}
                  />
                }
                label="Auto Generate Future Months"
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Number of Future Months"
                type="number"
                value={formData.numberOfFutureMonths}
                onChange={(e) => setFormData({ ...formData, numberOfFutureMonths: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Payroll Cutoff Date"
                type="number"
                helperText="Day of month (1-31)"
                value={formData.payrollCutoffDate}
                onChange={(e) => setFormData({ ...formData, payrollCutoffDate: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Attendance Freeze Date"
                type="number"
                helperText="Day of month (1-31)"
                value={formData.attendanceFreezeDate}
                onChange={(e) => setFormData({ ...formData, attendanceFreezeDate: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="subtitle2" gutterBottom>
                Automatic Rules
              </Typography>
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoGenerateWeeklyOffs}
                    onChange={(e) => setFormData({ ...formData, autoGenerateWeeklyOffs: e.target.checked })}
                  />
                }
                label="Generate Weekly Offs"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoApplyHolidays}
                    onChange={(e) => setFormData({ ...formData, autoApplyHolidays: e.target.checked })}
                  />
                }
                label="Apply Holidays"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoApplyShiftCalendar}
                    onChange={(e) => setFormData({ ...formData, autoApplyShiftCalendar: e.target.checked })}
                  />
                }
                label="Apply Shift Calendar"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoMarkAbsentAfterWorkingHours}
                    onChange={(e) => setFormData({ ...formData, autoMarkAbsentAfterWorkingHours: e.target.checked })}
                  />
                }
                label="Mark Absent After Hours"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoApplyHalfDayRules}
                    onChange={(e) => setFormData({ ...formData, autoApplyHalfDayRules: e.target.checked })}
                  />
                }
                label="Apply Half Day Rules"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoApplyLateMarkRules}
                    onChange={(e) => setFormData({ ...formData, autoApplyLateMarkRules: e.target.checked })}
                  />
                }
                label="Apply Late Mark Rules"
              />
            </Grid>
            <Grid size={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoApplyEarlyExitRules}
                    onChange={(e) => setFormData({ ...formData, autoApplyEarlyExitRules: e.target.checked })}
                  />
                }
                label="Apply Early Exit Rules"
              />
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

export default AttendanceGenerationPolicyPage;
