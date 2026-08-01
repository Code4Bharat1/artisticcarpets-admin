"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, RefreshCw, Save, CheckCircle, XCircle } from "lucide-react";

export default function InstagramSettingsPage() {
  const [settings, setSettings] = useState({
    businessId: "",
    accessToken: "",
    lastSyncTime: null,
    connectionStatus: "DISCONNECTED",
    importedPostsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${baseUrl}/instagram/admin/settings`, { withCredentials: true });
      if (res.data.success && res.data.data) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setMessage({ type: "error", text: "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.put(`${baseUrl}/instagram/admin/settings`, {
        businessId: settings.businessId,
        accessToken: settings.accessToken,
      }, { withCredentials: true });

      if (res.data.success) {
        setSettings(res.data.data);
        setMessage({ type: "success", text: "Settings saved successfully." });
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setMessage(null);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.post(`${baseUrl}/instagram/admin/sync`, {}, { withCredentials: true });

      if (res.data.success) {
        setMessage({ 
          type: "success", 
          text: `Sync completed! New: ${res.data.newCount}, Updated: ${res.data.updateCount}`
        });
        fetchSettings(); // Refresh stats
      } else {
         setMessage({ type: "error", text: res.data.message || "Sync failed." });
      }
    } catch (err) {
      console.error("Failed to sync:", err);
      setMessage({ type: "error", text: err.response?.data?.message || "Sync failed." });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Instagram Settings</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Settings Form */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-100">
             <h2 className="font-semibold text-gray-700">API Credentials</h2>
          </div>
          <form onSubmit={handleSave} className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Business ID
              </label>
              <input
                type="text"
                value={settings.businessId || ""}
                onChange={(e) => setSettings({...settings, businessId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. 17841400000000000"
              />
              <p className="text-xs text-gray-500 mt-1">This ID is tied to your Meta Developer account.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Long-Lived Access Token
              </label>
              <input
                type="password"
                value={settings.accessToken || ""}
                onChange={(e) => setSettings({...settings, accessToken: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Paste token here"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </form>
        </div>

        {/* Status Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="bg-gray-50 p-4 border-b border-gray-100">
             <h2 className="font-semibold text-gray-700">Sync Status</h2>
          </div>
          <div className="p-6">
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  settings.connectionStatus === 'CONNECTED' ? 'bg-green-500' : 
                  settings.connectionStatus === 'ERROR' ? 'bg-red-500' : 'bg-gray-400'
                }`}></span>
                <span className="font-medium">{settings.connectionStatus}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Imported Posts</p>
              <p className="font-medium text-xl">{settings.importedPostsCount}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Last Sync</p>
              <p className="font-medium text-sm">{formatDate(settings.lastSyncTime)}</p>
            </div>

            <button
              onClick={handleSync}
              disabled={syncing || !settings.businessId || !settings.accessToken}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sync Now
            </button>
            {(!settings.businessId || !settings.accessToken) && (
              <p className="text-xs text-red-500 mt-2 text-center">Save credentials first</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
