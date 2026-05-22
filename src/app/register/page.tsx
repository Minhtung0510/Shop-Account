"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || "Đã xảy ra lỗi. Vui lòng thử lại." });
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setErrors({ form: "Đã xảy ra lỗi. Vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0F172A]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </motion.div>
              <span className="font-sora text-2xl font-bold text-white">
                Shop<span className="gradient-text">Account</span>
              </span>
            </Link>
            <motion.h1
              className="font-sora text-2xl font-bold text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Tạo tài khoản mới
            </motion.h1>
            <motion.p
              className="text-[#94A3B8]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Đăng ký để mua tài khoản và dịch vụ online
            </motion.p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="!rounded-[18px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-shadow duration-300">
              <CardContent className="p-6 lg:p-8 space-y-4">
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {errors.form && (
                    <motion.div
                      className="rounded-[12px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {errors.form}
                    </motion.div>
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
                    <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-[#334155] bg-[#111827] text-[#3B82F6] focus:ring-[#3B82F6]" />
                    <span className="text-sm text-[#94A3B8]">
                      Tôi đồng ý với{" "}
                      <Link href="/dieu-khoan" className="text-[#3B82F6] hover:underline">Điều khoản sử dụng</Link>
                      {" "}và{" "}
                      <Link href="/chinh-sach" className="text-[#3B82F6] hover:underline">Chính sách bảo mật</Link>
                    </span>
                  </label>

                  <Button type="submit" size="lg" className="w-full" loading={loading}>
                    <UserPlus className="h-4 w-4" />
                    Tạo tài khoản
                  </Button>
                </motion.form>

                <motion.p
                  className="text-center text-sm text-[#94A3B8]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="text-[#3B82F6] hover:underline font-medium">
                    Đăng nhập ngay
                  </Link>
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
