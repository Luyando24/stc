import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Suspense } from "react";

async function DashboardSidebar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile && ["admin", "warehouse_staff"].includes(profile.role)) {
    redirect("/admin");
  }

  return <DashboardNav profile={profile} />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Suspense fallback={
        <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 bg-slate-50 border-r border-slate-200 z-30 p-4">
          <div className="w-32 h-6 bg-slate-200 rounded animate-pulse mb-8" />
          <div className="space-y-4 flex-1">
            <div className="w-full h-10 bg-slate-200/80 rounded-xl animate-pulse" />
            <div className="w-full h-10 bg-slate-200/80 rounded-xl animate-pulse" />
            <div className="w-full h-10 bg-slate-200/80 rounded-xl animate-pulse" />
            <div className="w-full h-10 bg-slate-200/80 rounded-xl animate-pulse" />
          </div>
        </aside>
      }>
        <DashboardSidebar />
      </Suspense>
      <main className="flex-1 lg:pl-64 min-h-screen pb-24 lg:pb-0 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}

