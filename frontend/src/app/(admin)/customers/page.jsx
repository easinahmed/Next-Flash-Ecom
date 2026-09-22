// @ts-nocheck
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Eye,
  Pencil,
  Ban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import toast from "react-hot-toast";

/* ------------------------------------------------------------------ */
/* Dashboard stats are derived from API-fetched customers below.      */
/* ------------------------------------------------------------------ */

import { getCustomers } from "@/lib/api";
import { createCustomer, getCustomer, updateCustomer, updateCustomerStatus } from "@/lib/api";
import { withUids } from "@/lib/uid";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700",
  Blocked: "bg-red-50 text-red-700",
};

const PAGE_SIZE = 6;

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCustomers()
      .then((res) => {
        if (!mounted) return;
        setCustomers(withUids(res).map((c) => ({ ...c, id: c._id || c.id })));
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || String(err));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // compute stats from fetched customers
  const now = new Date();
  const totalCustomers = customers.length;
  const newThisMonth = customers.filter((c) => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const blockedCount = customers.filter((c) => (c.status === "Blocked") || (typeof c.isActive !== 'undefined' && c.isActive === false)).length;
  const activeCount = totalCustomers - blockedCount;

  const stats = [
    { label: "Total Customers", value: String(totalCustomers), accent: "#2563eb", icon: Users },
    { label: "New This Month", value: String(newThisMonth), accent: "#16a34a", icon: UserPlus },
    { label: "Active", value: String(activeCount), accent: "#d62828", icon: UserCheck },
    { label: "Blocked", value: String(blockedCount), accent: "#6b7280", icon: UserX },
  ];
  return (
    <AdminLayout activeSection="Customers" searchPlaceholder="Search customers by name or email…">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1d24]">Customers</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Manage everyone who has an account or has placed an order.
          </p>
        </div>
        <button type="button" onClick={() => setModal({ mode: 'add' })} className="flex items-center gap-2 bg-[#d62828] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#b91c1c] transition-colors">
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          </div>
        ))}
      </div>

      {/* Customers table card */}
      <div className="bg-white rounded-xl border border-black/6 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-black/6">
          <div className="flex items-center gap-2 bg-[#f5f4f2] rounded-lg px-3 py-2 w-full max-w-sm">
            <Search className="w-4 h-4 text-[#6b7280] shrink-0" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email"
              className="bg-transparent text-sm text-[#1b1d24] placeholder-[#9ca3af] outline-none flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6b7280]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-black/10 text-sm text-[#1b1d24] rounded-lg px-3 py-2 outline-none"
            >
              <option>All</option>
              <option>Active</option>
              <option>Blocked</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#6b7280] border-b border-black/6">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Contact</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Total Spent</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((c) => (
                <tr key={c._uid} className="border-b border-black/6 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#12141c] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                        {initials(c.fullName || "")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#1b1d24] truncate">{c.fullName}</p>
                        <p className="text-xs text-[#6b7280] truncate md:hidden">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <p className="text-[#1b1d24] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#6b7280]" /> {c.email}
                    </p>
                    <p className="text-xs text-[#6b7280] flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5" /> {c.phone}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-[#1b1d24] tabular-nums">{c.orders || 0}</td>
                  <td className="px-5 py-3 text-[#1b1d24] tabular-nums">৳{(c.spent || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-[#6b7280] hidden sm:table-cell">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[c.status || "Active"]}`}>
                      {c.status || "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                      className="text-[#6b7280] hover:text-[#1b1d24]"
                      aria-label="Row actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === c.id && (
                      <div className="absolute right-5 top-10 z-10 w-44 bg-white border border-black/10 rounded-lg shadow-lg py-1 text-left">
                        <button onClick={async () => { setModal({ mode: 'view', customer: c }); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1b1d24] hover:bg-[#f5f4f2]">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button onClick={async () => { setModal({ mode: 'edit', customer: c }); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1b1d24] hover:bg-[#f5f4f2]">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={async () => {
                          try {
                            const updated = await updateCustomerStatus(c.id, !(c.isActive === undefined ? true : c.isActive));
                            setCustomers((prev) => prev.map((x) => x.id === c.id ? { ...x, isActive: updated.isActive, status: updated.isActive ? 'Active' : 'Blocked' } : x));
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setOpenMenuId(null);
                          }
                        }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          <Ban className="w-3.5 h-3.5" />
                          {c.isActive === false || c.status === 'Blocked' ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#6b7280]">
                    No customers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Customer modal */}
        {modal && (
          <CustomerModal
            mode={modal.mode}
            customer={modal.customer}
            onClose={() => setModal(null)}
            onSaved={(saved) => {
              if (modal.mode === 'add') setCustomers((prev) => [ { ...saved, id: saved._id || saved.id }, ...prev ]);
              else setCustomers((prev) => prev.map((p) => (p.id === saved._id || p.id === saved.id ? { ...p, ...saved } : p)));
              setModal(null);
            }}
          />
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-black/6">
          <p className="text-sm text-[#6b7280]">
            Showing {pageItems.length} of {filtered.length} customers
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-black/10 rounded-lg text-[#1b1d24] disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#1b1d24] tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-black/10 rounded-lg text-[#1b1d24] disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function CustomerModal({ mode, customer, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(customer?.fullName || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");

  const [isActive, setIsActive] = useState(customer?.isActive ?? true);

  useEffect(() => {
    let mounted = true;
    if (mode !== 'add' && customer?.id) {
      setLoading(true);
      getCustomer(customer.id)
        .then((res) => {
          if (!mounted) return;
          setFullName(res.fullName || res.fullName || "");
          setEmail(res.email || "");
          setPhone(res.phone || "");
          setAddress(res.address || "");
          setIsActive(typeof res.isActive !== 'undefined' ? res.isActive : true);
        })
        .catch((err) => console.error(err))
        .finally(() => mounted && setLoading(false));
    }
    return () => { mounted = false; };
  }, [mode, customer]);

  const isView = mode === 'view';

  const handleSave = async () => {
    try {
      setLoading(true);
      if (mode === 'add') {
        const created = await createCustomer({ fullName, email, phone, address });
        onSaved(created);
      } else if (mode === 'edit' && customer?.id) {
        const updated = await updateCustomer(customer.id, { fullName, email, phone, address });
        onSaved(updated);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-full max-w-md p-6 text-[#1b1d24]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{mode === 'add' ? 'Add Customer' : mode === 'edit' ? 'Edit Customer' : 'Customer'}</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">Full name</label>
              <input disabled={isView} value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1b1d24]" />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">Email</label>
              <input disabled={isView} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1b1d24]" />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">Phone</label>
              <input disabled={isView} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1b1d24]" />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">Address</label>
              <input disabled={isView} value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1b1d24]" />
            </div>

            {mode !== 'add' && (
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span className="text-sm">Active</span>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {!isView && <button onClick={handleSave} className="flex-1 bg-[#d62828] text-white py-2.5 rounded-lg">{mode === 'add' ? 'Create' : 'Save'}</button>}
              <button onClick={onClose} className="flex-1 border rounded-lg py-2.5">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}