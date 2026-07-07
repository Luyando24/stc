/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("quotes");
  const field = collection.fields.getByName("quantity");
  field.min = 1;
  field.required = true;
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("quotes");
  const field = collection.fields.getByName("quantity");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.min = 1;
  field.required = true;
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})