/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const records = app.findRecordsByFilter("procurement_products", "productName='8-Row Seed Planter with 4-Row Fertilizer Applicator' && (category != 'Agricultural Machinery' || price != 385 || status != 'active' || productImage = '')");
  for (const record of records) {
    app.delete(record);
  }
}, (app) => {
  // Rollback: record data not stored, manual restore needed
})
