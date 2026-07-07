/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("procurement_products");

  const record0 = new Record(collection);
    record0.id = "ws20f083taadwgg";
    record0.set("productName", "8-Row Seed Planter with 4-Row Fertilizer Applicator");
    record0.set("category", "Agricultural Machinery");
    record0.set("description", "Professional-grade 8-row seed planter combined with 4-row fertilizer applicator for large-scale farming operations");
    record0.set("price", 385.0);
    record0.set("status", "active");
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
  const seededRecordIds = ["ws20f083taadwgg"];
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
