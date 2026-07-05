import { createClient } from "@/lib/supabase/server";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("profiles")
    .select("*, parcels(count), shipments(count)")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-900">Customers</h1>
        <p className="text-slate-500 text-sm mt-1">{customers?.length ?? 0} registered customers</p>
      </div>

      {/* Mobile view: list of cards */}
      <div className="space-y-3 sm:hidden">
        {customers?.map((c) => (
          <div key={c.id} className="card p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  {c.full_name ?? "—"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {c.country ?? "No country specified"}
                </p>
              </div>
              <span className="font-mono text-xs text-brand-600 font-bold bg-brand-50 border border-brand-150 px-2.5 py-1 rounded-lg">
                {c.warehouse_code}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-xs text-slate-400">
              <span>Joined</span>
              <span>{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {(!customers || customers.length === 0) && (
          <div className="card p-8 text-center text-slate-500 text-sm">No customers yet.</div>
        )}
      </div>

      {/* Desktop view: Table */}
      <div className="hidden sm:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Warehouse Code</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium hidden sm:table-cell">Country</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers?.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 font-medium">{c.full_name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-brand-600 font-semibold">{c.warehouse_code}</td>
                  <td className="px-4 py-3 text-slate-700 hidden sm:table-cell">{c.country ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!customers || customers.length === 0) && (
            <div className="text-center py-12 text-slate-500">No customers yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
