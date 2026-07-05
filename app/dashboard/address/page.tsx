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
  const address = "广州市越秀区环市西路202号之三美博运动城902";
  const phone = "+86 13434313227";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-brand-600" />
          China Warehouse Address
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Use these shipping details when ordering from suppliers or online stores in China.
        </p>
      </div>

      {/* Main Address Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Code & Consignee */}
          <div className="md:col-span-1 space-y-6">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Your Delivery Code
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-3xl font-mono font-bold text-brand-400 tracking-wider">
                  {code}
                </span>
                <CopyButton text={code} label="Copy" />
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Consignee / Receiver Name
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-sm font-semibold text-slate-200">
                  STC / {code}
                </span>
                <CopyButton text={`STC / ${code}`} label="Copy" />
              </div>
            </div>
          </div>

          {/* Right Column: Address Details */}
          <div className="md:col-span-2 space-y-6 md:border-l md:border-slate-800 md:pl-8">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Warehouse Address (Chinese)
              </p>
              <p className="text-slate-200 mt-2 text-sm font-medium leading-relaxed font-sans">
                {address} <span className="text-brand-400 font-mono font-bold">({code})</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={`${address} (${code})`} label="Copy Full Address" />
                <CopyButton text={address} label="Copy Address Only" />
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                Warehouse Phone Number
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-sm font-mono text-slate-200">
                  {phone}
                </span>
                <CopyButton text={phone} label="Copy Phone" />
              </div>
            </div>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="mt-8 border-t border-slate-800 pt-6 flex items-start gap-3 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200 font-medium">Important:</strong> You must include your delivery code <span className="font-mono text-brand-400 font-bold">{code}</span> in the shipping address and consignee name. Without it, our warehouse staff cannot identify your packages and they may be delayed or lost.
          </p>
        </div>
      </div>

      {/* Supplier Guide Card */}
      <div className="card p-6 space-y-6">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          How to fill this on Chinese Shopping Apps (Taobao, 1688, JD)
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm border border-brand-100">
              1
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Consignee (收货人)</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Enter <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">STC / {code}</code> as the receiver name. Do not just write "STC".
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm border border-brand-100">
              2
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Mobile Phone (手机号码)</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Set the phone number to <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">{phone}</code>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm border border-brand-100">
              3
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Detailed Address (详细地址)</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Select <strong className="text-slate-800 font-medium">广东省 广州市 越秀区 流花街道</strong>, then paste <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">环市西路202号之三美博运动城902 ({code})</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
