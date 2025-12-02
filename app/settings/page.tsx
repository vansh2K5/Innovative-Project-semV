"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/Aurora";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  SettingsIcon,
  UserIcon,
  LockIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
}

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Profile form
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    position: "",
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setFormData({
        name: userData.name || "",
        department: userData.department || "",
        position: userData.position || "",
      });
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateProfile",
          name: formData.name,
          department: formData.department,
          position: formData.position,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      const updatedUser = { ...user, ...data.user };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSuccessMessage("Profile updated successfully!");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "changePassword",
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccessMessage("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
        <div className="absolute inset-0 z-0 w-full min-w-screen overflow-hidden">
          <Aurora
            colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>

        <div className="relative z-20 min-h-screen p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <ChevronLeftIcon className="text-white" size={24} />
              </button>
              <div className="flex items-center gap-3">
                <SettingsIcon className="text-purple-400" size={32} />
                <h1 className="text-3xl font-bold text-white">Settings</h1>
              </div>
            </div>

            <Card className="bg-black/40 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold transition ${
                    activeTab === "profile"
                      ? "bg-purple-600/30 text-purple-400 border-b-2 border-purple-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <UserIcon size={20} />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold transition ${
                    activeTab === "password"
                      ? "bg-purple-600/30 text-purple-400 border-b-2 border-purple-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <LockIcon size={20} />
                  Password
                </button>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center gap-2">
                    <CheckCircleIcon className="text-green-400" size={20} />
                    <p className="text-green-200">{successMessage}</p>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                    <AlertCircleIcon className="text-red-400" size={20} />
                    <p className="text-red-200">{errorMessage}</p>
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ""}
                        className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900/50 text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-purple-500 outline-none transition"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-purple-500 outline-none transition"
                          placeholder="e.g. Engineering"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Position
                        </label>
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-purple-500 outline-none transition"
                          placeholder="e.g. Senior Developer"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Updating..." : "Save Changes"}
                    </button>
                  </form>
                )}

                {/* Password Tab */}
                {activeTab === "password" && (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-purple-500 outline-none transition"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-purple-500 outline-none transition"
                        placeholder="Enter new password (min 6 characters)"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/10 text-white placeholder:text-white/60 focus:ring-2 focus:ring-purple-500 outline-none transition"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Changing..." : "Change Password"}
                    </button>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SettingsPage;
