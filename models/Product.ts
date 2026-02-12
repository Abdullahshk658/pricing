import mongoose, { InferSchemaType, Model } from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    itemCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    retailPrice: {
      type: Number,
      default: null,
    },
    bulkPrice: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  },
);

export type ProductDocument = InferSchemaType<typeof ProductSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Product: Model<ProductDocument> =
  mongoose.models.Product ||
  mongoose.model<ProductDocument>("Product", ProductSchema);

export default Product;