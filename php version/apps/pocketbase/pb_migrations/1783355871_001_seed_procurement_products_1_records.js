/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("procurement_products");

  const record0 = new Record(collection);
    record0.id = "e25k2n0y7xd5oyk";
    record0.set("productName", "8-Row Seed Planter with 4-Row Fertilizer Applicator");
    record0.set("category", "Agricultural Machinery");
    record0.set("price", 38500);
    record0.set("status", "active");
    record0.set("description", "Professional-grade 8-row seed planter combined with 4-row fertilizer applicator for large-scale farming operations");
    record0.set("specifications", "8 rows, adjustable depth, precision seeding, 4-row fertilizer applicator");
    record0.set("imageUrls", "{'urls': ['https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/1130478a0d0a496992f8059e157dd836.png']}");
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
  const seededRecordIds = ["e25k2n0y7xd5oyk"];
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
