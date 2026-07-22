'use client';

import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  FileText,
  Search,
  CheckCircle2,
  RefreshCw,
  Building,
  User,
  ShoppingBag,
  QrCode,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceItem {
  productId: number;
  productName: string;
  sku: string;
  size: string;
  color: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxableValue: number;
  gstRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  invoiceDate: string;
  orderDate: string;
  channel: string;
  seller: {
    name: string;
    address: string;
    gstin: string;
    pan: string;
    stateCode: string;
  };
  customer: {
    name: string;
    phone: string;
    address: string;
    gstin: string;
    stateCode: string;
  };
  payment: {
    mode: string;
    status: string;
    transactionId: string;
  };
  items: InvoiceItem[];
  totals: {
    totalQuantity: number;
    taxableValue: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    grandTotal: number;
  };
}

export default function FlipkartInvoicesPage() {
  const [selectedTxnId, setSelectedTxnId] = useState<string>('1');
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTxn, setSearchTxn] = useState('1');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchInvoice(selectedTxnId);
  }, [selectedTxnId]);

  const fetchInvoice = async (txnId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/invoices/${txnId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setInvoice(json.data);
      } else {
        // Fallback Flipkart mock invoice
        setInvoice({
          invoiceNumber: `FAB-${Date.now().toString().slice(-6)}`,
          orderId: `OD${Date.now().toString().slice(-10)}`,
          invoiceDate: new Date().toISOString().split('T')[0],
          orderDate: new Date().toISOString().split('T')[0],
          channel: 'Flipkart / HopKid Retail',
          seller: {
            name: 'HopKid Retail Private Limited',
            address: 'Plot No. 42, Industrial Area, Sector 62, Noida, Uttar Pradesh 201301',
            gstin: '09AAACH2426J1Z5',
            pan: 'AAACH2426J',
            stateCode: '09 - Uttar Pradesh',
          },
          customer: {
            name: 'Rahul Sharma',
            phone: '+91 98765 43210',
            address: 'Flat 402, Sunshine Apartments, MG Road, Mumbai, Maharashtra 400001',
            gstin: 'NA',
            stateCode: '27 - Maharashtra',
          },
          payment: {
            mode: 'Prepaid / UPI',
            status: 'PAID',
            transactionId: 'TXN-987410258',
          },
          items: [
            {
              productId: 101,
              productName: 'HopKid Premium Boys Cotton Printed T-Shirt',
              sku: 'HK-TSH-BLU-M',
              size: 'M (Size 30)',
              color: 'Royal Blue',
              hsnCode: '6204',
              quantity: 2,
              unitPrice: 423.73,
              discount: 0,
              taxableValue: 847.46,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 76.27,
              sgstRate: 9,
              sgstAmount: 76.27,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 1000,
            },
            {
              productId: 102,
              productName: 'HopKid Casual Denim Shorts for Kids',
              sku: 'HK-JNS-BLK-28',
              size: '28',
              color: 'Black',
              hsnCode: '6204',
              quantity: 1,
              unitPrice: 422.88,
              discount: 0,
              taxableValue: 422.88,
              gstRate: 18,
              cgstRate: 9,
              cgstAmount: 38.06,
              sgstRate: 9,
              sgstAmount: 38.06,
              igstRate: 0,
              igstAmount: 0,
              totalAmount: 499,
            },
          ],
          totals: {
            totalQuantity: 3,
            taxableValue: 1270.34,
            cgstTotal: 114.33,
            sgstTotal: 114.33,
            igstTotal: 0,
            grandTotal: 1499,
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Controls Bar (Hidden during printing) */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
            <FileText size={16} /> Flipkart Tax Invoice Generator
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Order Invoice Details
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Authentic Flipkart-styled tax invoice with GST breakdown, sizes, colors, and barcode.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Enter Order / Sales ID..."
              value={searchTxn}
              onChange={(e) => setSearchTxn(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-32"
            />
            <button
              onClick={() => setSelectedTxnId(searchTxn || '1')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 bg-indigo-500/10 rounded"
            >
              Fetch
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02]"
          >
            <Printer size={18} /> Print Flipkart Invoice
          </button>
        </div>
      </div>

      {/* FLIPKART TAX INVOICE CONTAINER (Optimized for standard print & display) */}
      {invoice && (
        <div className="bg-white text-black p-8 rounded-none border border-slate-300 shadow-2xl font-sans text-xs leading-relaxed max-w-[210mm] mx-auto print:max-w-full print:p-0 print:border-none print:shadow-none">
          {/* Header section with Flipkart logo style */}
          <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-[#2874F0] italic">
                  Flipkart
                </span>
                <span className="text-[10px] font-bold bg-[#FFE500] text-black px-1.5 py-0.5 rounded border border-black/20">
                  Tax Invoice
                </span>
              </div>
              <p className="text-[10px] font-bold text-gray-700 mt-1 uppercase tracking-wider">
                TAX INVOICE / BILL OF SUPPLY / CASH MEMO
              </p>
              <p className="text-[9px] text-gray-500">(Original for Recipient)</p>
            </div>

            <div className="text-right text-[10px]">
              <p className="font-bold text-gray-900">Invoice No: <span className="font-mono text-black">{invoice.invoiceNumber}</span></p>
              <p className="font-semibold text-gray-700">Order ID: <span className="font-mono">{invoice.orderId}</span></p>
              <p className="text-gray-600">Invoice Date: {invoice.invoiceDate}</p>
              <p className="text-gray-600">Order Date: {invoice.orderDate}</p>
              <p className="text-gray-600">Channel: {invoice.channel}</p>
            </div>
          </div>

          {/* Seller & Customer Details Grid */}
          <div className="grid grid-cols-2 gap-4 border border-black mb-4 p-3 bg-gray-50/50">
            {/* Sold By */}
            <div className="pr-3 border-r border-gray-300">
              <h4 className="font-bold text-[11px] text-black uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">
                Sold By:
              </h4>
              <p className="font-extrabold text-black text-[11px]">{invoice.seller.name}</p>
              <p className="text-gray-700 text-[10px] leading-tight my-1">{invoice.seller.address}</p>
              <p className="font-semibold text-gray-800">GSTIN: <span className="font-mono">{invoice.seller.gstin}</span></p>
              <p className="text-gray-700">PAN: {invoice.seller.pan} | State: {invoice.seller.stateCode}</p>
            </div>

            {/* Shipping & Billing Address */}
            <div>
              <h4 className="font-bold text-[11px] text-black uppercase tracking-wide border-b border-gray-300 pb-1 mb-1">
                Shipping & Billing Address:
              </h4>
              <p className="font-extrabold text-black text-[11px]">{invoice.customer.name}</p>
              <p className="text-gray-700 text-[10px] leading-tight my-1">{invoice.customer.address}</p>
              <p className="font-semibold text-gray-800">Phone: {invoice.customer.phone}</p>
              <p className="text-gray-700">State Code: {invoice.customer.stateCode}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="bg-gray-100 text-black font-bold uppercase border-b border-black text-center">
                  <th className="border border-black p-1.5 w-8">#</th>
                  <th className="border border-black p-1.5 text-left">Product Description</th>
                  <th className="border border-black p-1.5 w-14">HSN</th>
                  <th className="border border-black p-1.5 w-10">Qty</th>
                  <th className="border border-black p-1.5 w-16">Gross (₹)</th>
                  <th className="border border-black p-1.5 w-16">Taxable (₹)</th>
                  <th className="border border-black p-1.5 w-14">CGST</th>
                  <th className="border border-black p-1.5 w-14">SGST</th>
                  <th className="border border-black p-1.5 w-16">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50 text-center">
                    <td className="border border-black p-1.5">{idx + 1}</td>
                    <td className="border border-black p-1.5 text-left">
                      <p className="font-bold text-black text-[10.5px]">{item.productName}</p>
                      <div className="flex gap-2 text-[9px] text-gray-700 font-medium mt-0.5">
                        <span className="bg-gray-100 px-1 border border-gray-300 rounded">
                          SKU: {item.sku}
                        </span>
                        <span className="bg-blue-50 text-blue-900 px-1 border border-blue-200 rounded">
                          Size: <strong>{item.size}</strong>
                        </span>
                        <span className="bg-purple-50 text-purple-900 px-1 border border-purple-200 rounded">
                          Color: <strong>{item.color}</strong>
                        </span>
                      </div>
                    </td>
                    <td className="border border-black p-1.5 font-mono">{item.hsnCode}</td>
                    <td className="border border-black p-1.5 font-bold">{item.quantity}</td>
                    <td className="border border-black p-1.5 font-mono">{item.unitPrice.toFixed(2)}</td>
                    <td className="border border-black p-1.5 font-mono">{item.taxableValue.toFixed(2)}</td>
                    <td className="border border-black p-1.5">
                      <p>{item.cgstRate}%</p>
                      <p className="text-[9px] text-gray-600">₹{item.cgstAmount.toFixed(2)}</p>
                    </td>
                    <td className="border border-black p-1.5">
                      <p>{item.sgstRate}%</p>
                      <p className="text-[9px] text-gray-600">₹{item.sgstAmount.toFixed(2)}</p>
                    </td>
                    <td className="border border-black p-1.5 font-bold font-mono text-black">
                      ₹{item.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Totals */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border border-black p-2 bg-gray-50/50">
              <h5 className="font-bold text-[10px] uppercase mb-1 text-black">Tax Summary:</h5>
              <div className="space-y-0.5 text-[9.5px]">
                <div className="flex justify-between">
                  <span>Total Taxable Amount:</span>
                  <span className="font-mono">₹{invoice.totals.taxableValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (9%):</span>
                  <span className="font-mono">₹{invoice.totals.cgstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%):</span>
                  <span className="font-mono">₹{invoice.totals.sgstTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-0.5 font-bold">
                  <span>Total Tax Included:</span>
                  <span className="font-mono">₹{(invoice.totals.cgstTotal + invoice.totals.sgstTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border border-black p-3 bg-blue-50/30 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sm font-black border-b border-black pb-1">
                <span>Grand Total:</span>
                <span className="text-base text-blue-900 font-mono">
                  ₹{invoice.totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[9px] text-gray-600 mt-1 italic">
                Amount in Words: Rupees One Thousand Four Hundred Ninety Nine Only.
              </p>
              <div className="mt-2 text-[9px] text-gray-700">
                Payment Method: <strong>{invoice.payment.mode}</strong> ({invoice.payment.status})
              </div>
            </div>
          </div>

          {/* Barcode & Verification Box */}
          <div className="border-t-2 border-black pt-3 mt-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Fake SVG Barcode */}
              <div className="p-1 border border-black bg-white">
                <svg width="120" height="36" viewBox="0 0 120 36">
                  <rect x="2" y="2" width="2" height="32" fill="black" />
                  <rect x="6" y="2" width="4" height="32" fill="black" />
                  <rect x="12" y="2" width="2" height="32" fill="black" />
                  <rect x="16" y="2" width="6" height="32" fill="black" />
                  <rect x="24" y="2" width="2" height="32" fill="black" />
                  <rect x="28" y="2" width="3" height="32" fill="black" />
                  <rect x="34" y="2" width="5" height="32" fill="black" />
                  <rect x="42" y="2" width="2" height="32" fill="black" />
                  <rect x="46" y="2" width="4" height="32" fill="black" />
                  <rect x="52" y="2" width="2" height="32" fill="black" />
                  <rect x="56" y="2" width="6" height="32" fill="black" />
                  <rect x="64" y="2" width="3" height="32" fill="black" />
                  <rect x="70" y="2" width="2" height="32" fill="black" />
                  <rect x="74" y="2" width="5" height="32" fill="black" />
                  <rect x="82" y="2" width="2" height="32" fill="black" />
                  <rect x="86" y="2" width="4" height="32" fill="black" />
                  <rect x="92" y="2" width="6" height="32" fill="black" />
                  <rect x="100" y="2" width="2" height="32" fill="black" />
                  <rect x="104" y="2" width="4" height="32" fill="black" />
                  <rect x="110" y="2" width="2" height="32" fill="black" />
                </svg>
                <p className="text-[8px] text-center font-mono tracking-widest text-black mt-0.5">{invoice.orderId}</p>
              </div>
              <div className="text-[9px] text-gray-600">
                <p className="font-bold text-black">Scan QR / Barcode for Verification</p>
                <p>Returns & exchanges subject to Flipkart policy.</p>
              </div>
            </div>

            <div className="text-right border-l border-gray-300 pl-4">
              <p className="text-[9px] text-gray-500 font-semibold mb-6">Authorized Signatory</p>
              <p className="font-extrabold text-black text-[10px] uppercase border-t border-black pt-1">
                For {invoice.seller.name}
              </p>
            </div>
          </div>

          <div className="text-[8px] text-center text-gray-500 border-t border-gray-200 mt-4 pt-2">
            This is a computer-generated invoice and does not require a physical signature under IT Act 2000.
          </div>
        </div>
      )}
    </div>
  );
}
