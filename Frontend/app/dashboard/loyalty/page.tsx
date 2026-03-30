"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import LoyaltyCard from "@/components/LoyaltyCard";
import {
  getLoyaltyCard,
  saveLoyaltyCard,
  addStamp,
  removeStamp,
  type LoyaltyCardData,
} from "@/contexts/lib/loyaltyCard";
import {
  listCustomers,
  incrementCustomerStamps,
  type LoyaltyCustomer,
} from "@/contexts/lib/loyaltyCustomers";
import { ensureLoyaltyPublicSlug } from "@/contexts/lib/userRegistry";
import {
  Gift,
  Users,
  BarChart3,
  Settings,
  Plus,
  QrCode,
  Edit2,
  Save,
  X,
  Copy,
  Check,
  Share2,
} from "lucide-react";

export default function LoyaltyDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("program");
  const [isEditing, setIsEditing] = useState(false);
  const [cardData, setCardData] = useState<LoyaltyCardData | null>(null);
  const [editForm, setEditForm] = useState<LoyaltyCardData | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);

  useEffect(() => {
    if (user?.id) {
      const saved = getLoyaltyCard(user.id);
      setCardData(saved);
      const slug = ensureLoyaltyPublicSlug(user.id);
      setShareUrl(`${window.location.origin}/l/${slug}`);
      setCustomers(listCustomers(user.id));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id && activeTab === "members") {
      setCustomers(listCustomers(user.id));
    }
  }, [user?.id, activeTab]);

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const shareNative = async () => {
    if (!shareUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My loyalty program", url: shareUrl });
      } else {
        await copyShareLink();
      }
    } catch {
      await copyShareLink();
    }
  };

  const handleSaveCard = () => {
    if (user?.id && editForm) {
      saveLoyaltyCard(user.id, editForm);
      setCardData(editForm);
      setIsEditing(false);
    }
  };

  const handleAddStamp = () => {
    if (user?.id) {
      const updated = addStamp(user.id);
      if (updated) {
        setCardData(updated);
      }
    }
  };

  const handleRemoveStamp = (stampId: string) => {
    if (user?.id) {
      const updated = removeStamp(user.id, stampId);
      if (updated) {
        setCardData(updated);
      }
    }
  };

  const bumpCustomerStamps = (customerId: string, delta: number) => {
    if (!user?.id) return;
    incrementCustomerStamps(user.id, customerId, delta);
    setCustomers(listCustomers(user.id));
  };

  const handleCreateCard = () => {
    if (user) {
      const newCard: LoyaltyCardData = {
        cardName: "My Loyalty Card",
        businessName: user.name || "My Business",
        description: "Collect stamps and earn rewards!",
        stampGoal: 10,
        stamps: [],
        rewardTitle: "Free Item",
        rewardDescription: "Get a free item after collecting all stamps",
      };
      setEditForm(newCard);
      setIsEditing(true);
    }
  };

  const menuItems = [
    { id: "program", label: "My Card", icon: Gift },
    { id: "members", label: "Members", icon: Users },
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
              Loyalty card
            </p>
            <div className="grid lg:grid-cols-4 gap-8">
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <nav className="space-y-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            activeTab === item.id
                              ? "bg-black text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </motion.aside>

              <div className="lg:col-span-3">
                {activeTab === "program" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-black mb-2">Your Loyalty Card</h2>
                        <p className="text-gray-600">
                          {cardData
                            ? "Manage your card and collect stamps"
                            : "Create your digital loyalty card to start collecting stamps"}
                        </p>
                      </div>
                      {cardData && !isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditForm(cardData);
                            setIsEditing(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>

                    {!cardData && !isEditing && (
                      <div className="text-center py-12">
                        <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-6">
                          You haven't created a loyalty card yet
                        </p>
                        <button
                          type="button"
                          onClick={handleCreateCard}
                          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Create Loyalty Card</span>
                        </button>
                      </div>
                    )}

                    {isEditing && editForm && (
                      <div className="space-y-6 max-w-xl">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Card Name
                          </label>
                          <input
                            type="text"
                            value={editForm.cardName}
                            onChange={(e) =>
                              setEditForm({ ...editForm, cardName: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Name
                          </label>
                          <input
                            type="text"
                            value={editForm.businessName}
                            onChange={(e) =>
                              setEditForm({ ...editForm, businessName: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({ ...editForm, description: e.target.value })
                            }
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stamp Goal
                          </label>
                          <input
                            type="number"
                            min={5}
                            max={20}
                            value={editForm.stampGoal}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                stampGoal: Math.max(5, Math.min(20, parseInt(e.target.value) || 10)),
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Number of stamps needed to earn a reward (5-20)
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reward Title
                          </label>
                          <input
                            type="text"
                            value={editForm.rewardTitle}
                            onChange={(e) =>
                              setEditForm({ ...editForm, rewardTitle: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reward Description
                          </label>
                          <textarea
                            value={editForm.rewardDescription}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                rewardDescription: e.target.value,
                              })
                            }
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={handleSaveCard}
                            className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Card</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {cardData && !isEditing && (
                      <>
                        {shareUrl ? (
                          <div className="mb-8 max-w-xl rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-sm font-semibold text-black mb-1">
                              Share your loyalty program
                            </p>
                            <p className="text-xs text-gray-600 mb-3">
                              Customers open this link to save their card. Stamps
                              are updated from the Members tab.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                              <code className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 break-all flex-1">
                                {shareUrl}
                              </code>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={copyShareLink}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-white"
                                >
                                  {linkCopied ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                  Copy
                                </button>
                                <button
                                  type="button"
                                  onClick={shareNative}
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800"
                                >
                                  <Share2 className="w-4 h-4" />
                                  Share
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                        <div className="flex flex-col items-center">
                          <LoyaltyCard
                            card={cardData}
                            interactive
                            onAddStamp={handleAddStamp}
                            onRemoveStamp={handleRemoveStamp}
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {activeTab === "members" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                  >
                    <h2 className="text-3xl font-bold text-black mb-2">Members</h2>
                    <p className="text-gray-600 mb-6">
                      Everyone who joined via your share link. Add stamps when
                      they make a qualifying visit.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      {shareUrl ? (
                        <code className="text-xs text-gray-600 break-all max-w-md">
                          Enrollment: {shareUrl}
                        </code>
                      ) : null}
                      <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <QrCode className="w-4 h-4" />
                        Share link above (My Card)
                      </span>
                    </div>
                    {customers.length === 0 ? (
                      <p className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-200 rounded-lg">
                        No customers yet. Share your loyalty link from the My
                        Card tab.
                      </p>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50 text-left text-gray-600">
                            <tr>
                              <th className="px-4 py-3 font-medium">Name</th>
                              <th className="px-4 py-3 font-medium">Phone</th>
                              <th className="px-4 py-3 font-medium">Stamps</th>
                              <th className="px-4 py-3 font-medium w-40">
                                Adjust
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {customers.map((c) => (
                              <tr key={c.id}>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {c.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {c.phone ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-900 tabular-nums">
                                  {c.stamps}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => bumpCustomerStamps(c.id, -1)}
                                      className="w-9 h-9 rounded-lg border border-gray-200 hover:bg-gray-50 text-lg leading-none"
                                      aria-label="Remove one stamp"
                                    >
                                      −
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => bumpCustomerStamps(c.id, 1)}
                                      className="w-9 h-9 rounded-lg bg-black text-white hover:bg-gray-800 text-lg leading-none"
                                      aria-label="Add one stamp"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "analytics" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                  >
                    <h2 className="text-3xl font-bold text-black mb-6">Analytics</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Active members</p>
                        <p className="text-3xl font-bold text-black">428</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Stamps this month</p>
                        <p className="text-3xl font-bold text-black">1,902</p>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-2">Rewards redeemed</p>
                        <p className="text-3xl font-bold text-black">74</p>
                      </div>
                    </div>
                    <div className="text-center py-12 text-gray-500 mt-4">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>Detailed loyalty funnels coming soon</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === "settings" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                  >
                    <h2 className="text-3xl font-bold text-black mb-6">Settings</h2>
                    <div className="space-y-4 max-w-lg">
                      <label className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                        <span className="text-gray-800">Double stamps on birthdays</span>
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                      </label>
                      <label className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg">
                        <span className="text-gray-800">Notify members when close to reward</span>
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" defaultChecked />
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
