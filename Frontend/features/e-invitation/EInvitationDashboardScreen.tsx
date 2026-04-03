"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  MailOpen,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Plus,
  MapPin,
  Clock,
} from "lucide-react";

export default function EInvitationDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("events");

  const menuItems = [
    { id: "events", label: "Events", icon: Calendar },
    { id: "guests", label: "Guests & RSVPs", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
              E-invitation card
            </p>
            <div className="grid lg:grid-cols-4 gap-8">
              <DashboardSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                menuItems={menuItems}
              />

              <div className="lg:col-span-3">
                {activeTab === "events" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-3xl font-bold text-black mb-2">
                          Your events
                        </h2>
                        <p className="text-gray-600">
                          Create and manage digital invitations with RSVP
                          tracking.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center space-x-2 bg-black text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New invitation</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                            <MailOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-black">
                              Spring launch party
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                              <span className="inline-flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Apr 12, 2025 · 6:00 PM
                              </span>
                              <span className="inline-flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                Warehouse District
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-sm text-gray-500">RSVPs</p>
                          <p className="text-2xl font-bold text-black">
                            86 / 120
                          </p>
                        </div>
                      </div>
                      <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500">
                        <Clock className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                        <p>Draft or schedule more invitations here.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "guests" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                  >
                    <h2 className="text-3xl font-bold text-black mb-6">
                      Guests & RSVPs
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {user?.name ? `${user.name}, ` : ""}
                      see who opened your invite and their response.
                    </p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-600">
                          <tr>
                            <th className="px-4 py-3 font-medium">Guest</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Plus-ones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[
                            { name: "Lee Chen", status: "Attending", plus: 1 },
                            { name: "Priya N.", status: "Maybe", plus: 0 },
                            { name: "Alex M.", status: "Declined", plus: 0 },
                          ].map((row) => (
                            <tr key={row.name}>
                              <td className="px-4 py-3 font-medium text-gray-900">
                                {row.name}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {row.status}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {row.plus}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === "analytics" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                  >
                    <h2 className="text-3xl font-bold text-black mb-6">
                      Analytics
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">
                          Invite opens
                        </p>
                        <p className="text-3xl font-bold text-black">3.4k</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">RSVP rate</p>
                        <p className="text-3xl font-bold text-black">68%</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Shares</p>
                        <p className="text-3xl font-bold text-black">412</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "settings" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                  >
                    <h2 className="text-3xl font-bold text-black mb-6">
                      Settings
                    </h2>
                    <div className="space-y-4 max-w-lg">
                      <label className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                        <span className="text-gray-800">
                          Send reminder 3 days before
                        </span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300"
                          defaultChecked
                        />
                      </label>
                      <label className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                        <span className="text-gray-800">
                          Collect dietary preferences
                        </span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </label>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
