import { Category, Product } from "../../models/product";
import { openDatabase } from "./db";

export async function getProducts(): Promise<Product[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("products", "readonly");
    const store = transaction.objectStore("products");

    const req = store.getAll();

    req.onsuccess = () => {
      resolve(req.result);
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("products", "readonly");
    const store = transaction.objectStore("products");

    const req = store.get(id);

    req.onsuccess = () => {
      resolve(req.result);
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
}

export async function getProductsByCategory(
  category: Category,
): Promise<Product[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("products", "readonly");
    const store = transaction.objectStore("products");
    const idx = store.index("category_idx");

    const req = idx.getAll(category);

    req.onsuccess = () => {
      resolve(req.result);
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
}
