// @ts-nocheck
"use client";

import { DashboardStatSkeleton, TableSkeleton } from "@/components/Skeletons";
import {
  Package,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import AdminLayout from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { getProducts, getCustomers, getOrders } from "@/lib/api";
import { withUids } from "@/lib/uid";

/* ------------------------------------------------------------------ */
/* Placeholder data — replace with real API/DB-backed data            */
/* ------------------------------------------------------------------ */

// Static placeholders removed — values are derived from API below.

const statusStyles = {
  Delivered: "bg-emerald-50 text-emerald-700",
  Processing: "bg-blue-50 text-blue-700",
  Shipped: "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-700",
};

/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getProducts(), getCustomers(), getOrders()])
      .then(([p, c, o]) => {
        if (!mounted) return;
        setProducts(withUids(p));
        setCustomers(withUids(c));
        setOrders(withUids(o));
      })
      .catch((err) => console.error("Dashboard load error:", err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // derived stats
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  // revenue trend: last 6 months totals derived from orders
  const revenueTrend = (() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({ key, month: d.toLocaleString(undefined, { month: "short" }), revenue: 0 });
    }
    const map = new Map(months.map((m) => [m.key, { month: m.month, revenue: 0 }]));
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (map.has(k)) {
        map.get(k).revenue += o.total || 0;
      }
    }
    return Array.from(map.values());
  })();

  // recent orders (most recent first)
  const recentOrdersFromApi = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((o) => ({ id: o.orderId || o._id, customer: o.customerName || o.customer?.fullName || o.customer?.email || "Guest", date: new Date(o.createdAt).toLocaleDateString(), amount: `৳${(o.total || 0).toLocaleString()}`, status: o.status }));

  // top products by sold quantity (aggregate across orders)
  const topProductsBySales = (() => {
    const map = new Map();
    for (const o of orders) {
      for (const it of o.items || []) {
        const key = it.productId || it.name;
        const entry = map.get(key) || { name: it.name || "Untitled", image: it.image || "/shoe1.avif", sold: 0, revenue: 0 };
        entry.sold += it.quantity || 0;
        entry.revenue += (it.price || 0) * (it.quantity || 0);
        map.set(key, entry);
      }
    }
    // enrich with product catalog data when available
    const arr = Array.from(map.entries()).map(([key, entry]) => {
      const prod = products.find((pr) => String(pr.id) === String(key) || String(pr.id) === String(entry._id) || String(pr.id) === String(entry.id));
      if (prod) {
        return { ...entry, name: prod.title || entry.name, image: prod.thumbnail || entry.image, revenue: entry.revenue };
      }
      return { ...entry, revenue: entry.revenue };
    });
    return arr.sort((a, b) => b.sold - a.sold).slice(0, 4).map((p, i) => ({ ...p, _uid: `top-${i}`, revenue: `৳${p.revenue.toLocaleString()}` }));
  })();

  // derive order status counts from API orders
  const dynamicOrderStatus = (() => {
    const counts = { Delivered: 0, Processing: 0, Shipped: 0, Cancelled: 0 };
    for (const o of orders) {
      const s = String(o.status || "").trim();
      if (counts[s] !== undefined) counts[s] += 1;
    }
    const total = orders.length || 1;
    return [
      { label: "Delivered", count: counts.Delivered, pct: Math.round((counts.Delivered / total) * 100), color: "#16a34a" },
      { label: "Processing", count: counts.Processing, pct: Math.round((counts.Processing / total) * 100), color: "#2563eb" },
      { label: "Shipped", count: counts.Shipped, pct: Math.round((counts.Shipped / total) * 100), color: "#d97706" },
      { label: "Cancelled", count: counts.Cancelled, pct: Math.round((counts.Cancelled / total) * 100), color: "#d62828" },
    ];
  })();

  const stats = [
    { label: "Revenue", value: `৳${totalRevenue.toLocaleString()}`, change: "", up: true, accent: "#d62828", icon: DollarSign },
    { label: "Orders", value: String(totalOrders), change: "", up: true, accent: "#2563eb", icon: ShoppingBag },
    { label: "Customers", value: String(totalCustomers), change: "", up: true, accent: "#16a34a", icon: Users },
    { label: "Products", value: String(totalProducts), change: "", up: true, accent: "#b45309", icon: Package },
  ];

  const recentOrders = recentOrdersFromApi;
  // If no sales data is available, derive top products from the product catalog
  const topProducts = topProductsBySales.length
    ? topProductsBySales
    : products.slice(0, 4).map((p, i) => ({
        _uid: `catalog-${i}`,
        image: p.thumbnail || (p.images && p.images[0]) || "/shoe1.avif",
        name: p.title || p.name || "Untitled",
        sold: 0,
        revenue: `৳${(p.price || 0).toLocaleString()}`,
      }));

  return (
    <AdminLayout activeSection="Dashboard">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1d24]">Good afternoon, Admin</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Here's what's happening across the store today.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 space-y-6">
          <DashboardStatSkeleton />
          <TableSkeleton rows={4} cols={4} />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-black/6 p-5"
            style={{ borderLeftWidth: 3, borderLeftColor: stat.accent }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#6b7280]">{stat.label}</span>
              <stat.icon className="w-4 h-4" style={{ color: stat.accent }} />
            </div>
              <p className="text-2xl font-bold text-[#1b1d24] tabular-nums">{stat.value}</p>
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                stat.up ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {stat.change} vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-black/6 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#1b1d24]">Revenue trend</h2>
              <p className="text-xs text-[#6b7280]">Last 6 months</p>
            </div>
            <button className="text-[#6b7280]" aria-label="More options">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d62828" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#d62828" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v) => [`৳${v.toLocaleString()}`, "Revenue"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 13 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d62828" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-black/6 p-5">
          <h2 className="font-semibold text-[#1b1d24] mb-4">Order status</h2>
          <div className="space-y-4">
            {dynamicOrderStatus.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-[#1b1d24] font-medium">{s.label}</span>
                  <span className="text-[#6b7280]">{s.count}</span>
                </div>
                <div className="h-1.5 w-full bg-[#f0efec] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table + top products row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-black/6 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/6">
            <h2 className="font-semibold text-[#1b1d24]">Recent orders</h2>
            <a href="#" className="text-sm text-[#d62828] font-medium hover:underline">View all</a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#6b7280] border-b border-black/6">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Date</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-black/6 last:border-0">
                  <td className="px-5 py-3 font-medium text-[#1b1d24]">{order.id}</td>
                  <td className="px-5 py-3 text-[#1b1d24]">{order.customer}</td>
                  <td className="px-5 py-3 text-[#6b7280] hidden sm:table-cell">{order.date}</td>
                  <td className="px-5 py-3 text-[#1b1d24] tabular-nums">{order.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-black/6 p-5">
          <h2 className="font-semibold text-[#1b1d24] mb-4">Top selling products</h2>
          <ul className="space-y-4">
            {topProducts.map((p) => (
              <li key={p._uid} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-[#f5f4f2] overflow-hidden shrink-0 flex items-center justify-center">
                  <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1b1d24] truncate">{p.name}</p>
                  <p className="text-xs text-[#6b7280]">{p.sold} sold</p>
                </div>
                <span className="text-sm font-semibold text-[#1b1d24] tabular-nums shrink-0">{p.revenue}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </>
      )}
    </AdminLayout>
  );
}