"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  getCourierSettings,
  updateCourierSetting,
  testCourierConnection,
  getOrders,
  dispatchOrderToCourier,
} from "@/lib/api";
import {
  Truck,
  CheckCircle2,
  XCircle,
  Key,
  ShieldCheck,
  Send,
  RefreshCw,
  Search,
  ExternalLink,
  Sliders,
  Package,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { TableSkeleton } from "@/components/Skeletons";

export default function CourierPage() {
  const [activeTab, setActiveTab] = useState("settings"); // 'settings' | 'dispatch' | 'tracking'
  const [loading, setLoading] = useState(true);
  const [testingSteadfast, setTestingSteadfast] = useState(false);
  const [testingPathao, setTestingPathao] = useState(false);
  const [savingSteadfast, setSavingSteadfast] = useState(false);
  const [savingPathao, setSavingPathao] = useState(false);

  // Steadfast state
  const [steadfast, setSteadfast] = useState({
    isEnabled: false,
    isDefault: false,
    apiKey: "",
    secretKey: "",
    baseUrl: "https://portal.steadfast.com.bd/api/v1",
  });

  // Pathao state
  const [pathao, setPathao] = useState({
    isEnabled: false,
    isDefault: false,
    clientId: "",
    clientSecret: "",
    username: "",
    password: "",
    storeId: "",
    pathaoBaseUrl: "https://api-hermes.pathao.com",
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dispatchingId, setDispatchingId] = useState(null);
  const [searchTracking, setSearchTracking] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getCourierSettings();
      if (res.steadfast) {
        setSteadfast({
          isEnabled: Boolean(res.steadfast.isEnabled),
          isDefault: Boolean(res.steadfast.isDefault),
          apiKey: res.steadfast.apiKey || "",
          secretKey: res.steadfast.secretKey || "",
          baseUrl: res.steadfast.baseUrl || "https://portal.steadfast.com.bd/api/v1",
        });
      }
      if (res.pathao) {
        setPathao({
          isEnabled: Boolean(res.pathao.isEnabled),
          isDefault: Boolean(res.pathao.isDefault),
          clientId: res.pathao.clientId || "",
          clientSecret: res.pathao.clientSecret || "",
          username: res.pathao.username || "",
          password: res.pathao.password || "",
          storeId: res.pathao.storeId || "",
          pathaoBaseUrl: res.pathao.pathaoBaseUrl || "https://api-hermes.pathao.com",
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to load courier settings");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await getOrders();
      setOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadOrders();
  }, []);

  const handleSaveSteadfast = async (e) => {
    e.preventDefault();
    setSavingSteadfast(true);
    try {
      await updateCourierSetting("steadfast", steadfast);
      toast.success("Steadfast Courier settings saved successfully!");
      loadSettings();
    } catch (err) {
      toast.error(err.message || "Failed to save Steadfast settings");
    } finally {
      setSavingSteadfast(false);
    }
  };

  const handleSavePathao = async (e) => {
    e.preventDefault();
    setSavingPathao(true);
    try {
      await updateCourierSetting("pathao", pathao);
      toast.success("Pathao Courier settings saved successfully!");
      loadSettings();
    } catch (err) {
      toast.error(err.message || "Failed to save Pathao settings");
    } finally {
      setSavingPathao(false);
    }
  };

  const handleTestConnection = async (provider) => {
    if (provider === "steadfast") setTestingSteadfast(true);
    if (provider === "pathao") setTestingPathao(true);

    try {
      const res = await testCourierConnection(provider);
      if (res.success) {
        toast.success(res.message || `${provider.toUpperCase()} connection verified!`);
      } else {
        toast.error(res.message || `${provider.toUpperCase()} connection failed`);
      }
    } catch (err) {
      toast.error(err.message || "Connection test failed");
    } finally {
      if (provider === "steadfast") setTestingSteadfast(false);
      if (provider === "pathao") setTestingPathao(false);
    }
  };

  const handleDispatch = async (orderId, provider) => {
    setDispatchingId(orderId);
    try {
      const res = await dispatchOrderToCourier(orderId, provider);
      toast.success(res.message || "Order dispatched to courier successfully!");
      loadOrders();
    } catch (err) {
      toast.error(err.message || "Dispatch failed");
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <AdminLayout activeSection="Courier Integration" searchPlaceholder="Search courier settings...">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Courier Integration
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Connect Steadfast & Pathao courier APIs for automated shipping & parcel dispatch.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "settings"
                ? "bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            API Settings
          </button>
          <button
            onClick={() => setActiveTab("dispatch")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "dispatch"
                ? "bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Order Dispatch
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : activeTab === "settings" ? (
        /* Settings Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Steadfast Card */}
          <div className="bg-white dark:bg-[#121220] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-lg border border-orange-500/20">
                    SF
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Steadfast Courier</h3>
                    <p className="text-xs text-gray-500">Fast nationwide Bangladesh delivery API</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={steadfast.isEnabled}
                    onChange={(e) => setSteadfast({ ...steadfast, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <form onSubmit={handleSaveSteadfast} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={steadfast.apiKey}
                    onChange={(e) => setSteadfast({ ...steadfast, apiKey: e.target.value })}
                    placeholder="e.g. sf_live_key_xxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    value={steadfast.secretKey}
                    onChange={(e) => setSteadfast({ ...steadfast, secretKey: e.target.value })}
                    placeholder="e.g. sf_sec_key_xxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Base Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={steadfast.baseUrl}
                    onChange={(e) => setSteadfast({ ...steadfast, baseUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={steadfast.isDefault}
                      onChange={(e) => setSteadfast({ ...steadfast, isDefault: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Set as Default Courier
                  </label>
                  {steadfast.isEnabled && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={savingSteadfast}
                    className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {savingSteadfast ? "Saving..." : "Save Settings"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestConnection("steadfast")}
                    disabled={testingSteadfast || !steadfast.apiKey}
                    className="bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {testingSteadfast ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                    Test Connection
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Pathao Card */}
          <div className="bg-white dark:bg-[#121220] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center font-black text-lg border border-red-500/20">
                    PTH
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Pathao Courier</h3>
                    <p className="text-xs text-gray-500">Pathao Hermes merchant API integration</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pathao.isEnabled}
                    onChange={(e) => setPathao({ ...pathao, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <form onSubmit={handleSavePathao} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={pathao.clientId}
                      onChange={(e) => setPathao({ ...pathao, clientId: e.target.value })}
                      placeholder="Client ID"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={pathao.clientSecret}
                      onChange={(e) => setPathao({ ...pathao, clientSecret: e.target.value })}
                      placeholder="Client Secret"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Username / Email
                    </label>
                    <input
                      type="text"
                      value={pathao.username}
                      onChange={(e) => setPathao({ ...pathao, username: e.target.value })}
                      placeholder="Merchant Username"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      value={pathao.password}
                      onChange={(e) => setPathao({ ...pathao, password: e.target.value })}
                      placeholder="Password"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Pathao Store ID
                  </label>
                  <input
                    type="text"
                    value={pathao.storeId}
                    onChange={(e) => setPathao({ ...pathao, storeId: e.target.value })}
                    placeholder="e.g. 12345"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={pathao.isDefault}
                      onChange={(e) => setPathao({ ...pathao, isDefault: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Set as Default Courier
                  </label>
                  {pathao.isEnabled && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={savingPathao}
                    className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {savingPathao ? "Saving..." : "Save Settings"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTestConnection("pathao")}
                    disabled={testingPathao || !pathao.clientId}
                    className="bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {testingPathao ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                    Test Connection
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Order Dispatch Tab */
        <div className="bg-white dark:bg-[#121220] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Quick Courier Order Dispatch</h3>
              <p className="text-xs text-gray-500 mt-0.5">Send pending orders directly to Steadfast or Pathao with 1 click.</p>
            </div>
            <button
              onClick={loadOrders}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${ordersLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Courier Consignment</th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {orders.map((o) => {
                  const id = o._id || o.id;
                  const isDispatching = dispatchingId === id;
                  const courierInfo = o.courier;

                  return (
                    <tr key={id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                        #{o.orderId || id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {o.shippingAddress?.fullName || o.user?.fullName || "Customer"}
                        </div>
                        <div className="text-xs text-gray-400">{o.shippingAddress?.phone || o.phone || "No phone"}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white tabular-nums">
                        ৳{o.totalPrice || o.total || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          {o.status || "Processing"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {courierInfo ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 capitalize">
                              <Truck className="w-3.5 h-3.5" />
                              {courierInfo.provider}: {courierInfo.status || "Dispatched"}
                            </span>
                            <div className="text-[11px] font-mono text-gray-400">
                              ID: {courierInfo.consignmentId || courierInfo.trackingCode}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Not Dispatched</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDispatch(id, "steadfast")}
                            disabled={isDispatching || !steadfast.isEnabled}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Steadfast
                          </button>
                          <button
                            onClick={() => handleDispatch(id, "pathao")}
                            disabled={isDispatching || !pathao.isEnabled}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Pathao
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      No orders found to dispatch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
