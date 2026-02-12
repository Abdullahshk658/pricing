import mongoose from "mongoose";

const products = [
  {
    name: "Hydra Glow Serum",
    itemCode: "COS-1001",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Velvet Matte Lipstick",
    itemCode: "COS-1002",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Daily UV Shield SPF 50",
    itemCode: "COS-1003",
    imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Silk Finish Foundation",
    itemCode: "COS-1004",
    imageUrl: "https://images.unsplash.com/photo-1629198745660-1ea63a6d4f58?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Night Repair Eye Cream",
    itemCode: "COS-1005",
    imageUrl: "https://images.unsplash.com/photo-1571781418606-70265b9cce90?auto=format&fit=crop&w=800&q=80",
  },
];

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from environment variables.");
}

async function seed() {
  await mongoose.connect(MONGODB_URI, {
    dbName: "product-pricing-portal",
    bufferCommands: false,
  });

  const productSchema = new mongoose.Schema(
    {
      name: String,
      itemCode: String,
      imageUrl: String,
      retailPrice: { type: Number, default: null },
      bulkPrice: { type: Number, default: null },
    },
    {
      timestamps: true,
    },
  );

  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  await Product.deleteMany({});
  await Product.insertMany(
    products.map((product) => ({
      ...product,
      retailPrice: null,
      bulkPrice: null,
    })),
  );

  console.log(`Seeded ${products.length} products.`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed failed", error);
  await mongoose.disconnect();
  process.exit(1);
});