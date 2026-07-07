"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  ShieldCheck,
  Key,
  Send,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  DollarSign,
  Plus,
  Trash2,
  Settings,
  Scale,
  Percent,
  Sliders,
} from "lucide-react";
import { CustomRule } from "@/lib/pricing";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"email" | "pricing">("email");

  // Email settings states
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [testRecipient, setTestRecipient] = useState("");

  // Pricing settings states
  const [airBaseRate, setAirBaseRate] = useState(10.0);
  const [seaBaseRate, setSeaBaseRate] = useState(250.0);
  const [airVolumetricDivisor, setAirVolumetricDivisor] = useState(5000);
  const [valuationFeeRate, setValuationFeeRate] = useState(0.015);
  const [minCharge, setMinCharge] = useState(15.0);
  const [cnyToUsdRate, setCnyToUsdRate] = useState(0.14);
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);

  // New custom rule fields
  const [newDesc, setNewDesc] = useState("");
  const [newField, setNewField] = useState<CustomRule["conditionField"]>("weight_kg");
  const [newOp, setNewOp] = useState<CustomRule["conditionOperator"]>("gt");
  const [newVal, setNewVal] = useState("");
  const [newActType, setNewActType] = useState<CustomRule["actionType"]>("add_fee");
  const [newActVal, setNewActVal] = useState(0);

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
      // Fetch email settings
      const emailRes = await fetch("/api/admin/settings/email");
      if (emailRes.ok) {
        const emailData = await emailRes.json();
        setApiKey(emailData.resend_api_key || "");
        setFromEmail(emailData.resend_from_email || "");
      }

      // Fetch pricing settings
      const pricingRes = await fetch("/api/admin/settings/pricing");
      if (pricingRes.ok) {
        const pricingData = await pricingRes.json();
        setAirBaseRate(pricingData.pricing_air_base_rate);
        setSeaBaseRate(pricingData.pricing_sea_base_rate);
        setAirVolumetricDivisor(pricingData.pricing_air_volumetric_divisor);
        setValuationFeeRate(pricingData.pricing_valuation_fee_rate);
        setMinCharge(pricingData.pricing_min_charge);
        setCnyToUsdRate(pricingData.pricing_cny_to_usd_rate);
        setCustomRules(pricingData.pricing_custom_rules || []);
      }
    } catch (err) {
      console.error("Error loading configurations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEmail(e: React.FormEvent) {
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

  async function handleSavePricing(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/admin/settings/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricing_air_base_rate: airBaseRate,
          pricing_sea_base_rate: seaBaseRate,
          pricing_air_volumetric_divisor: airVolumetricDivisor,
          pricing_valuation_fee_rate: valuationFeeRate,
          pricing_min_charge: minCharge,
          pricing_cny_to_usd_rate: cnyToUsdRate,
          pricing_custom_rules: customRules,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveStatus({ success: true, message: data.message });
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
          }
        }
        setTestStatus({ success: false, message: errMsg });
      }
    } catch (err) {
      setTestStatus({ success: false, message: "An unexpected error occurred." });
    } finally {
      setTesting(false);
    }
  }

  function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    if (!newDesc.trim() || !newVal.trim()) return;

    const rule: CustomRule = {
      id: Math.random().toString(36).substr(2, 9),
      description: newDesc,
      conditionField: newField,
      conditionOperator: newOp,
      conditionValue: newVal,
      actionType: newActType,
      actionValue: newActVal,
    };

    setCustomRules([...customRules, rule]);
    setNewDesc("");
    setNewVal("");
    setNewActVal(0);
  }

  function handleDeleteRule(id: string) {
    setCustomRules(customRules.filter((r) => r.id !== id));
  }

  const isKeyPlaceholder = apiKey === "your_resend_api_key";
  const isFromEmailPlaceholder = fromEmail === "notifications@stclogistics.com";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-slate-500 text-sm">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">System Settings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure system integrations and shipping cost calculation rules.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("email");
            setSaveStatus(null);
          }}
          className={`py-3 px-6 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "email"
              ? "border-brand-650 text-brand-650 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Configuration
        </button>
        <button
          onClick={() => {
            setActiveTab("pricing");
            setSaveStatus(null);
          }}
          className={`py-3 px-6 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "pricing"
              ? "border-brand-650 text-brand-650 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Pricing Rules Engine
        </button>
      </div>

      {/* Save Status Banner */}
      {saveStatus && (
        <div
          className={`p-4 border rounded-xl flex gap-3 text-sm ${
            saveStatus.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {saveStatus.success ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <p className="font-semibold">{saveStatus.message}</p>
        </div>
      )}

      {activeTab === "email" ? (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6 bg-white shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-600" />
                Resend Integration
              </h2>

              <form onSubmit={handleSaveEmail} className="space-y-5">
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
                    Obtain your API Key from your{" "}
                    <a
                      href="https://resend.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      Resend Dashboard
                    </a>
                    . Only admins have access to view or modify this credential.
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

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-xl cursor-pointer"
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
            <div className="card p-6 bg-white border border-slate-200 shadow-sm">
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
                  className="w-full btn bg-slate-800 hover:bg-slate-900 text-white text-xs py-2 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
      ) : (
        <form onSubmit={handleSavePricing} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Standard Rates Config */}
            <div className="md:col-span-2 space-y-6">
              <div className="card p-6 bg-white shadow-sm border border-slate-200 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-brand-600" />
                  Base Shipping Rates
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Air Freight Rate */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Air Freight Rate (USD/kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={airBaseRate}
                      onChange={(e) => setAirBaseRate(parseFloat(e.target.value))}
                      className="input text-sm w-full"
                      required
                    />
                  </div>

                  {/* Sea Freight Rate */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Sea Freight Rate (USD/CBM)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={seaBaseRate}
                      onChange={(e) => setSeaBaseRate(parseFloat(e.target.value))}
                      className="input text-sm w-full"
                      required
                    />
                  </div>

                  {/* Volumetric divisor */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      Air Volumetric Divisor
                    </label>
                    <input
                      type="number"
                      value={airVolumetricDivisor}
                      onChange={(e) => setAirVolumetricDivisor(parseInt(e.target.value))}
                      className="input text-sm w-full"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Usually 5000. Divides (L * W * H) in cm to compute volumetric weight.
                    </p>
                  </div>

                  {/* Valuation Surcharge */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                      Valuation Fee Surcharge (%)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={valuationFeeRate * 100}
                      onChange={(e) => setValuationFeeRate(parseFloat(e.target.value) / 100)}
                      className="input text-sm w-full"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      E.g. 1.5% is applied to the converted USD value of the parcel.
                    </p>
                  </div>

                  {/* Minimum Charge */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Minimum Shipping Charge (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={minCharge}
                      onChange={(e) => setMinCharge(parseFloat(e.target.value))}
                      className="input text-sm w-full"
                      required
                    />
                  </div>

                  {/* Exchange rate */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Exchange Rate (CNY to USD)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={cnyToUsdRate}
                      onChange={(e) => setCnyToUsdRate(parseFloat(e.target.value))}
                      className="input text-sm w-full"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Used to convert CNY parcel values to USD.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Rules Config */}
              <div className="card p-6 bg-white shadow-sm border border-slate-200 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-brand-600" />
                  Custom Pricing Rules
                </h2>

                {/* List rules */}
                <div className="space-y-3">
                  {customRules.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No custom rules configured. Standard rates will apply.</p>
                  ) : (
                    customRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center gap-4 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-800">{rule.description}</p>
                          <p className="text-xs text-slate-500">
                            Condition: <span className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">{rule.conditionField}</span>{" "}
                            {rule.conditionOperator} <span className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">"{rule.conditionValue}"</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            Action: <span className="font-semibold text-brand-650">{rule.actionType}</span> by{" "}
                            <span className="font-bold">{rule.actionValue}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* Add Rule Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Add Custom Pricing Rule</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                        Rule Description
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. Discount for large volumes from supplier X"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="input text-xs w-full bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                        If Field
                      </label>
                      <select
                        value={newField}
                        onChange={(e) => setNewField(e.target.value as any)}
                        className="input text-xs w-full bg-white"
                      >
                        <option value="weight_kg">Weight (kg)</option>
                        <option value="volume_cbm">Volume (CBM)</option>
                        <option value="declared_value">Declared Value (¥)</option>
                        <option value="shipping_mode">Shipping Mode (air/sea)</option>
                        <option value="supplier_name">Supplier Name</option>
                        <option value="item_description">Item Description</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                        Operator
                      </label>
                      <select
                        value={newOp}
                        onChange={(e) => setNewOp(e.target.value as any)}
                        className="input text-xs w-full bg-white"
                      >
                        <option value="gt">Is Greater Than (&gt;)</option>
                        <option value="lt">Is Less Than (&lt;)</option>
                        <option value="eq">Equals (=)</option>
                        <option value="contains">Contains (text search)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                        Compared Value
                      </label>
                      <input
                        type="text"
                        placeholder="E.g. 20, sea, or supplier_name"
                        value={newVal}
                        onChange={(e) => setNewVal(e.target.value)}
                        className="input text-xs w-full bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                        Then Action
                      </label>
                      <select
                        value={newActType}
                        onChange={(e) => setNewActType(e.target.value as any)}
                        className="input text-xs w-full bg-white"
                      >
                        <option value="add_fee">Add Flat Fee (USD)</option>
                        <option value="multiply_total">Multiply Final Cost (Multiplier)</option>
                        <option value="multiply_rate">Multiply Base Rate (Multiplier)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                        Action Value
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="E.g. 10.0 or 0.9"
                        value={newActVal}
                        onChange={(e) => setNewActVal(parseFloat(e.target.value))}
                        className="input text-xs w-full bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="w-full btn btn-primary flex items-center justify-center gap-1.5 text-xs py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Rule
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div className="card p-6 bg-slate-50 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  Cost Parameters
                </h3>
                <div className="text-xs text-slate-650 space-y-2.5 leading-relaxed">
                  <p>
                    <strong>Air Freight:</strong> Uses the maximum between actual weight (kg) and volumetric weight (L*W*H / Volumetric Divisor).
                  </p>
                  <p>
                    <strong>Sea Freight:</strong> Rates apply directly to the volume of the parcel in cubic meters (L*W*H / 1,000,000).
                  </p>
                  <p>
                    <strong>Valuation Fee Surcharge:</strong> Multiplies the converted USD declared value by the surcharge percentage to cover processing/handling.
                  </p>
                  <p>
                    <strong>Exchange Rate:</strong> Used to translate supplier invoice declarations (usually in CNY / ¥) into USD before calculating fees.
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full btn btn-primary flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl cursor-pointer font-semibold shadow-sm text-sm"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Rates...
                    </>
                  ) : (
                    "Save Pricing Config"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
