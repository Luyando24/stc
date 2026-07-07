/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  const record = new Record(collection);
  record.id = "j5en37jzdeh9u4t";
  record.set("email", "system@stclogistics.local");
  record.setPassword("SystemAdmin@2024");
  record.set("name", "System Admin");
  record.set("company_name", "STC Logistics - System Account");
  record.set("phone", "N/A");
  try {
    return app.save(record);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const record = app.findRecordById("users", "j5en37jzdeh9u4t");
    return app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Auth record not found, skipping rollback");
      return;
    }
    throw e;
  }
})