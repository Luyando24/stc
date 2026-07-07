/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let collection = new Collection({
        type: "auth",
        name: "admins",
        listRule: "@request.auth.email = \"sales@stc-logistics.com\"",
        viewRule: "@request.auth.email = email || @request.auth.email = \"sales@stc-logistics.com\"",
        createRule: "",
        updateRule: "@request.auth.email = \"sales@stc-logistics.com\"",
        deleteRule: "@request.auth.email = \"sales@stc-logistics.com\"",
        authRule: "",
        fields: [
        {
                "hidden": false,
                "id": "text9716250286",
                "name": "fullName",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
        },
        {
                "hidden": false,
                "id": "text1702373893",
                "name": "phone",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
        },
        {
                "hidden": false,
                "id": "select7100041097",
                "name": "department",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                        "Agricultural Machinery",
                        "Lighting Equipment",
                        "Cars",
                        "Heavy Equipment",
                        "Doors",
                        "Windows",
                        "Tiles",
                        "Ice Cream Machines"
                ]
        },
        {
                "hidden": false,
                "id": "select4295236610",
                "name": "status",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                        "pending",
                        "active",
                        "deactivated",
                        "denied"
                ]
        },
        {
                "hidden": false,
                "id": "text6151286757",
                "name": "approvedBy",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
        },
        {
                "hidden": false,
                "id": "date6787656372",
                "name": "approvedAt",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "date",
                "max": "",
                "min": ""
        },
        {
                "hidden": false,
                "id": "text2873992837",
                "name": "denialReason",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
        }
],
        authAlert: { enabled: false },
    })

    try {
        app.save(collection)
    } catch (e) {
        if (e.message.includes("Collection name must be unique")) {
            console.log("Collection already exists, skipping")
            return
        }
        throw e
    }
}, (app) => {
    try {
        let collection = app.findCollectionByNameOrId("admins")
        app.delete(collection)
    } catch (e) {
        if (e.message.includes("no rows in result set")) {
            console.log("Collection not found, skipping revert");
            return;
        }
        throw e;
    }
})