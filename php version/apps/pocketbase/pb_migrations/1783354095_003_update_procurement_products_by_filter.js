/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let records;
  try {
    records = app.findRecordsByFilter("procurement_products", "productName='8-Row Seed Planter with 4-Row Fertilizer Applicator'");
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("No records found, skipping");
      return;
    }
    throw e;
  }
  
  for (const record of records) {
    record.set("imageUrls", ["https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/6dc36d463716c24807e3fe9ce01a06cf.jpg", "https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/7c5da4e17da0f9d440c7ca8408b1b742.jpg", "https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/ff7d0e5ed6b9a76deab4024f8e0dc2ce.jpg", "https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/8e937d4e71e19c04ce593178c63e3a86.jpg", "https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/ab0eac30f6cace49b19bd943cc3f57eb.jpg", "https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/5ed1f695f641c73c256440f0d0af8055.jpg"]);
    try {
      app.save(record);
    } catch (e) {
      if (e.message.includes("Value must be unique")) {
        console.log("Record with unique value already exists, skipping");
      } else {
        throw e;
      }
    }
  }
}, (app) => {
  // Rollback: original values not stored, manual restore needed
})
