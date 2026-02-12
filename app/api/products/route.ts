import { NextResponse } from "next/server";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  itemCode: z.string().trim().min(1, "Item code is required"),
  imageUrl: z.string().trim().url("Image URL must be a valid URL"),
  retailPrice: z.number().nullable().optional(),
  bulkPrice: z.number().nullable().optional(),
});

function getProgress(
  products: Array<{ retailPrice?: number | null; bulkPrice?: number | null }>,
) {
  const total = products.length;
  const completed = products.filter(
    (product) => product.retailPrice != null || product.bulkPrice != null,
  ).length;

  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({})
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    return NextResponse.json({
      products,
      progress: getProgress(products),
    });
  } catch (error) {
    console.error("Failed to fetch products", error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const parsedBody = createProductSchema.parse(body);

    const product = await Product.create({
      ...parsedBody,
      retailPrice: parsedBody.retailPrice ?? null,
      bulkPrice: parsedBody.bulkPrice ?? null,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid payload",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    console.error("Failed to create product", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}
