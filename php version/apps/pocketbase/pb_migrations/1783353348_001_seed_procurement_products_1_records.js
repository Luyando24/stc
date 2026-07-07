/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("procurement_products");

  const record0 = new Record(collection);
    record0.id = "hcct39c5e5jgrc0";
    record0.set("productName", "8-Row Seed Planter with 4-Row Fertilizer Applicator");
    record0.set("category", "Agricultural Machinery");
    record0.set("description", "Professional-grade 8-row seed planter combined with 4-row fertilizer applicator. Designed for efficient large-scale farming operations. Features precision seed placement and synchronized fertilizer distribution for optimal crop yields.");
    record0.set("price", 385.0);
    record0.set("specifications", "Model: 2BSF-8A/8B | Working Width: 1600x1100x900mm | Seeding Depth: 20-105mm | Capacity: 75kg | Row Spacing: 150-250mm | Efficiency: 4-6 rows/hour | 8-row seed placement with synchronized 4-row fertilizer distribution");
    record0.set("status", "active");
    record0.set("displayOrder", 1);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  const seededRecordIds = ["hcct39c5e5jgrc0"];
  for (const seededRecordId of seededRecordIds) {
    try {
      app.delete(app.findRecordById("procurement_products", seededRecordId));
    } catch (error) {
      if (error.message.includes("no rows in result set")) {
        continue;
      }
      throw error;
    }
  }
})
