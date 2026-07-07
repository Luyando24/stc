import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MyParcelsClient from "./MyParcelsClient";

export default async function ParcelsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch customer profile to get their receiver/destination country
  const { data: profile } = await supabase
    .from("profiles")
    .select("country")
    .eq("id", user.id)
    .single();

  // Fetch all parcels registered to this customer
  const { data: parcels } = await supabase
    .from("parcels")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <MyParcelsClient
      parcels={parcels || []}
      profileCountry={profile?.country || "LUSAKA"}
    />
  );
}
