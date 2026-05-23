"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminPageLayout from "@/components/shared/admin-page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  X, 
  Eye,
  EyeOff,
  Loader2, 
  Edit2, 
  Trash2,
  AlertCircle,
  Key,
  Copy,
  Check,
  Package,
  Upload,
  FileText,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  stock: number;
}

interface Account {
  id: string;
  productId: string;
  email: string;
  password: string; // obfuscated base64
  status: string;
  createdAt: string;
  product?: Product;
}

// Decode obfuscated password
function decodePassword(encoded: string): string {
  try {
    return atob(encoded);
  } catch {
    return encoded;
  }
}

interface ProductWithAccounts extends Product {
  accounts?: Account[];
}

export default function AccountsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchData, setBatchData] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    status: "AVAILABLE",
  });
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const productParam = searchParams.get("product");

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Không thể tải sản phẩm");
      const data = await res.json();
      const prods = Array.isArray(data) ? data : (data.items || []);
      setProducts(prods);
      
      if (productParam) {
        setSelectedProduct(productParam);
      } else if (prods.length > 0 && !selectedProduct) {
        setSelectedProduct(prods[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async (productId: string) => {
    if (!productId) return;
    setLoadingAccounts(true);
    try {
      const res = await fetch(`/api/admin/accounts?productId=${productId}`);
      if (!res.ok) throw new Error("Không thể tải tài khoản");
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchAccounts(selectedProduct);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (productParam && products.length > 0) {
      const exists = products.find(p => p.id === productParam);
      if (exists) {
        setSelectedProduct(productParam);
      }
    }
  }, [productParam, products.length]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId: selectedProduct,
          account: data,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
      fetchAccounts(selectedProduct);
      fetchProducts();
      setShowModal(false);
      resetForm();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi tạo");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch("/api/admin/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
      fetchAccounts(selectedProduct);
      setShowModal(false);
      setEditingAccount(null);
      resetForm();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/accounts?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể xóa");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
      fetchAccounts(selectedProduct);
      fetchProducts();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa");
    },
  });

  const batchMutation = useMutation({
    mutationFn: async (accountsData: { email: string; password: string }[]) => {
      const res = await fetch("/api/admin/accounts/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId: selectedProduct,
          accounts: accountsData,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể import");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
      fetchAccounts(selectedProduct);
      fetchProducts();
      setShowBatchModal(false);
      setBatchData("");
      alert(`Đã thêm ${data.count} tài khoản thành công!`);
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi import");
    },
  });

  const handleBatchImport = () => {
    if (!selectedProduct) {
      alert("Vui lòng chọn sản phẩm trước!");
      return;
    }

    const lines = batchData.trim().split("\n").filter(l => l.trim());
    if (lines.length === 0) {
      alert("Không có dữ liệu để import!");
      return;
    }

    const accounts = lines.map(line => {
      const parts = line.split("|");
      return {
        email: parts[0]?.trim() || "",
        password: parts[1]?.trim() || "",
      };
    }).filter(acc => acc.email && acc.password);

    if (accounts.length === 0) {
      alert("Không có tài khoản hợp lệ! Định dạng: email|mật_khẩu");
      return;
    }

    if (!confirm(`Thêm ${accounts.length} tài khoản?`)) return;

    batchMutation.mutate(accounts);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      status: "AVAILABLE",
    });
  };

  const handleOpenAdd = () => {
    if (!selectedProduct) {
      alert("Vui lòng chọn sản phẩm trước!");
      return;
    }
    setEditingAccount(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      email: account.email,
      password: decodePassword(account.password),
      status: account.status,
    });
    setShowModal(true);
  };

  const handleDelete = (account: Account) => {
    if (account.status === "SOLD") {
      alert("Tài khoản đã bán, không thể xóa!");
      return;
    }
    if (!confirm(`Xóa tài khoản "${account.email}"?`)) return;
    deleteMutation.mutate(account.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      alert("Email/Tài khoản không được để trống!");
      return;
    }
    if (!formData.password.trim()) {
      alert("Mật khẩu không được để trống!");
      return;
    }

    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCopy = async (account: Account) => {
    const decodedPassword = decodePassword(account.password);
    const text = `${account.email}:${decodedPassword}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePassword = (id: string) => {
    setShowPassword(showPassword === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" />Còn</Badge>;
      case "SOLD":
        return <Badge className="bg-blue-500/10 text-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Đã bán</Badge>;
      case "RESERVED":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Giữ</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500">{status}</Badge>;
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const currentProduct = products.find(p => p.id === selectedProduct);

  return (
    <AdminPageLayout 
      title="Quản lý Tài Khoản" 
      description="Thêm, sửa, xóa tài khoản (TK:MK) cho từng sản phẩm"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List Sidebar */}
        <div className="lg:col-span-1">
          <Card className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sản phẩm ({products.length})
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-[#1E293B] border-[#334155] text-white text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-4 text-[#64748B] text-sm">
                  {search ? "Không tìm thấy" : "Chưa có sản phẩm"}
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={`w-full text-left p-3 rounded-[10px] transition-all ${
                        selectedProduct === product.id
                          ? "bg-[#3B82F6]/20 border border-[#3B82F6]"
                          : "bg-[#1E293B] border border-transparent hover:border-[#334155]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-medium truncate pr-2">
                          {product.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          product.stock > 0 
                            ? "bg-green-500/20 text-green-500" 
                            : "bg-gray-500/20 text-gray-500"
                        }`}>
                          {product.stock} TK
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Accounts List */}
        <div className="lg:col-span-2">
          <Card className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Tài Khoản {currentProduct ? `- ${currentProduct.name}` : ""}
                  </CardTitle>
                  <p className="text-sm text-[#64748B] mt-1">
                    {accounts.length} tài khoản | {accounts.filter(a => a.status === "AVAILABLE").length} còn trống
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchAccounts(selectedProduct)} 
                    disabled={!selectedProduct || loadingAccounts}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingAccounts ? "animate-spin" : ""}`} />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setShowBatchModal(true)}
                    variant="outline"
                    disabled={!selectedProduct}
                    title="Nhập nhiều TK cùng lúc"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Batch
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleOpenAdd}
                    disabled={!selectedProduct}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm TK:MK
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedProduct ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#64748B]">
                  <Package className="h-12 w-12 mb-3 opacity-50" />
                  <p>Chọn sản phẩm để xem tài khoản</p>
                </div>
              ) : loadingAccounts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#64748B]">
                  <Key className="h-12 w-12 mb-3 opacity-50" />
                  <p className="mb-2">Chưa có tài khoản nào</p>
                  <Button size="sm" variant="outline" onClick={handleOpenAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm tài khoản đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div 
                      key={account.id} 
                      className="flex items-center justify-between p-4 rounded-[12px] bg-[#1E293B] border border-[#334155] hover:border-[#6366F1] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(account.status)}
                          <span className="text-xs text-[#64748B]">
                            {new Date(account.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono text-sm bg-[#0F172A] px-2 py-1 rounded">
                              {account.email}
                            </span>
                            <span className="text-[#64748B]">:</span>
                            <span className="text-white font-mono text-sm bg-[#0F172A] px-2 py-1 rounded">
                              {showPassword === account.id ? decodePassword(account.password) : "••••••••"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => togglePassword(account.id)}
                          className="h-8 w-8 rounded-[6px] bg-[#0F172A] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#3B82F6]/20 transition-colors"
                          title={showPassword === account.id ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showPassword === account.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(account)}
                          className="h-8 w-8 rounded-[6px] bg-[#0F172A] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#3B82F6]/20 transition-colors"
                          title="Copy TK:MK"
                        >
                          {copiedId === account.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(account)}
                          className="h-8 w-8 rounded-[6px] bg-[#0F172A] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#3B82F6]/20 transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account)}
                          className="h-8 w-8 rounded-[6px] bg-[#0F172A] flex items-center justify-center text-[#94A3B8] hover:text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Xóa"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[16px] border border-[#1E293B] bg-[#0F172A]">
            <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
              <h2 className="text-lg font-bold text-white">
                {editingAccount ? "Sửa Tài Khoản" : "Thêm Tài Khoản Mới"}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingAccount(null); }} 
                className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">
                  Sản phẩm
                </label>
                <div className="h-10 px-3 rounded-[8px] bg-[#1E293B] border border-[#334155] text-white text-sm flex items-center">
                  {currentProduct?.name || "Chưa chọn"}
                </div>
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">
                  Tài khoản (Email) *
                </label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">
                  Mật khẩu *
                </label>
                <Input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="Mật khẩu"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-[8px] bg-[#1E293B] border border-[#334155] text-white text-sm focus:border-[#3B82F6] focus:outline-none"
                >
                  <option value="AVAILABLE">Còn trống</option>
                  <option value="RESERVED">Đang giữ</option>
                  <option value="SOLD">Đã bán</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setShowModal(false); setEditingAccount(null); }}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingAccount ? (
                    "Lưu thay đổi"
                  ) : (
                    "Thêm tài khoản"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-[16px] border border-[#1E293B] bg-[#0F172A] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Nhiều Tài Khoản
              </h2>
              <button 
                onClick={() => { setShowBatchModal(false); setBatchData(""); }} 
                className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-[8px] bg-[#1E293B] border border-[#334155]">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-[#3B82F6] mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium mb-1">Định dạng dữ liệu:</p>
                    <p className="text-xs text-[#94A3B8]">Mỗi dòng: <code className="bg-[#0F172A] px-1 py-0.5 rounded text-[#10B981]">email|mật_khẩu</code></p>
                    <p className="text-xs text-[#94A3B8] mt-1">Ví dụ: <code className="bg-[#0F172A] px-1 py-0.5 rounded text-[#10B981]">user@email.com|password123</code></p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">
                  Sản phẩm
                </label>
                <div className="h-10 px-3 rounded-[8px] bg-[#1E293B] border border-[#334155] text-white text-sm flex items-center">
                  {currentProduct?.name || "Chưa chọn"}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">
                  Dán dữ liệu (mỗi dòng 1 tài khoản) *
                </label>
                <textarea
                  value={batchData}
                  onChange={(e) => setBatchData(e.target.value)}
                  className="w-full h-64 rounded-[8px] border border-[#334155] bg-[#1E293B] px-3 py-2.5 text-sm text-white font-mono focus:border-[#3B82F6] focus:outline-none"
                  placeholder={`user1@email.com|password1\nuser2@email.com|password2\nuser3@email.com|password3`}
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-[#94A3B8]">
                  {batchData.trim().split("\n").filter(l => l.trim()).length} tài khoản sẽ được thêm
                </p>
                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => { setShowBatchModal(false); setBatchData(""); }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleBatchImport}
                    disabled={!batchData.trim() || batchMutation.isPending}
                  >
                    {batchMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import {batchData.trim().split("\n").filter(l => l.trim()).length} TK
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
