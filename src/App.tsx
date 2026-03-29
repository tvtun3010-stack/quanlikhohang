/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  PackageCheck,
  Trash2,
  Edit2,
  X,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Transaction, View } from './types';

// Initial Data
const INITIAL_PRODUCTS: Product[] = [
  { maHang: 'SKU001', tenHang: 'Sắt Phi 10', loai: 'Vật liệu xây dựng', donVi: 'Cây', giaNhap: 150000, giaXuat: 180000, soLuongTon: 50, dinhMuc: 20 },
  { maHang: 'SKU002', tenHang: 'Xi măng Hà Tiên', loai: 'Vật liệu xây dựng', donVi: 'Bao', giaNhap: 85000, giaXuat: 95000, soLuongTon: 15, dinhMuc: 30 },
  { maHang: 'SKU003', tenHang: 'Gạch ống 4 lỗ', loai: 'Vật liệu xây dựng', donVi: 'Viên', giaNhap: 1200, giaXuat: 1500, soLuongTon: 5000, dinhMuc: 1000 },
];

const UNITS = ['Cái', 'Bao', 'Cây', 'Viên', 'Thùng', 'Kg', 'Mét'];
const CATEGORIES = ['Vật liệu xây dựng', 'Điện nước', 'Sơn & Hóa chất', 'Công cụ dụng cụ'];

