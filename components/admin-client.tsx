"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import LogoutButton from "@/components/logout-button";
import type { Product } from "@/lib/types";

type FilterStatus = "all" | "done" | "pending";

type NewProductState = {
  name: string;
  itemCode: string;
  imageUrl: string;
};

function productIsDone(product: Product): boolean {
  return product.retailPrice !== null || product.bulkPrice !== null;
}

function parsePriceValue(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export default function AdminClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProductState>({
    name: "",
    itemCode: "",
    imageUrl: "",
  });

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.itemCode.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      if (statusFilter === "all") {
        return true;
      }

      return statusFilter === "done" ? productIsDone(product) : !productIsDone(product);
    });
  }, [products, searchTerm, statusFilter]);

  useEffect(() => {
    void fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProducts() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = (await response.json()) as { products: Product[] };
      setProducts(data.products);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsCreating(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProduct,
          retailPrice: null,
          bulkPrice: null,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        toast.error(data?.message ?? "Unable to create product");
        return;
      }

      const createdProduct = (await response.json()) as Product;
      setProducts((previous) => [...previous, createdProduct]);
      setNewProduct({ name: "", itemCode: "", imageUrl: "" });
      toast.success("Product added");
    } catch (error) {
      console.error(error);
      toast.error("Unable to create product");
    } finally {
      setIsCreating(false);
    }
  }

  async function updatePrice(productId: string, key: "retailPrice" | "bulkPrice", value: string) {
    const parsedValue = parsePriceValue(value);

    if (value.trim() !== "" && parsedValue === null) {
      toast.error("Price must be a valid number");
      return;
    }

    const previousProducts = products;

    setProducts((previous) =>
      previous.map((product) =>
        product._id === productId
          ? {
              ...product,
              [key]: parsedValue,
            }
          : product,
      ),
    );

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [key]: parsedValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Update failed");
      }

      toast.success("Price saved");
    } catch (error) {
      console.error(error);
      setProducts(previousProducts);
      toast.error("Failed to update price");
    }
  }

  async function handleDeleteProduct(productId: string) {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) {
      return;
    }

    const previousProducts = products;

    setProducts((previous) => previous.filter((product) => product._id !== productId));

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      toast.success("Product deleted");
    } catch (error) {
      console.error(error);
      setProducts(previousProducts);
      toast.error("Failed to delete product");
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Admin Dashboard</p>
            <h1 className="text-2xl font-semibold text-foreground">Manage Product Pricing</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/export"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </a>
            <LogoutButton />
          </div>
        </header>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-lg shadow-black/5 sm:p-5">
          <h2 className="text-lg font-semibold">Add Product</h2>
          <form onSubmit={handleCreateProduct} className="mt-4 grid gap-3 md:grid-cols-4">
            <input
              value={newProduct.name}
              onChange={(event) =>
                setNewProduct((previous) => ({ ...previous, name: event.target.value }))
              }
              placeholder="Product Name"
              className="rounded-xl border border-input px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
            <input
              value={newProduct.itemCode}
              onChange={(event) =>
                setNewProduct((previous) => ({ ...previous, itemCode: event.target.value }))
              }
              placeholder="Item Code"
              className="rounded-xl border border-input px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
            <input
              value={newProduct.imageUrl}
              onChange={(event) =>
                setNewProduct((previous) => ({ ...previous, imageUrl: event.target.value }))
              }
              placeholder="Image URL"
              className="rounded-xl border border-input px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? "Adding..." : "Add Product"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-lg shadow-black/5 sm:p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or item code"
                className="w-full rounded-xl border border-input py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
              className="rounded-xl border border-input px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Statuses</option>
              <option value="done">Done</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="px-3 py-3">Image</th>
                  <th className="px-3 py-3">Product Name</th>
                  <th className="px-3 py-3">Item Code</th>
                  <th className="px-3 py-3">Retail Price</th>
                  <th className="px-3 py-3">Bulk Price</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-border/60">
                        <td className="px-3 py-4" colSpan={7}>
                          <div className="h-8 animate-pulse rounded bg-muted" />
                        </td>
                      </tr>
                    ))
                  : filteredProducts.map((product) => {
                      const isDone = productIsDone(product);

                      return (
                        <tr key={product._id} className="border-b border-border/60 align-middle">
                          <td className="px-3 py-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg border border-border object-cover"
                            />
                          </td>
                          <td className="px-3 py-3 font-medium text-card-foreground">{product.name}</td>
                          <td className="px-3 py-3 text-muted-foreground">{product.itemCode}</td>
                          <td className="px-3 py-3">
                            <input
                              defaultValue={product.retailPrice ?? ""}
                              type="number"
                              step="0.01"
                              className="w-28 rounded-lg border border-input px-2 py-1.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                              onBlur={(event) =>
                                void updatePrice(product._id, "retailPrice", event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void updatePrice(
                                    product._id,
                                    "retailPrice",
                                    (event.target as HTMLInputElement).value,
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <input
                              defaultValue={product.bulkPrice ?? ""}
                              type="number"
                              step="0.01"
                              className="w-28 rounded-lg border border-input px-2 py-1.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                              onBlur={(event) =>
                                void updatePrice(product._id, "bulkPrice", event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void updatePrice(
                                    product._id,
                                    "bulkPrice",
                                    (event.target as HTMLInputElement).value,
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isDone
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {isDone ? "Done" : "Pending"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => void handleDeleteProduct(product._id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredProducts.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No products match the current filters.</p>
          )}
        </section>
      </div>
    </main>
  );
}
