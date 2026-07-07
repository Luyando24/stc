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

  // Fetch shipments to check if any parcels are part of a delivered shipment
  const { data: shipments } = await supabase
    .from("shipments")
    .select("id, status")
    .eq("customer_id", user.id);

  // Fetch shipment-parcel links
  const { data: links } = await supabase
    .from("shipment_parcels")
    .select("shipment_id, parcel_id");

  // Create a map to quickly look up a parcel's corresponding shipment status
  const parcelShipmentStatusMap = new Map<string, string>();
  if (links && shipments) {
    const shipmentStatusMap = new Map(shipments.map((s) => [s.id, s.status]));
    links.forEach((link) => {
      const status = shipmentStatusMap.get(link.shipment_id);
      if (status) {
        parcelShipmentStatusMap.set(link.parcel_id, status);
      }
    });
  }

  // Override status to "delivered" if the parcel is linked to a delivered shipment
  const mappedParcels = (parcels || []).map((parcel) => {
    const shipmentStatus = parcelShipmentStatusMap.get(parcel.id);
    if (shipmentStatus === "delivered") {
      return {
        ...parcel,
        status: "delivered" as const,
      };
    }
    return parcel;
  });

  return (
    <MyParcelsClient
      parcels={mappedParcels}
      profileCountry={profile?.country || "LUSAKA"}
    />
  );
}
