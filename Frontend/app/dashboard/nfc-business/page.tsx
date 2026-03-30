"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Edit3,
  BarChart3,
  CreditCard,
  Settings,
  Globe,
  Mail,
  Plus,
  Trash2,
  Link2,
} from "lucide-react";
import {
  defaultNfcProfile,
  getNfcProfile,
  saveNfcProfile,
  type NfcProfileData,
} from "@/contexts/lib/nfcProfile";
import NfcBusinessCardView from "@/components/NfcBusinessCardView";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saveNotice, setSaveNotice] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    title: "",
    company: "",
    phones: user?.phone ? [user.phone] : [""],
    emails: user?.email ? [user.email] : [""],
    website: "",
    about: "",
    bannerImageUrl: "",
    profileImageUrl: "",
    socialLinks: [] as NfcProfileData["socialLinks"],
    profilePicture: null as null,
  });

  useEffect(() => {
    if (!user?.id) return;
    const saved = getNfcProfile(user.id);
    const next =
      saved ??
      defaultNfcProfile({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    setProfileData({
      ...next,
      about: next.about ?? "",
      bannerImageUrl: next.bannerImageUrl ?? "",
      profileImageUrl: next.profileImageUrl ?? "",
      profilePicture: null,
    });
  }, [user?.id, user?.name, user?.email, user?.phone]);

  const previewProfile = (): NfcProfileData => ({
    name: profileData.name,
    title: profileData.title,
    company: profileData.company,
    phones: profileData.phones,
    emails: profileData.emails,
    website: profileData.website,
    socialLinks: profileData.socialLinks,
    about: profileData.about || undefined,
    bannerImageUrl: profileData.bannerImageUrl || undefined,
    profileImageUrl: profileData.profileImageUrl || undefined,
  });

  const handleSaveProfile = () => {
    if (!user?.id) return;
    saveNfcProfile(user.id, previewProfile());
    setSaveNotice(true);
    window.setTimeout(() => setSaveNotice(false), 2500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const readImageFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });

  const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // Keep local demo size reasonable

  const handleProfileImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      console.error("Profile image too large (max 2MB).");
      return;
    }
    const dataUrl = await readImageFileAsDataUrl(file);
    setProfileData((prev) => ({ ...prev, profileImageUrl: dataUrl }));
  };

  const handleBannerImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      console.error("Banner image too large (max 2MB).");
      return;
    }
    const dataUrl = await readImageFileAsDataUrl(file);
    setProfileData((prev) => ({ ...prev, bannerImageUrl: dataUrl }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    setProfileData((prev) => {
      const phones = [...prev.phones];
      phones[index] = value;
      return { ...prev, phones };
    });
  };

  const addPhone = () => {
    setProfileData((prev) => ({ ...prev, phones: [...prev.phones, ""] }));
  };

  const removePhone = (index: number) => {
    setProfileData((prev) => {
      if (prev.phones.length === 1) return prev;
      const phones = prev.phones.filter((_, i) => i !== index);
      return { ...prev, phones };
    });
  };

  const handleEmailChange = (index: number, value: string) => {
    setProfileData((prev) => {
      const emails = [...prev.emails];
      emails[index] = value;
      return { ...prev, emails };
    });
  };

  const addEmail = () => {
    setProfileData((prev) => ({ ...prev, emails: [...prev.emails, ""] }));
  };

  const removeEmail = (index: number) => {
    setProfileData((prev) => {
      if (prev.emails.length === 1) return prev;
      const emails = prev.emails.filter((_, i) => i !== index);
      return { ...prev, emails };
    });
  };

  const handleSocialChange = (
    id: string,
    field: "label" | "url",
    value: string
  ) => {
    setProfileData((prev) => {
      const socialLinks = prev.socialLinks.map((social) =>
        social.id === id ? { ...social, [field]: value } : social
      );
      return { ...prev, socialLinks };
    });
  };

  const addSocial = () => {
    setProfileData((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { id: `social-${Date.now()}`, label: "New link", url: "" },
      ],
    }));
  };

  const removeSocial = (id: string) => {
    setProfileData((prev) => ({
      ...prev,
      socialLinks:
        prev.socialLinks.length === 1
          ? prev.socialLinks
          : prev.socialLinks.filter((social) => social.id !== id),
    }));
  };

  const menuItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "edit", label: "Edit Information", icon: Edit3 },
    { id: "analytics", label: "Analytics / Leads", icon: BarChart3 },
    { id: "preview", label: "Card Preview", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
            NFC Business card
          </p>
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
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

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                >
                  <h2 className="text-3xl font-bold text-black mb-6">My Profile</h2>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-black">{profileData.name}</h3>
                        <p className="text-gray-600">{profileData.title}</p>
                        <p className="text-gray-500">{profileData.company}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Emails
                        </label>
                        <p className="text-gray-900">
                          {profileData.emails.filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Numbers
                        </label>
                        <p className="text-gray-900">
                          {profileData.phones.filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <p className="text-gray-900">{profileData.website}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "edit" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid lg:grid-cols-2 gap-8"
                >
                  {/* Edit Form */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-3xl font-bold text-black mb-6">Edit Information</h2>
                    <form className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Picture
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageFileChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        />
                        {profileData.profileImageUrl ? (
                          <img
                            src={profileData.profileImageUrl}
                            alt="Profile photo preview"
                            className="mt-3 h-20 w-20 rounded-full border border-gray-200 object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={profileData.title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={profileData.company}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        />
                      </div>
                      {/* Phone numbers */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Numbers
                        </label>
                        <div className="space-y-3">
                          {profileData.phones.map((phone, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) =>
                                  handlePhoneChange(index, e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                placeholder="+255 123 456 789"
                              />
                              {profileData.phones.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removePhone(index)}
                                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500"
                                  aria-label="Remove phone"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addPhone}
                            className="inline-flex items-center space-x-2 text-sm text-black font-medium hover:underline"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add phone number</span>
                          </button>
                        </div>
                      </div>

                      {/* Emails */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Addresses
                        </label>
                        <div className="space-y-3">
                          {profileData.emails.map((email, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                  handleEmailChange(index, e.target.value)
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                placeholder="you@example.com"
                              />
                              {profileData.emails.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeEmail(index)}
                                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500"
                                  aria-label="Remove email"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addEmail}
                            className="inline-flex items-center space-x-2 text-sm text-black font-medium hover:underline"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add email address</span>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="url"
                            name="website"
                            value={profileData.website}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          About
                        </label>
                        <textarea
                          name="about"
                          value={profileData.about}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              about: e.target.value,
                            }))
                          }
                          rows={4}
                          placeholder="Short bio (shown on your public card when saved)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-y"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Banner image URL
                        </label>
                        <input
                          type="url"
                          name="bannerImageUrl"
                          value={profileData.bannerImageUrl}
                          onChange={handleInputChange}
                          placeholder="https://…"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        />
                        <div className="mt-3 space-y-2">
                          <label className="block text-xs font-medium text-gray-600">
                            Upload cover (local)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerImageFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          />
                          {profileData.bannerImageUrl ? (
                            <img
                              src={profileData.bannerImageUrl}
                              alt="Cover preview"
                              className="h-24 w-full rounded-lg border border-gray-200 object-cover"
                            />
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile photo URL
                        </label>
                        <input
                          type="url"
                          name="profileImageUrl"
                          value={profileData.profileImageUrl}
                          onChange={handleInputChange}
                          placeholder="https://…"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Social Links
                        </label>
                        <div className="space-y-3">
                          {profileData.socialLinks.map((social) => (
                            <div
                              key={social.id}
                              className="flex items-center space-x-2"
                            >
                              <div className="relative flex-1">
                                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={social.label}
                                  onChange={(e) =>
                                    handleSocialChange(
                                      social.id,
                                      "label",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Label (e.g. LinkedIn)"
                                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none mb-2"
                                />
                                <input
                                  type="url"
                                  value={social.url}
                                  onChange={(e) =>
                                    handleSocialChange(
                                      social.id,
                                      "url",
                                      e.target.value
                                    )
                                  }
                                  placeholder="https://"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                />
                              </div>
                              {profileData.socialLinks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSocial(social.id)}
                                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 self-start"
                                  aria-label="Remove social link"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addSocial}
                            className="inline-flex items-center space-x-2 text-sm text-black font-medium hover:underline"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add social link</span>
                          </button>
                        </div>
                      </div>
                      {saveNotice ? (
                        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                          Profile saved. Your public card link now shows this
                          information.
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                      >
                        Save Changes
                      </button>
                    </form>
                  </div>

                  {/* Live Preview */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                    <h3 className="text-xl font-bold text-black mb-6">Live Preview</h3>
                    <div className="rounded-xl bg-[#f0ebe8] p-4 sm:p-6">
                      <NfcBusinessCardView
                        profile={previewProfile()}
                        fallbackName={user?.name ?? ""}
                        fallbackEmail={user?.email ?? ""}
                        showFooterCta={false}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                >
                  <h2 className="text-3xl font-bold text-black mb-6">Analytics / Leads</h2>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm mb-2">Total Views</p>
                      <p className="text-3xl font-bold text-black">1,234</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm mb-2">Contacts Captured</p>
                      <p className="text-3xl font-bold text-black">456</p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm mb-2">Conversion Rate</p>
                      <p className="text-3xl font-bold text-black">37%</p>
                    </div>
                  </div>
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p>Detailed analytics coming soon</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "preview" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
                >
                  <h2 className="text-3xl font-bold text-black mb-6">Card Preview</h2>
                  <p className="text-sm text-gray-600 mb-6 max-w-lg">
                    This matches what visitors see when they open your digital
                    card. Empty fields are hidden automatically.
                  </p>
                  <div className="flex justify-center rounded-xl bg-[#f0ebe8] p-6">
                    <NfcBusinessCardView
                      profile={previewProfile()}
                      fallbackName={user?.name ?? ""}
                      fallbackEmail={user?.email ?? ""}
                      showFooterCta={false}
                    />
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
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-4">Account Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Change Password
                          </label>
                          <input
                            type="password"
                            placeholder="New password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                          />
                        </div>
                        <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-black mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" defaultChecked />
                          <span className="ml-2 text-gray-700">Email notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" defaultChecked />
                          <span className="ml-2 text-gray-700">SMS notifications</span>
                        </label>
                      </div>
                    </div>
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
