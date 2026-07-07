/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const records = app.findRecordsByFilter("admins", "email='sales@stc-logistics.com'");
  for (const record of records) {
    app.delete(record);
  }
}, (app) => {
  // Rollback: record data not stored, manual restore needed
})