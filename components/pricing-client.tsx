"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Product, ProgressData } from "@/lib/types";
import LogoutButton from "@/components/logout-button";

function formatProgress(progress: ProgressData): string {
  return `${progress.completed} / ${progress.total}`;
}

function parsePriceInput(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export default function PricingClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [progress, setProgress] = useState<ProgressData>({
    completed: 0,
    total: 0,
    percent: 0,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [retailInput, setRetailInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const debouncedSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentProduct = products[currentIndex] ?? null;

  const hasNextProduct = useMemo(
    () => currentIndex < Math.max(products.length - 1, 0),
    [currentIndex, products.length],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = (await response.json()) as {
          products: Product[];
          progress: ProgressData;
        };

        if (!isMounted) {
          return;
        }

        setProducts(data.products);
        setProgress(data.progress);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load products");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentProduct) {
      setRetailInput("");
      setBulkInput("");
      return;
    }

    setRetailInput(
      currentProduct.retailPrice === null ? "" : String(currentProduct.retailPrice),
    );
    setBulkInput(currentProduct.bulkPrice === null ? "" : String(currentProduct.bulkPrice));
  }, [currentProduct?._id]);

  function updateLocalProduct(nextRetail: number | null, nextBulk: number | null) {
    setProducts((previousProducts) => {
      const changedProducts = previousProducts.map((product, index) => {
        if (index !== currentIndex) {
          return product;
        }

        return {
          ...product,
          retailPrice: nextRetail,
          bulkPrice: nextBulk,
        };
      });

      const completed = changedProducts.filter(
        (product) => product.retailPrice !== null || product.bulkPrice !== null,
      ).length;

      const total = changedProducts.length;

      setProgress({
        completed,
        total,
        percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      });

      return changedProducts;
    });
  }

  async function persistCurrentProduct(): Promise<boolean> {
    if (!currentProduct) {
      return true;
    }

    const retailPrice = parsePriceInput(retailInput);
    const bulkPrice = parsePriceInput(bulkInput);

    if (retailInput.trim() !== "" && retailPrice === null) {
      toast.error("Retail price must be a valid number");
      return false;
    }

    if (bulkInput.trim() !== "" && bulkPrice === null) {
      toast.error("Bulk price must be a valid number");
      return false;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/products/${currentProduct._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          retailPrice,
          bulkPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      updateLocalProduct(retailPrice, bulkPrice);
      setSavedMessage("Saved");
      setTimeout(() => setSavedMessage(""), 1100);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to save product pricing");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  function queueAutoSave() {
    setSavedMessage("Saving...");

    if (debouncedSaveTimer.current) {
      clearTimeout(debouncedSaveTimer.current);
    }

    debouncedSaveTimer.current = setTimeout(() => {
      persistCurrentProduct();
    }, 500);
  }

  async function handleSaveAndNext() {
    if (debouncedSaveTimer.current) {
      clearTimeout(debouncedSaveTimer.current);
    }

    const didSave = await persistCurrentProduct();

    if (!didSave) {
      return;
    }

    if (hasNextProduct) {
      setCurrentIndex((previous) => previous + 1);
      return;
    }

    toast.success("You have reached the last product");
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSaveAndNext();
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-3xl animate-pulse space-y-4">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-2.5 w-full rounded-full bg-muted" />
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5">
            <div className="h-52 w-full rounded-2xl bg-muted" />
            <div className="mt-5 h-6 w-2/3 rounded bg-muted" />
            <div className="mt-3 h-4 w-1/3 rounded bg-muted" />
            <div className="mt-6 h-11 w-full rounded-xl bg-muted" />
            <div className="mt-4 h-11 w-full rounded-xl bg-muted" />
            <div className="mt-6 h-11 w-full rounded-xl bg-muted" />
          </div>
        </div>
      </main>
    );
  }

  if (!currentProduct) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-2xl font-semibold">Product Pricing Portal</h1>
          <LogoutButton />
        </div>
        <p className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-lg shadow-black/5">
          No products found. Add products from the admin dashboard.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Pricing</p>
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Product Pricing Portal</h1>
          </div>
          <LogoutButton />
        </header>

        <section className="rounded-2xl border border-border bg-card px-4 py-4 shadow-lg shadow-black/5 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-base font-semibold">{formatProgress(progress)}</p>
            </div>
            <p className="text-sm font-semibold text-primary">{progress.percent}%</p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-black/5 transition-all duration-300 sm:p-7">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
            <img
              src={currentProduct.imageUrl}
              alt={currentProduct.name}
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>

          <div className="mt-5">
            <h2 className="text-2xl font-semibold text-card-foreground">{currentProduct.name}</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Item Code: {currentProduct.itemCode}</p>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-card-foreground">Retail Price</span>
              <input
                type="number"
                step="0.01"
                value={retailInput}
                onChange={(event) => {
                  setRetailInput(event.target.value);
                  queueAutoSave();
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Enter retail price"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-card-foreground">Bulk Price</span>
              <input
                type="number"
                step="0.01"
                value={bulkInput}
                onChange={(event) => {
                  setBulkInput(event.target.value);
                  queueAutoSave();
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Enter bulk price"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {savedMessage || "Idle"}
            </p>

            <button
              type="button"
              onClick={() => void handleSaveAndNext()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Save & Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
