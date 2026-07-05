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
        <h1 className="text-2xl font-display font-bold text-white">Customers</h1>
        <p className="text-slate-400 text-sm mt-1">{customers?.length ?? 0} registered customers</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Warehouse Code</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Country</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers?.map((c) => (
                <tr key={c.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white">{c.full_name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-brand-400">{c.warehouse_code}</td>
                  <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">{c.country ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!customers || customers.length === 0) && (
            <div className="text-center py-12 text-slate-400">No customers yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
