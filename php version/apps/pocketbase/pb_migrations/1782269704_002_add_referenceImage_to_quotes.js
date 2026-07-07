/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("quotes");

  const existing = collection.fields.getByName("referenceImage");
  if (existing) {
    if (existing.type === "file") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("referenceImage"); // exists with wrong type, remove first
  }

  collection.fields.add(new FileField({
    name: "referenceImage",
    required: false,
    maxSelect: 1,
    maxSize: 20971520
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("quotes");
    collection.fields.removeByName("referenceImage");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})