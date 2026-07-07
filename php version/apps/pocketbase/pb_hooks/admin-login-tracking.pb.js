/// <reference path="../pb_data/types.d.ts" />
onRecordAuthRequest((e) => {
  const adminEmail = e.record.get("email");
  const ipAddress = e.requestInfo.headers.get("x-forwarded-for") || e.requestInfo.headers.get("cf-connecting-ip") || e.requestInfo.remoteIP || "unknown";
  
  const logRecord = new Record($app.findCollectionByNameOrId("admin_activity_logs"));
  logRecord.set("action", "login_success");
  logRecord.set("performedBy", adminEmail);
  logRecord.set("affectedAdmin", adminEmail);
  logRecord.set("ipAddress", ipAddress);
  
  $app.save(logRecord);
  e.next();
}, "admins");