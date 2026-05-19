"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_USERS } from "@/lib/mock-users";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.phone || !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 số)";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const existing = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (existing) {
        setErrors({ form: "Email đã được sử dụng" });
        setLoading(false);
        return;
      }

      const newUser = {
        id: String(MOCK_USERS.length + 1),
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: "USER" as const,
        balance: 0,
        orders: 0,
        rank: "Bronze",
        created: new Date().toISOString().split("T")[0],
      };

      MOCK_USERS.push(newUser);
      localStorage.setItem("shopaccount_session", JSON.stringify(newUser));
      window.location.href = "/";
    } catch {
      setErrors({ form: "Đã xảy ra lỗi. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 bg-bg-primary">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="font-sora text-2xl font-bold text-text-primary">
                Shop<span className="gradient-text">Account</span>
              </span>
            </Link>
            <h1 className="font-sora text-2xl font-bold text-text-primary mb-2">Tạo tài khoản mới</h1>
            <p className="text-text-secondary">Đăng ký để mua tài khoản và dịch vụ online</p>
          </div>

          <Card className="!rounded-[18px]">
            <CardContent className="p-6 lg:p-8 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.form && (
                  <div className="rounded-[12px] border border-error/30 bg-error/10 p-3 text-sm text-error">
                    {errors.form}
                  </div>
                )}

                <Input
                  label="Tên đăng nhập"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.username}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email}
                  required
                />

                <Input
                  label="Số điện thoại"
                  type="tel"
                  placeholder="Nhập số điện thoại (10-11 số)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  leftIcon={<Phone className="h-4 w-4" />}
                  error={errors.phone}
                  required
                />

                <Input
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  error={errors.password}
                  required
                />

                <Input
                  label="Xác nhận mật khẩu"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword}
                  required
                />

                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-border bg-bg-primary text-primary focus:ring-primary" />
                  <span className="text-sm text-text-secondary">
                    Tôi đồng ý với{" "}
                    <Link href="/dieu-khoan" className="text-primary hover:underline">Điều khoản sử dụng</Link>
                    {" "}và{" "}
                    <Link href="/chinh-sach" className="text-primary hover:underline">Chính sách bảo mật</Link>
                  </span>
                </label>

                <Button type="submit" size="lg" className="w-full" loading={loading}>
                  <UserPlus className="h-4 w-4" />
                  Tạo tài khoản
                </Button>
              </form>

              <p className="text-center text-sm text-text-secondary">
                Đã có tài khoản?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Đăng nhập ngay
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
