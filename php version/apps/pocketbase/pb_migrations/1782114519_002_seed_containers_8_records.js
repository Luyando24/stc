/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("containers");

  const record0 = new Record(collection);
    record0.set("container_number", "MAEU1234567");
    record0.set("shipping_line", "MAERSK");
    record0.set("current_status", "In_Transit");
    record0.set("current_location", "Singapore Strait");
    record0.set("vessel_name", "Maersk Seatrade");
    record0.set("estimated_delivery", "2024-02-15");
    record0.set("origin_port", "Shanghai");
    record0.set("destination_port", "Rotterdam");
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("container_number", "MAEU7654321");
    record1.set("shipping_line", "MAERSK");
    record1.set("current_status", "Port_of_Discharge");
    record1.set("current_location", "Port of Rotterdam");
    record1.set("vessel_name", "Maersk Essayons");
    record1.set("estimated_delivery", "2024-02-10");
    record1.set("origin_port", "Singapore");
    record1.set("destination_port", "Hamburg");
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("container_number", "CMAU9876543");
    record2.set("shipping_line", "CMA_CGM");
    record2.set("current_status", "In_Transit");
    record2.set("current_location", "Suez Canal");
    record2.set("vessel_name", "CMA CGM Antoine");
    record2.set("estimated_delivery", "2024-02-20");
    record2.set("origin_port", "Port Said");
    record2.set("destination_port", "Port of Los Angeles");
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("container_number", "CMAU1122334");
    record3.set("shipping_line", "CMA_CGM");
    record3.set("current_status", "Pickup");
    record3.set("current_location", "Port of Shanghai");
    record3.set("vessel_name", "CMA CGM Antoine");
    record3.set("estimated_delivery", "2024-02-25");
    record3.set("origin_port", "Shanghai");
    record3.set("destination_port", "Long Beach");
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("container_number", "HAPAG5555555");
    record4.set("shipping_line", "HAPAG_LLOYD");
    record4.set("current_status", "Delivered");
    record4.set("current_location", "Port of Hamburg");
    record4.set("vessel_name", "Seatrade Reefer");
    record4.set("estimated_delivery", "2024-02-05");
    record4.set("origin_port", "Antwerp");
    record4.set("destination_port", "Hamburg");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("container_number", "HAPAG6666666");
    record5.set("shipping_line", "HAPAG_LLOYD");
    record5.set("current_status", "Port_of_Discharge");
    record5.set("current_location", "Port of Antwerp");
    record5.set("vessel_name", "Seatrade Reefer");
    record5.set("estimated_delivery", "2024-02-12");
    record5.set("origin_port", "Rotterdam");
    record5.set("destination_port", "Antwerp");
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("container_number", "MSCU7777777");
    record6.set("shipping_line", "MSC");
    record6.set("current_status", "In_Transit");
    record6.set("current_location", "Arabian Sea");
    record6.set("vessel_name", "MSC Gulsun");
    record6.set("estimated_delivery", "2024-02-18");
    record6.set("origin_port", "Jebel Ali");
    record6.set("destination_port", "Port of Singapore");
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("container_number", "MSCU8888888");
    record7.set("shipping_line", "MSC");
    record7.set("current_status", "Pickup");
    record7.set("current_location", "Port of Jebel Ali");
    record7.set("vessel_name", "MSC Gulsun");
    record7.set("estimated_delivery", "2024-02-22");
    record7.set("origin_port", "Port of Singapore");
    record7.set("destination_port", "Jebel Ali");
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})