import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();

    const products = await Product.find({})
      .select("name itemCode retailPrice bulkPrice")
      .sort({ createdAt: 1 })
      .lean()
      .exec();

    const rows = products.map((product) => ({
      "Product Name": product.name,
      "Item Code": product.itemCode,
      "Retail Price": product.retailPrice ?? "",
      "Bulk Price": product.bulkPrice ?? "",
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Pricing");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
      compression: true,
    });

    const timestamp = new Date().toISOString().split("T")[0];

    return new NextResponse(buffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="product-pricing-${timestamp}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to export products", error);
    return NextResponse.json(
      { message: "Failed to export products" },
      { status: 500 },
    );
  }
}