export default function App() {
  const [view, setView] = useState<View>('DASHBOARD');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('wms_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('wms_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persistence
  useEffect(() => {
    localStorage.setItem('wms_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('wms_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Calculations
  const totalStockValue = useMemo(() => 
    products.reduce((sum, p) => sum + (p.soLuongTon * p.giaNhap), 0), 
  [products]);

  const lowStockItems = useMemo(() => 
    products.filter(p => p.soLuongTon <= p.dinhMuc), 
  [products]);

  const totalInValue = useMemo(() => 
    transactions.filter(t => t.loaiPhieu === 'NHAP').reduce((sum, t) => sum + t.tongTien, 0),
  [transactions]);

  const totalOutValue = useMemo(() => 
    transactions.filter(t => t.loaiPhieu === 'XUAT').reduce((sum, t) => sum + t.tongTien, 0),
  [transactions]);

  // Actions
  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (sku: string, updated: Partial<Product>) => {
    setProducts(products.map(p => p.maHang === sku ? { ...p, ...updated } : p));
  };

  const deleteProduct = (sku: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm ${sku}?`)) {
      setProducts(products.filter(p => p.maHang !== sku));
    }
  };

  const createTransaction = (type: 'NHAP' | 'XUAT', sku: string, quantity: number, price: number, reason?: string) => {
    const product = products.find(p => p.maHang === sku);
    if (!product) return;

    if (type === 'XUAT' && product.soLuongTon < quantity) {
      alert('Số lượng tồn kho không đủ để xuất!');
      return;
    }

    const newTransaction: Transaction = {
      maPhieu: `${type === 'NHAP' ? 'GRN' : 'GDN'}-${Date.now()}`,
      loaiPhieu: type,
      ngayTao: new Date().toISOString(),
      maHang: sku,
      soLuong: quantity,
      donGia: price,
      tongTien: quantity * price,
      lyDo: reason
    };

    setTransactions([newTransaction, ...transactions]);
    updateProduct(sku, { 
      soLuongTon: type === 'NHAP' ? product.soLuongTon + quantity : product.soLuongTon - quantity 
    });
    alert(`${type === 'NHAP' ? 'Nhập' : 'Xuất'} hàng thành công!`);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#141414] font-sans flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#141414] text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <PackageCheck size={20} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-bold tracking-tight text-lg">WMS PRO</span>}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Tổng quan" 
            active={view === 'DASHBOARD'} 
            onClick={() => setView('DASHBOARD')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Package size={20} />} 
            label="Sản phẩm" 
            active={view === 'PRODUCTS'} 
            onClick={() => setView('PRODUCTS')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<ArrowDownCircle size={20} />} 
            label="Nhập kho" 
            active={view === 'INVENTORY_IN'} 
            onClick={() => setView('INVENTORY_IN')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<ArrowUpCircle size={20} />} 
            label="Xuất kho" 
            active={view === 'INVENTORY_OUT'} 
            onClick={() => setView('INVENTORY_OUT')} 
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Lịch sử" 
            active={view === 'HISTORY'} 
            onClick={() => setView('HISTORY')} 
            collapsed={!isSidebarOpen}
          />
        </nav>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-6 border-t border-white/10 hover:bg-white/5 flex items-center justify-center transition-colors"
        >
          <Menu size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {view === 'DASHBOARD' && 'Bảng điều khiển'}
              {view === 'PRODUCTS' && 'Danh mục hàng hóa'}
              {view === 'INVENTORY_IN' && 'Lập phiếu nhập kho'}
              {view === 'INVENTORY_OUT' && 'Lập phiếu xuất kho'}
              {view === 'HISTORY' && 'Lịch sử biến động'}
            </h1>
            <p className="text-gray-500 mt-1 italic font-serif">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          {view === 'PRODUCTS' && (
            <button 
              onClick={() => (window as any).showAddProductModal()}
              className="bg-[#141414] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <Plus size={18} /> Thêm sản phẩm
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'DASHBOARD' && (
              <Dashboard 
                totalValue={totalStockValue} 
                lowStockCount={lowStockItems.length}
                totalIn={totalInValue}
                totalOut={totalOutValue}
                lowStockItems={lowStockItems}
              />
            )}
            {view === 'PRODUCTS' && (
              <ProductList 
                products={products} 
                onDelete={deleteProduct} 
                onAdd={addProduct}
                onUpdate={updateProduct}
              />
            )}
            {view === 'INVENTORY_IN' && (
              <TransactionForm 
                type="NHAP" 
                products={products} 
                onSubmit={createTransaction} 
              />
            )}
            {view === 'INVENTORY_OUT' && (
              <TransactionForm 
                type="XUAT" 
                products={products} 
                onSubmit={createTransaction} 
              />
            )}
            {view === 'HISTORY' && (
              <TransactionHistory transactions={transactions} products={products} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// Sub-components
function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all ${
        active 
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function Dashboard({ totalValue, lowStockCount, totalIn, totalOut, lowStockItems }: any) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng giá trị kho" 
          value={totalValue.toLocaleString('vi-VN') + ' đ'} 
          icon={<DollarSign className="text-blue-500" />}
          trend="Dựa trên giá nhập"
        />
        <StatCard 
          title="Cảnh báo tồn kho" 
          value={lowStockCount} 
          icon={<AlertTriangle className="text-red-500" />}
          trend="Số lượng dưới định mức"
          highlight={lowStockCount > 0}
        />
        <StatCard 
          title="Tổng nhập (tháng)" 
          value={totalIn.toLocaleString('vi-VN') + ' đ'} 
          icon={<ArrowDownCircle className="text-green-500" />}
          trend="Giá trị hàng nhập"
        />
        <StatCard 
          title="Tổng xuất (tháng)" 
          value={totalOut.toLocaleString('vi-VN') + ' đ'} 
          icon={<ArrowUpCircle className="text-orange-500" />}
          trend="Giá trị hàng xuất"
        />
      </div>

      {/* Alerts Table */}
      {lowStockCount > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} /> Danh sách hàng sắp hết
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Mã SKU</th>
                  <th className="px-6 py-4">Tên hàng</th>
                  <th className="px-6 py-4 text-right">Tồn hiện tại</th>
                  <th className="px-6 py-4 text-right">Định mức</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStockItems.map((item: Product) => (
                  <tr key={item.maHang} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{item.maHang}</td>
                    <td className="px-6 py-4 font-medium">{item.tenHang}</td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">{item.soLuongTon}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{item.dinhMuc}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded">Cần nhập gấp</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend, highlight }: any) {
  return (
    <div className={`bg-white p-6 rounded-2xl border ${highlight ? 'border-red-200 bg-red-50/30' : 'border-gray-200'} shadow-sm`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
      <div className="text-2xl font-bold tracking-tight mb-2">{value}</div>
      <div className="text-xs text-gray-400 italic font-serif">{trend}</div>
    </div>
  );
}

function ProductList({ products, onDelete, onAdd, onUpdate }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Expose modal to window for header button
  useEffect(() => {
    (window as any).showAddProductModal = () => {
      setEditingProduct(null);
      setIsModalOpen(true);
    };
  }, []);

  const filteredProducts = products.filter((p: Product) => 
    p.tenHang.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.maHang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc SKU..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Mã SKU</th>
                <th className="px-6 py-4">Tên sản phẩm</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4 text-right">Giá nhập</th>
                <th className="px-6 py-4 text-right">Tồn kho</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product: Product) => (
                <tr key={product.maHang} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm">{product.maHang}</td>
                  <td className="px-6 py-4 font-medium">{product.tenHang}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.loai}</td>
                  <td className="px-6 py-4 text-right font-medium">{product.giaNhap.toLocaleString('vi-VN')} đ</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${product.soLuongTon <= product.dinhMuc ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.soLuongTon}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{product.donVi}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(product.maHang)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const productData = {
                maHang: formData.get('maHang') as string,
                tenHang: formData.get('tenHang') as string,
                loai: formData.get('loai') as string,
                donVi: formData.get('donVi') as string,
                giaNhap: Number(formData.get('giaNhap')),
                giaXuat: Number(formData.get('giaXuat')),
                soLuongTon: editingProduct ? editingProduct.soLuongTon : Number(formData.get('soLuongTon')),
                dinhMuc: Number(formData.get('dinhMuc')),
              };
              
              if (editingProduct) {
                onUpdate(editingProduct.maHang, productData);
              } else {
                onAdd(productData);
              }
              setIsModalOpen(false);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Mã SKU</label>
                  <input name="maHang" required defaultValue={editingProduct?.maHang} disabled={!!editingProduct} className="w-full p-2 border rounded-lg bg-gray-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Tên hàng</label>
                  <input name="tenHang" required defaultValue={editingProduct?.tenHang} className="w-full p-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Loại</label>
                  <select name="loai" className="w-full p-2 border rounded-lg" defaultValue={editingProduct?.loai}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Đơn vị</label>
                  <select name="donVi" className="w-full p-2 border rounded-lg" defaultValue={editingProduct?.donVi}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Giá nhập</label>
                  <input name="giaNhap" type="number" required defaultValue={editingProduct?.giaNhap} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Giá xuất</label>
                  <input name="giaXuat" type="number" required defaultValue={editingProduct?.giaXuat} className="w-full p-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Tồn kho ban đầu</label>
                  <input name="soLuongTon" type="number" required defaultValue={editingProduct?.soLuongTon || 0} disabled={!!editingProduct} className="w-full p-2 border rounded-lg bg-gray-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Định mức tối thiểu</label>
                  <input name="dinhMuc" type="number" required defaultValue={editingProduct?.dinhMuc} className="w-full p-2 border rounded-lg" />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">
                  {editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TransactionForm({ type, products, onSubmit }: { type: 'NHAP' | 'XUAT', products: Product[], onSubmit: any }) {
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const selectedProduct = products.find(p => p.maHang === selectedSku);

  useEffect(() => {
    if (selectedProduct) {
      setPrice(type === 'NHAP' ? selectedProduct.giaNhap : selectedProduct.giaXuat);
    }
  }, [selectedSku, type, selectedProduct]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-xl ${type === 'NHAP' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
          {type === 'NHAP' ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
        </div>
        <div>
          <h3 className="text-xl font-bold">Phiếu {type === 'NHAP' ? 'Nhập kho (GRN)' : 'Xuất kho (GDN)'}</h3>
          <p className="text-gray-500 text-sm">Điền thông tin để cập nhật dòng chảy hàng hóa</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit(
          type, 
          selectedSku, 
          quantity, 
          price, 
          formData.get('lyDo') as string
        );
        setSelectedSku('');
        setQuantity(1);
        (e.target as HTMLFormElement).reset();
      }}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">Chọn sản phẩm</label>
          <select 
            required 
            className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
          >
            <option value="">-- Chọn sản phẩm từ danh mục --</option>
            {products.map(p => (
              <option key={p.maHang} value={p.maHang}>
                {p.maHang} - {p.tenHang} (Tồn: {p.soLuongTon} {p.donVi})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Số lượng ({selectedProduct?.donVi || '...'})</label>
            <input 
              type="number" 
              required 
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500">Đơn giá (VNĐ)</label>
            <input 
              type="number" 
              required 
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">Lý do / Ghi chú</label>
          <textarea 
            name="lyDo" 
            rows={3} 
            placeholder={type === 'NHAP' ? 'Nhập hàng từ nhà cung cấp A...' : 'Xuất bán cho khách hàng B...'}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none"
          ></textarea>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl flex justify-between items-center">
          <span className="text-gray-500 font-medium">Tổng giá trị phiếu:</span>
          <span className="text-2xl font-bold text-orange-600">{(quantity * price).toLocaleString('vi-VN')} đ</span>
        </div>

        <button 
          type="submit" 
          disabled={!selectedSku}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
            !selectedSku ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#141414] hover:bg-orange-600 active:scale-[0.98]'
          }`}
        >
          Xác nhận {type === 'NHAP' ? 'Nhập kho' : 'Xuất kho'}
        </button>
      </form>
    </div>
  );
}

function TransactionHistory({ transactions, products }: { transactions: Transaction[], products: Product[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
            <tr>
              <th className="px-6 py-4">Mã phiếu</th>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4">Loại</th>
              <th className="px-6 py-4">Sản phẩm</th>
              <th className="px-6 py-4 text-right">Số lượng</th>
              <th className="px-6 py-4 text-right">Tổng tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Chưa có giao dịch nào được thực hiện</td>
              </tr>
            ) : (
              transactions.map((t) => {
                const product = products.find(p => p.maHang === t.maHang);
                return (
                  <tr key={t.maPhieu} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{t.maPhieu}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(t.ngayTao).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        t.loaiPhieu === 'NHAP' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {t.loaiPhieu}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{product?.tenHang || t.maHang}</div>
                      <div className="text-xs text-gray-400">{t.maHang}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {t.loaiPhieu === 'NHAP' ? '+' : '-'}{t.soLuong} {product?.donVi}
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {t.tongTien.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
