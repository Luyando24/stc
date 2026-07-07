/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");
  const record = new Record(collection);
  record.id = "cdw7yavua5dzzxj";
  record.set("email", "sales@stc-logistics.com");
  record.setPassword("Admin@123456");
  record.set("fullName", "Admin User");
  record.set("phone", "");
  record.set("department", "Administration");
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
    const record = app.findRecordById("admins", "cdw7yavua5dzzxj");
    return app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Auth record not found, skipping rollback");
      return;
    }
    throw e;
  }
})