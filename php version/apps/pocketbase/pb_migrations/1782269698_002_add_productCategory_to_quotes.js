/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("quotes");

  const existing = collection.fields.getByName("productCategory");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("productCategory"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "productCategory",
    required: false,
    values: ["Agricultural Machinery", "Lighting Equipment", "Cars", "Heavy Equipment", "Doors", "Windows", "Tiles", "Ice Cream Machines"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("quotes");
    collection.fields.removeByName("productCategory");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})