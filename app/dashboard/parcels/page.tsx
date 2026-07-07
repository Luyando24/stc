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
    .select("id, status, stc_tracking_number")
    .eq("customer_id", user.id);

  // Fetch shipment-parcel links
  const { data: links } = await supabase
    .from("shipment_parcels")
    .select("shipment_id, parcel_id");

  // Create a map to quickly look up a parcel's corresponding shipment status, id and tracking number
  const parcelShipmentMap = new Map<string, { status: string; shipment_id: string; stc_tracking_number: string }>();
  if (links && shipments) {
    const shipmentMap = new Map(
      shipments.map((s) => [
        s.id,
        { status: s.status, shipment_id: s.id, stc_tracking_number: s.stc_tracking_number },
      ])
    );
    links.forEach((link) => {
      const sInfo = shipmentMap.get(link.shipment_id);
      if (sInfo) {
        parcelShipmentMap.set(link.parcel_id, sInfo);
      }
    });
  }

  // Fetch customer's receiver addresses
  const { data: receiverAddresses } = await supabase
    .from("receiver_addresses")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch pricing settings and calculate costs
  const { getPricingSettings } = require("@/lib/pricing-server");
  const { calculateShippingCost } = require("@/lib/pricing");
  const pricingSettings = await getPricingSettings();

  // Override status to "delivered" if the parcel is linked to a delivered shipment, and add international tracking number + shipment ID
  const mappedParcels = (parcels || []).map((parcel) => {
    const sInfo = parcelShipmentMap.get(parcel.id);
    const pricing = calculateShippingCost(
      {
        weight_kg: parcel.weight_kg,
        dimensions: parcel.dimensions,
        shipping_mode: parcel.shipping_mode,
        declared_value: parcel.declared_value,
        supplier_name: parcel.supplier_name,
        item_description: parcel.item_description,
      },
      pricingSettings
    );

    return {
      ...parcel,
      status: sInfo?.status === "delivered" ? ("delivered" as const) : parcel.status,
      stc_tracking_number: sInfo?.stc_tracking_number || null,
      shipment_id: sInfo?.shipment_id || null,
      estimated_shipping_cost: (parcel.weight_kg || parcel.dimensions) ? pricing.finalPriceUsd : null,
      pricing_details: pricing,
    };
  });

  return (
    <MyParcelsClient
      parcels={mappedParcels}
      profileCountry={profile?.country || "LUSAKA"}
      receiverAddresses={receiverAddresses || []}
      pricingSettings={pricingSettings}
    />
  );
}
