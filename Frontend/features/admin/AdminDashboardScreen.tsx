"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LogOut,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Shield,
} from "lucide-react";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import {
  listUsersForAdmin,
  setUserPaymentStatus,
  deleteUser,
  addUser,
  readRawUsers,
} from "@/contexts/lib/userRegistry";
import type { AccountRecord, PaymentStatus } from "@/contexts/lib/userRegistry";
import type { ServiceId } from "@/contexts/lib/service";
import { logoutAdmin } from "@/contexts/lib/adminAuth";
import { useRouter } from "next/navigation";

function serviceLabel(s: ServiceId | null): string {
  if (!s) return "—";
  const map: Record<ServiceId, string> = {
    "nfc-business": "NFC Business card",
    loyalty: "Loyalty card",
    "e-invitation": "E-invitation card",
  };
  return map[s];
}

function paymentBadgeClass(s: PaymentStatus): string {
  if (s === "paid") return "bg-emerald-100 text-emerald-800";
  if (s === "failed") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-800";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState(listUsersForAdmin());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pendingDeletedUser, setPendingDeletedUser] =
    useState<AccountRecord | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarActionLabel, setSnackbarActionLabel] = useState<string | null>(
    null,
  );
  const snackbarTimer = useRef<number | null>(null);

  const refresh = useCallback(() => {
    setRows(listUsersForAdmin());
  }, []);

  useEffect(() => {
    refresh();
    return () => {
      if (snackbarTimer.current) {
        window.clearTimeout(snackbarTimer.current);
      }
    };
  }, [refresh]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const copyNfcLink = async (slug: string, userId: string) => {
    const url = `${origin}/c/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const onPaymentChange = (userId: string, value: PaymentStatus) => {
    setUserPaymentStatus(userId, value);
    refresh();
  };

  const clearSnackbar = () => {
    setSnackbarMessage(null);
    setSnackbarActionLabel(null);
    if (snackbarTimer.current) {
      window.clearTimeout(snackbarTimer.current);
      snackbarTimer.current = null;
    }
  };

  const onUndoDelete = () => {
    if (!pendingDeletedUser) return;
    addUser(pendingDeletedUser);
    setPendingDeletedUser(null);
    clearSnackbar();
    refresh();
  };

  const onDeleteUser = (userId: string) => {
    if (!window.confirm("Delete this user account? This cannot be undone.")) {
      return;
    }
    const deleted = readRawUsers().find((u) => u.id === userId);
    if (!deleted) return;

    deleteUser(userId);
    setPendingDeletedUser(deleted);
    setSnackbarMessage("User deleted");
    setSnackbarActionLabel("Undo");

    if (snackbarTimer.current) {
      window.clearTimeout(snackbarTimer.current);
    }
    snackbarTimer.current = window.setTimeout(() => {
      clearSnackbar();
      setPendingDeletedUser(null);
    }, 5000);

    refresh();
  };

  const handleLogout = () => {
    logoutAdmin();
    router.replace("/admin/login");
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-black" />
              <span className="font-bold text-black">BoldTap Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => refresh()}
                className="inline-flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-black"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                Site home
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 text-sm font-medium text-red-600 hover:text-red-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-black mb-2">Accounts</h1>
            <p className="text-gray-600 mb-8">
              Registered users, chosen service, payment status, and NFC public
              links for encoding; not shown to end users.
            </p>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Service</th>
                      <th className="px-4 py-3 font-semibold">Payment</th>
                      <th className="px-4 py-3 font-semibold">
                        NFC public link
                      </th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          No accounts yet. User data is stored in this browser
                          (local demo).
                        </td>
                      </tr>
                    ) : (
                      rows.map((u) => {
                        const isNfc = u.acquiredService === "nfc-business";
                        const slug = u.nfcPublicSlug ?? "";
                        const showNfc = isNfc && !!slug;
                        return (
                          <tr key={u.id} className="hover:bg-gray-50/80">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {u.name}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {u.email}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {serviceLabel(u.acquiredService)}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={u.paymentStatus}
                                onChange={(e) =>
                                  onPaymentChange(
                                    u.id,
                                    e.target.value as PaymentStatus,
                                  )
                                }
                                className={`rounded-lg border-0 px-2 py-1 text-xs font-semibold ${paymentBadgeClass(u.paymentStatus)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              {showNfc ? (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 max-w-md">
                                  <a
                                    href={`${origin}/c/${slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate text-xs font-mono"
                                  >
                                    {`${origin}/c/${slug}`}
                                  </a>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => copyNfcLink(slug, u.id)}
                                      className="inline-flex items-center space-x-1 px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-100"
                                      title="Copy URL"
                                    >
                                      {copiedId === u.id ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                      <span className="text-xs">Copy</span>
                                    </button>
                                    <a
                                      href={`${origin}/c/${slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center p-1.5 rounded border border-gray-200 text-gray-700 hover:bg-gray-100"
                                      title="Open"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => onDeleteUser(u.id)}
                                className="inline-flex items-center space-x-2 px-2 py-1 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
          {snackbarMessage && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg bg-gray-900 text-white flex items-center gap-3 z-50">
              <span className="text-sm">{snackbarMessage}</span>
              {snackbarActionLabel && (
                <button
                  type="button"
                  onClick={onUndoDelete}
                  className="text-sm font-semibold text-cyan-300 hover:text-white"
                >
                  {snackbarActionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={clearSnackbar}
                className="text-sm font-medium text-gray-300 hover:text-white"
              >
                Close
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}
