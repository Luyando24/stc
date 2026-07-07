"use client";

import { useState, useEffect } from "react";
import { Mail, ShieldCheck, Key, Send, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export default function EmailSettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [testRecipient, setTestRecipient] = useState("");
  
  // Loading & status states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings/email");
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.resend_api_key || "");
        setFromEmail(data.resend_from_email || "");
      }
    } catch (err) {
      console.error("Error loading email settings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          resend_api_key: apiKey,
          resend_from_email: fromEmail,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveStatus({ success: true, message: data.message });
        // Reload settings to get updated mask
        fetchSettings();
      } else {
        setSaveStatus({ success: false, message: data.error || "Failed to save settings" });
      }
    } catch (err) {
      setSaveStatus({ success: false, message: "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!testRecipient) return;
    setTesting(true);
    setTestStatus(null);

    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          test_recipient: testRecipient,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestStatus({ success: true, message: data.message });
      } else {
        let errMsg = data.error || "Failed to send test email";
        if (data.details && typeof data.details === "object") {
          if (data.details.message) {
            errMsg = `${errMsg}: ${data.details.message}`;
          } else if (typeof data.details === "string") {
            errMsg = `${errMsg}: ${data.details}`;
          }
        } else if (data.details && typeof data.details === "string") {
          errMsg = `${errMsg}: ${data.details}`;
        }
        setTestStatus({ success: false, message: errMsg });
      }
    } catch (err) {
      setTestStatus({ success: false, message: "An unexpected error occurred." });
    } finally {
      setTesting(false);
    }
  }

  const isKeyPlaceholder = apiKey === "your_resend_api_key";
  const isFromEmailPlaceholder = fromEmail === "notifications@stclogistics.com";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-slate-500 text-sm">Loading email configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Email Configuration</h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure Resend integration to power automatic parcel arrival and shipment updates.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6 bg-white shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-brand-600" />
              Resend Integration
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Resend API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="re_..."
                  className="input font-mono text-sm w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Obtain your API Key from your <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Resend Dashboard</a>. Only admins have access to view or modify this credential.
                </p>
              </div>

              {/* From Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  From Email Address
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="notifications@stclogistics.com"
                  className="input text-sm w-full"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  This address must be domain-verified in your Resend account.
                </p>
              </div>

              {/* Warnings / Alerts */}
              {(isKeyPlaceholder || isFromEmailPlaceholder) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Placeholder Credentials Active</p>
                    <p className="mt-0.5 text-amber-700">
                      Email notifications will be skipped until you save a valid Resend API Key.
                    </p>
                  </div>
                </div>
              )}

              {/* Save Status */}
              {saveStatus && (
                <div
                  className={`p-3 border rounded-xl flex gap-3 text-xs ${
                    saveStatus.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {saveStatus.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="font-medium">{saveStatus.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Test Email Sidebar Card */}
        <div className="space-y-6">
          <div className="card p-6 bg-slate-50 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-slate-500" />
              Test Email Delivery
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Send a test message using your active Resend settings to verify end-to-end delivery.
            </p>

            <form onSubmit={handleTestEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="test@example.com"
                  className="input text-xs w-full bg-white"
                  required
                />
              </div>

              {testStatus && (
                <div
                  className={`p-3 border rounded-xl flex gap-2 text-xs ${
                    testStatus.success
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <p className="font-medium">{testStatus.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={testing || isKeyPlaceholder}
                className="w-full btn bg-slate-800 hover:bg-slate-900 text-white text-xs py-2 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Test Email
                  </>
                )}
              </button>
              {isKeyPlaceholder && (
                <p className="text-[10px] text-center text-slate-500">
                  Save a valid API Key first to enable testing.
                </p>
              )}
            </form>
          </div>

          {/* Secure Storage Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex gap-3 text-blue-900 text-xs">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Security & Access</p>
              <p className="mt-1 leading-relaxed text-blue-800">
                Credentials are saved securely in our database and can only be queried or modified by Admin roles. Standard customers and warehouse staff are blocked by Row Level Security (RLS) policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
