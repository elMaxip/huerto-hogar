import { INITIAL_PRODUCTS } from "./seed";

const DB_NAME = "huertohogar";
const DB_VERSION = 3;

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req: IDBOpenDBRequest = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      if (!db.objectStoreNames.contains("users")) {
        const objectStore = db.createObjectStore("users", {
          keyPath: "id",
          autoIncrement: true,
        });

        objectStore.createIndex("email_idx", "email", { unique: true });
      }

      if (!db.objectStoreNames.contains("products")) {
        const objectStore = db.createObjectStore("products", {
          keyPath: "id",
        });

        objectStore.createIndex("category_idx", "category");

        for (const product of INITIAL_PRODUCTS) {
          objectStore.add(product);
        }
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
