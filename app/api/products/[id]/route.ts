import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

const updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),
  itemCode: z.string().trim().min(1).optional(),
  imageUrl: z.string().trim().url().optional(),
  retailPrice: z.number().nullable().optional(),
  bulkPrice: z.number().nullable().optional(),
});

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
    }

    await connectToDatabase();
    const body = await request.json();
    const parsedBody = updateProductSchema.parse(body);

    const updatedProduct = await Product.findByIdAndUpdate(params.id, parsedBody, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
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

    console.error("Failed to update product", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
    }

    await connectToDatabase();

    const deletedProduct = await Product.findByIdAndDelete(params.id).lean().exec();

    if (!deletedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Failed to delete product", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}