"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

type Period = "day" | "week" | "month" | "year";

interface ChartData {
  label: string;
  revenue: number;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "day", label: "1 ngày" },
  { value: "week", label: "1 tuần" },
  { value: "month", label: "1 tháng" },
  { value: "year", label: "1 năm" },
];

const MONTHS = [
  { value: "0", label: "Tháng 1" },
  { value: "1", label: "Tháng 2" },
  { value: "2", label: "Tháng 3" },
  { value: "3", label: "Tháng 4" },
  { value: "4", label: "Tháng 5" },
  { value: "5", label: "Tháng 6" },
  { value: "6", label: "Tháng 7" },
  { value: "7", label: "Tháng 8" },
  { value: "8", label: "Tháng 9" },
  { value: "9", label: "Tháng 10" },
  { value: "10", label: "Tháng 11" },
  { value: "11", label: "Tháng 12" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-[8px] border border-[#1E293B] bg-[#0F172A] px-3 py-2 shadow-lg min-w-[120px]">
        <p className="text-xs text-[#64748B] font-medium">{label}</p>
        <p className="text-sm font-bold text-[#6366F1]">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export function DashboardCharts() {
  const [period, setPeriod] = useState<Period>("month");
  const [monthParam, setMonthParam] = useState(() => new Date().getMonth().toString());
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChartData = useCallback(async (p: Period, month: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/chart/revenue?period=${p}&month=${month}`);
      if (res.ok) {
        const json = await res.json();
        setChartData(json.data || []);
      }
    } catch {
      // silently handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData(period, monthParam);
  }, [period, monthParam, fetchChartData]);

  const currentYear = new Date().getFullYear();
  const currentMonthLabel = MONTHS.find((m) => m.value === monthParam)?.label || "";

  return (
    <Card className="!rounded-[12px] bg-[#0F172A] border-[#1E293B]">
      <div className="p-5 pb-3 border-b border-[#1E293B] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Doanh thu</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {period === "day" && "Hôm nay"}
            {period === "week" && "7 ngày gần nhất"}
            {period === "month" && `${currentMonthLabel} ${currentYear}`}
            {period === "year" && `Năm ${currentYear}`}
          </p>
        </div>
        <div className="flex gap-2">
          {period === "month" && (
            <Select value={monthParam} onValueChange={setMonthParam}>
              <SelectTrigger className="h-8 w-[130px] bg-[#1E293B] border-0 text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0F172A] border-[#1E293B]">
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-xs">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="h-8 w-[100px] bg-[#1E293B] border-0 text-xs text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0F172A] border-[#1E293B]">
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <CardContent className="p-5">
        {loading ? (
          <Skeleton className="h-[280px] bg-[#1E293B]" />
        ) : chartData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-sm text-[#64748B]">Không có dữ liệu</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#94A3B8", paddingTop: 12, overflow: "visible" }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="revenue"
                name="Doanh thu"
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
