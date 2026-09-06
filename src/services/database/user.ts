import { User } from "../../models/user";
import { openDatabase } from "./db";

export async function register(user: Omit<User, "id">): Promise<User> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");

    const req = store.add(user);

    req.onsuccess = () => {
      const id = req.result as number;

      resolve({
        ...user,
        id,
      });
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
}

export async function getUser(email: string): Promise<User | undefined> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readonly");
    const store = transaction.objectStore("users");
    const idx = store.index("email_idx");

    const req = idx.get(email);

    req.onsuccess = () => {
      resolve(req.result);
    };

    req.onerror = () => {
      reject(req.error);
    };
  });
}
