import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, Download, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';
import { fetchHopkidEmployeeList } from '@/services/employeeService';
import { toast } from 'sonner';

export default function CommissionReports() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('day');
  
  // Default to past 30 days
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [selectedEmployee, selectedPeriod, startDate, endDate]);

  const loadEmployees = async () => {
    try {
      const res = await fetchHopkidEmployeeList();
      setEmployees(res?.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      let url = `/api/commission/report?from=${startDate}&to=${endDate}&groupBy=${selectedPeriod}`;
      if (selectedEmployee && selectedEmployee !== 'all') {
        url += `&employeeId=${selectedEmployee}`;
      }
      
      const res = await api.get(url);
      if (res.data && res.data.success) {
        setReportData(res.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load report data:', error);
      toast.error('Failed to load commission report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Period', 'Employee Code', 'Employee Name', 'Branch', 'Net Sales (INR)', 'Commission Rate (%)', 'Commission Amount (INR)'];
    const rows = reportData.map(item => [
      item.periodStart === item.periodEnd 
        ? item.periodStart 
        : `${item.periodStart} to ${item.periodEnd}`,
      item.employeeCode || '',
      item.employeeName || '',
      item.branchName || '',
      item.netSales,
      item.commissionRate,
      item.commissionAmount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `commission_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report exported successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card className="border-2 border-border/60 bg-surface/50">
        <CardHeader className="border-b border-border/40">
          <CardTitle className="flex items-center gap-3 text-xl font-black">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employeeID} value={emp.employeeCode}>
                      {emp.employeeName} ({emp.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Group By</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>

            <div>
              <Button 
                onClick={handleExportCSV} 
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Table Card */}
      <Card className="border-2 border-border/60 bg-surface/50">
        <CardHeader className="border-b border-border/40 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-black">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Commission Details
          </CardTitle>
          <div className="flex gap-4 text-sm font-bold text-muted-foreground">
            <div>
              Total Sales:{' '}
              <span className="text-text-primary">
                {formatCurrency(reportData.reduce((sum, item) => sum + (item.netSales || 0), 0))}
              </span>
            </div>
            <div>
              Total Commission:{' '}
              <span className="text-primary">
                {formatCurrency(reportData.reduce((sum, item) => sum + (item.commissionAmount || 0), 0))}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-muted-foreground animate-pulse">Loading report details...</div>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No commission records found for the selected criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Period</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Employee</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary">Branch</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary text-right">Net Sales</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary text-right">Rate</TableHead>
                  <TableHead className="text-xs font-black uppercase tracking-wider text-text-secondary text-right">Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item, index) => (
                  <TableRow key={index} className="border-border/40 hover:bg-surface-variant/50 transition-colors">
                    <TableCell className="font-semibold text-text-primary">
                      {item.periodStart === item.periodEnd 
                        ? item.periodStart 
                        : `${item.periodStart} to ${item.periodEnd}`}
                    </TableCell>
                    <TableCell className="text-text-secondary font-medium">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary">{item.employeeName}</span>
                        <span className="text-xs text-text-secondary">Code: {item.employeeCode}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary font-medium">{item.branchName || '-'}</TableCell>
                    <TableCell className="text-right font-bold text-text-primary">
                      {formatCurrency(item.netSales)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-text-secondary">
                      {item.commissionRate}%
                    </TableCell>
                    <TableCell className="text-right font-black text-primary">
                      {formatCurrency(item.commissionAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
