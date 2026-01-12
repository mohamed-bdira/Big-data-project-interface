const mongoose = require('mongoose');
const fs = require('fs');

// Connection URI
const MONGO_URI = "mongodb+srv://Bot:Botishere@cluster0.b7shboc.mongodb.net/?appName=Cluster0";

async function inspectDatabase() {
  let output = "";
  const log = (msg) => {
    console.log(msg);
    output += msg + "\n";
  };

  try {
    log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    log("✅ Connected!");

    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    const result = await admin.listDatabases();

    log("\nAvailable Databases:");
    for (const dbInfo of result.databases) {
      log(`- ${dbInfo.name} (Size: ${dbInfo.sizeOnDisk} bytes)`);

      if (dbInfo.name !== 'local' && dbInfo.name !== 'admin') {
        // Peek into non-system databases
        log(`  Inspecting '${dbInfo.name}'...`);
        const targetDb = mongoose.connection.useDb(dbInfo.name);
        const collections = await targetDb.db.listCollections().toArray();

        if (collections.length === 0) {
          log(`    (No collections)`);
        }

        for (const col of collections) {
          const count = await targetDb.db.collection(col.name).countDocuments();
          log(`    -> Collection: ${col.name} (${count} docs)`);

          // Check for potential sensor data
          if (count > 0) {
            // Just take the first one to see what it looks like
            const sample = await targetDb.db.collection(col.name).findOne();
            log(`       Sample: ${JSON.stringify(sample)}`);
          }
        }
      }
    }

  } catch (err) {
    log("❌ Error: " + err);
  } finally {
    await mongoose.disconnect();
    log("\nDisconnected.");
    fs.writeFileSync('db_info.txt', output);
  }
}

inspectDatabase();
