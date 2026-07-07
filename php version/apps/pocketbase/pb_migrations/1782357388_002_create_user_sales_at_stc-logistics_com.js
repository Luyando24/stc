/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");
  const record = new Record(collection);
  record.id = "u2jnk465uxxkp9d";
  record.set("email", "sales@stc-logistics.com");
  record.setPassword("Stc123145610@");
  record.set("fullName", "Super Admin");
  record.set("phone", "+1234567890");
  record.set("department", "Agricultural Machinery");
  record.set("status", "active");
  record.set("approvedBy", "system");
  record.set("approvedAt", "2026-06-25");
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
    const record = app.findRecordById("admins", "u2jnk465uxxkp9d");
    return app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Auth record not found, skipping rollback");
      return;
    }
    throw e;
  }
})