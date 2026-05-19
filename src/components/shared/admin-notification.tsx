"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, ShoppingBag, Zap, CheckCircle, Wallet } from "lucide-react";

interface Notification {
  id: string;
  type: "PRODUCT" | "SERVICE" | "TOPUP";
  user: string;
  amount: number;
  status?: string;
  serviceName?: string;
  bankCode?: string;
  transferContent?: string;
  createdAt: string;
}

let globalNotifications: Notification[] = [];
let listeners: Array<(n: Notification) => void> = [];

export function addNotification(notif: Notification) {
  globalNotifications = [notif, ...globalNotifications].slice(0, 20);
  listeners.forEach((l) => l(notif));
}

export function subscribeToNotifications(cb: (n: Notification) => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

function Toast({ notif, onClose }: { notif: Notification; onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(n);

  return (
    <div
      className={`relative flex items-start gap-3 rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4 shadow-2xl transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${
        notif.type === "SERVICE" ? "bg-purple-500/20" :
        notif.type === "TOPUP" ? "bg-green-500/20" : "bg-blue-500/20"
      }`}>
        {notif.type === "SERVICE" ? (
          <Zap className="h-5 w-5 text-purple-400" />
        ) : notif.type === "TOPUP" ? (
          <Wallet className="h-5 w-5 text-green-400" />
        ) : (
          <ShoppingBag className="h-5 w-5 text-blue-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`rounded-[6px] px-2 py-0.5 text-[10px] font-bold ${
            notif.type === "SERVICE"
              ? "bg-purple-500/20 text-purple-400"
              : notif.type === "TOPUP"
              ? "bg-green-500/20 text-green-400"
              : "bg-blue-500/20 text-blue-400"
          }`}>
            {notif.type === "SERVICE" ? "DỊCH VỤ" : notif.type === "TOPUP" ? "NẠP TIỀN" : "SẢN PHẨM"}
          </span>
          <span className="rounded-[6px] bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400">
            MỚI
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-white">
          {notif.type === "SERVICE" ? notif.serviceName :
           notif.type === "TOPUP" ? "Yêu cầu nạp tiền" : "Đơn hàng mới"}
        </p>
        <p className="text-xs text-[#64748B]">
          Khách hàng: <span className="text-[#94A3B8]">{notif.user}</span>
        </p>
        {notif.type === "TOPUP" && notif.transferContent ? (
          <p className="text-xs font-mono text-[#F59E0B]">
            Nội dung: <span className="font-bold">{notif.transferContent}</span>
          </p>
        ) : null}
        <p className="text-sm font-bold text-[#3B82F6]">{fmt(notif.amount)}</p>
      </div>

      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="shrink-0 rounded-[6px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AdminNotificationToasts() {
  const [toasts, setToasts] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    let es: EventSource;

    const connect = () => {
      es = new EventSource("/api/admin/notifications");

      es.addEventListener("connected", () => {
        console.log("SSE connected");
      });

      es.addEventListener("new_order", (e) => {
        const notif = JSON.parse(e.data) as Notification;
        setToasts((prev) => {
          if (prev.some((t) => t.id === notif.id)) return prev;
          return [...prev, notif];
        });
      });

      es.addEventListener("new_topup", (e) => {
        const notif = JSON.parse(e.data) as Notification;
        setToasts((prev) => {
          if (prev.some((t) => t.id === notif.id)) return prev;
          return [...prev, notif];
        });
      });

      es.onerror = () => {
        es.close();
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      es?.close();
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getNotifRoute = (notif: Notification) => {
    if (notif.type === "TOPUP") return "/shop-account-adm-notuser/nap-tien";
    if (notif.type === "SERVICE") return "/shop-account-adm-notuser/don-hang";
    return "/shop-account-adm-notuser/don-hang";
  };

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((notif) => (
        <div
          key={notif.id}
          onClick={() => router.push(getNotifRoute(notif))}
          className="cursor-pointer"
        >
          <Toast notif={notif} onClose={() => removeToast(notif.id)} />
        </div>
      ))}
    </div>
  );
}
