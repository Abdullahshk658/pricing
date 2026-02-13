const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("ERROR: MONGODB_URI is not defined in your environment variables.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Success! Pinged your MongoDB Atlas deployment.");
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
