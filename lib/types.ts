export type Product = {
  _id: string;
  name: string;
  itemCode: string;
  imageUrl: string;
  retailPrice: number | null;
  bulkPrice: number | null;
  createdAt: string;
  updatedAt?: string;
};

export type ProgressData = {
  completed: number;
  total: number;
  percent: number;
};