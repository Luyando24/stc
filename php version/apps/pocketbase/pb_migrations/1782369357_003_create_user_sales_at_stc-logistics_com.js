/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");
  const record = new Record(collection);
  record.id = "9xgq5jd1uqx4u6f";
  record.set("email", "sales@stc-logistics.com");
  record.setPassword("Admin@123456");
  record.set("fullName", "STC Admin");
  record.set("phone", "0000000000");
  record.set("department", "Agricultural Machinery");
  record.set("status", "active");
  record.set("verified", true);
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
    const record = app.findRecordById("admins", "9xgq5jd1uqx4u6f");
    return app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Auth record not found, skipping rollback");
      return;
    }
    throw e;
  }
})