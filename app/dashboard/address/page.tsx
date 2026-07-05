import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { MapPin, Phone, User, HelpCircle, AlertCircle } from "lucide-react";

export default async function WarehouseAddressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const code = profile?.warehouse_code ?? "—";
  const address = "广东省广州市越秀区环市西路202号之三美博运动城902";
  const phone = "+86 13434313227";
  const consignee = `STC / ${code}`;

  const fullShippingBlock = `收货人 (Consignee): ${consignee}\n电话 (Phone): ${phone}\n收货地址 (Address): ${address} (${code})`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-brand-600" />
          China Warehouse Address
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Provide these details to your suppliers in China when shipping packages to our warehouse.
        </p>
      </div>

      {/* Main Address Card: Premium Light Minimalist Layout */}
      <div className="card p-6 sm:p-8 bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-2xl relative overflow-hidden">
        {/* Subtle Decorative Circle */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-50 rounded-full blur-2xl -z-10" />

        <div className="space-y-6">
          {/* Field Grid */}
          <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            {/* Delivery Code */}
            <div className="space-y-1">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Your Delivery Code
              </p>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5">
                <span className="text-xl font-mono font-bold text-brand-600 tracking-wider">
                  {code}
                </span>
                <CopyButton text={code} label="Copy" variant="inline" />
              </div>
            </div>

            {/* Consignee */}
            <div className="space-y-1">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-slate-450" /> Consignee Name (收货人)
              </p>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5">
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {consignee}
                </span>
                <CopyButton text={consignee} label="Copy" variant="inline" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Phone */}
            <div className="space-y-1">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-450" /> Phone Number (电话号码)
              </p>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5">
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {phone}
                </span>
                <CopyButton text={phone} label="Copy" variant="inline" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-450" /> Detailed Address (收货地址)
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-slate-150 rounded-xl px-4 py-3 gap-3">
                <p className="text-sm font-medium text-slate-800 leading-relaxed font-sans flex-1">
                  {address} <span className="text-brand-600 font-mono font-bold">({code})</span>
                </p>
                <div className="shrink-0 flex gap-2">
                  <CopyButton text={`${address} (${code})`} label="Copy Full Address" variant="inline" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copy All Button Container */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-slate-450 text-xs flex items-start gap-1.5 max-w-md">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Always ensure your unique delivery code <strong className="text-slate-700 font-semibold font-mono">{code}</strong> is appended to both the address line and consignee name.
            </span>
          </p>

          <CopyButton text={fullShippingBlock} label="Copy Full Shipping Card" />
        </div>
      </div>

      {/* Supplier Guide Card */}
      <div className="card p-6 space-y-6">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          Quick Chinese Translation Guide
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm border border-brand-100">
              1
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Consignee (收货人)</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Receiver name: <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono">STC / {code}</code>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm border border-brand-100">
              2
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Mobile Phone (手机号码)</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Warehouse contact: <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono">{phone}</code>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm border border-brand-100">
              3
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Detailed Address (详细地址)</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans">
              Address fields: <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono">广东省 广州市 越秀区 流花街道</code>, detailed address: <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono">环市西路202号之三美博运动城902 ({code})</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
