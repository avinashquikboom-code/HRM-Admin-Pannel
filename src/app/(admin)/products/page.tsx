'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Tag,
  Package,
  Check,
  X,
  Edit2,
  Trash2,
  Filter,
  DollarSign,
  Palette,
  Ruler,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  brand?: string;
  price: number;
  mrp?: number;
  hsnCode?: string;
  gstRate: number;
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Dynamic Master Sizes and Colors
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [newColorInput, setNewColorInput] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'Apparel',
    brand: 'HopKid',
    price: '',
    mrp: '',
    hsnCode: '6204',
    gstRate: '18',
    stockQuantity: '100',
    sizes: [] as string[],
    colors: [] as string[],
  });

  const [submitting, setSubmitting] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchProducts();
    fetchMasterData();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      } else {
        // Fallback demo data if backend not active
        setProducts([
          {
            id: 1,
            name: 'HopKid Premium Cotton Kids T-Shirt',
            sku: 'HK-TSHIRT-01',
            category: 'Apparel',
            brand: 'HopKid',
            price: 599,
            mrp: 999,
            hsnCode: '6204',
            gstRate: 18,
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Red', 'Blue', 'Navy Blue', 'White'],
            stockQuantity: 150,
            isActive: true,
          },
          {
            id: 2,
            name: 'HopKid Denim Jeans Shorts',
            sku: 'HK-JEANS-02',
            category: 'Apparel',
            brand: 'HopKid',
            price: 899,
            mrp: 1499,
            hsnCode: '6204',
            gstRate: 18,
            sizes: ['28', '30', '32', '34'],
            colors: ['Blue', 'Black'],
            stockQuantity: 85,
            isActive: true,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [sizesRes, colorsRes] = await Promise.all([
        fetch(`${API_BASE}/api/products/sizes`).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE}/api/products/colors`).then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      const sizesList = Array.isArray(sizesRes.data) ? sizesRes.data : [];
      const colorsList = Array.isArray(colorsRes.data) ? colorsRes.data : [];

      setAvailableSizes(sizesList);
      setAvailableColors(colorsList);
    } catch (e) {
      console.error(e);
    }
  };

  // Add new Size dynamically to master list & dropdown
  const handleAddNewSize = async () => {
    if (!newSizeInput.trim()) return;
    const sizeVal = newSizeInput.trim();
    if (availableSizes.includes(sizeVal)) {
      if (!formData.sizes.includes(sizeVal)) {
        setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, sizeVal] }));
      }
      setNewSizeInput('');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/products/sizes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sizeVal }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAvailableSizes(json.data);
      } else {
        setAvailableSizes((prev) => [...prev, sizeVal]);
      }
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, sizeVal] }));
      setNewSizeInput('');
      toast.success(`Size '${sizeVal}' added dynamically to dropdown!`);
    } catch (e) {
      setAvailableSizes((prev) => [...prev, sizeVal]);
      setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, sizeVal] }));
      setNewSizeInput('');
      toast.success(`Size '${sizeVal}' added to options!`);
    }
  };

  // Add new Color dynamically to master list & dropdown
  const handleAddNewColor = async () => {
    if (!newColorInput.trim()) return;
    const colorVal = newColorInput.trim();
    if (availableColors.includes(colorVal)) {
      if (!formData.colors.includes(colorVal)) {
        setFormData((prev) => ({ ...prev, colors: [...prev.colors, colorVal] }));
      }
      setNewColorInput('');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/products/colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: colorVal }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAvailableColors(json.data);
      } else {
        setAvailableColors((prev) => [...prev, colorVal]);
      }
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, colorVal] }));
      setNewColorInput('');
      toast.success(`Color '${colorVal}' added dynamically to dropdown!`);
    } catch (e) {
      setAvailableColors((prev) => [...prev, colorVal]);
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, colorVal] }));
      setNewColorInput('');
      toast.success(`Color '${colorVal}' added to options!`);
    }
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
      };
    });
  };

  const toggleColor = (color: string) => {
    setFormData((prev) => {
      const exists = prev.colors.includes(color);
      return {
        ...prev,
        colors: exists ? prev.colors.filter((c) => c !== color) : [...prev.colors, color],
      };
    });
  };

  const handleOpenAddModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name,
        sku: prod.sku,
        description: prod.description || '',
        category: prod.category || 'Apparel',
        brand: prod.brand || 'HopKid',
        price: prod.price.toString(),
        mrp: (prod.mrp || prod.price).toString(),
        hsnCode: prod.hsnCode || '6204',
        gstRate: (prod.gstRate || 18).toString(),
        stockQuantity: (prod.stockQuantity || 100).toString(),
        sizes: prod.sizes || [],
        colors: prod.colors || [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: `HK-${Math.floor(1000 + Math.random() * 9000)}`,
        description: '',
        category: 'Apparel',
        brand: 'HopKid',
        price: '',
        mrp: '',
        hsnCode: '6204',
        gstRate: '18',
        stockQuantity: '100',
        sizes: [],
        colors: [],
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Product name and price are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku || `HK-${Date.now().toString().slice(-6)}`,
        description: formData.description,
        category: formData.category,
        brand: formData.brand,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : parseFloat(formData.price) * 1.2,
        hsnCode: formData.hsnCode,
        gstRate: parseFloat(formData.gstRate),
        stockQuantity: parseInt(formData.stockQuantity, 10),
        sizes: formData.sizes,
        colors: formData.colors,
      };

      const url = editingProduct
        ? `${API_BASE}/api/products/${editingProduct.id}`
        : `${API_BASE}/api/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingProduct ? 'Product updated successfully!' : 'New Product created successfully!');
        setIsAddModalOpen(false);
        fetchProducts();
      } else {
        toast.error(json.message || 'Operation failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Product deleted.');
        fetchProducts();
      }
    } catch (e) {
      toast.error('Failed to delete product.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
            <Package size={16} /> Inventory & Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Product Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Add new products with dynamic size and color dropdown selections.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Apparel">Apparel</option>
            <option value="Footwear">Footwear</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
      </div>

      {/* Product List Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={36} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-slate-800/60 text-slate-400">
          <Package size={48} className="mx-auto mb-3 text-slate-600" />
          <p className="text-lg font-medium text-slate-300">No products found</p>
          <p className="text-sm text-slate-500 mt-1">Click "Add New Product" to create your first item with dynamic sizes & colors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {product.sku}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenAddModal(product)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Edit Product"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4">{product.brand || 'HopKid'} • HSN: {product.hsnCode || '6204'}</p>

                {/* Price Box */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-extrabold text-emerald-400">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-sm text-slate-500 line-through">
                      ₹{product.mrp.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-indigo-400 ml-auto bg-indigo-500/10 px-2 py-0.5 rounded">
                    GST {product.gstRate}%
                  </span>
                </div>

                {/* Sizes Badges */}
                <div className="mb-3">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mb-1.5">
                    <Ruler size={13} /> Available Sizes:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes && product.sizes.length > 0 ? (
                      product.sizes.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 rounded-md"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None selected</span>
                    )}
                  </div>
                </div>

                {/* Colors Badges */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mb-1.5">
                    <Palette size={13} /> Available Colors:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.colors && product.colors.length > 0 ? (
                      product.colors.map((c) => (
                        <span
                          key={c}
                          className="px-2.5 py-0.5 text-xs font-semibold bg-purple-950/40 text-purple-200 border border-purple-800/40 rounded-full"
                        >
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None selected</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Stock: <strong className="text-slate-200">{product.stockQuantity} pcs</strong></span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-400" size={20} />
                <h2 className="text-lg font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HopKid Cotton Kids Wear"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HK-TSHIRT-01"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Price (Selling ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="599"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    MRP (Original ₹)
                  </label>
                  <input
                    type="number"
                    placeholder="999"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GST Rate (%)
                  </label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    placeholder="6204"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Apparel"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* DYNAMIC SIZES SELECTION & ADD SIZE DATA */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Ruler size={14} /> Select Sizes for Product
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.sizes.length} selected
                  </span>
                </div>

                {/* Available Sizes Pills */}
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {availableSizes.map((size) => {
                    const selected = formData.sizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                          selected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {selected ? `✓ ${size}` : size}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Size Dynamic Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <input
                    type="text"
                    placeholder="Add custom size (e.g. 42, 4XL, Kids-10)..."
                    value={newSizeInput}
                    onChange={(e) => setNewSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewSize();
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewSize}
                    className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus size={14} /> Add Size Data
                  </button>
                </div>
              </div>

              {/* DYNAMIC COLORS SELECTION & ADD COLOR DATA */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Palette size={14} /> Select Colors for Product
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formData.colors.length} selected
                  </span>
                </div>

                {/* Available Colors Pills */}
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {availableColors.map((color) => {
                    const selected = formData.colors.includes(color);
                    return (
                      <button
                        type="button"
                        key={color}
                        onClick={() => toggleColor(color)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                          selected
                            ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {selected ? `✓ ${color}` : color}
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Color Dynamic Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <input
                    type="text"
                    placeholder="Add custom color (e.g. Lavender, Mint, Peach)..."
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewColor();
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewColor}
                    className="px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus size={14} /> Add Color Data
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
