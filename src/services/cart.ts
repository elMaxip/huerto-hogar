export interface CartItem {
  productId: string;
  quantity: number;
}

const CART_KEY = "cart";

/** Se dispara en window cada vez que el carrito cambia */
export const CART_CHANGE_EVENT = "cart:change";

function notify() {
  window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT));
}

function save(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  notify();
}

export function getCart(): CartItem[] {
  const saved = localStorage.getItem(CART_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    // El localStorage lo edita el usuario: descartamos lo que no tenga forma de CartItem
    return parsed.filter(
      (item): item is CartItem =>
        typeof item?.productId === "string" &&
        Number.isInteger(item?.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function addToCart(productId: string, quantity = 1) {
  if (quantity < 1) return;

  const items = getCart();
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }

  save(items);
}

export function setQuantity(productId: string, quantity: number) {
  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }

  const items = getCart();
  const existing = items.find((item) => item.productId === productId);

  if (!existing) return;

  existing.quantity = quantity;
  save(items);
}

export function removeFromCart(productId: string) {
  save(getCart().filter((item) => item.productId !== productId));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  notify();
}

export function getCartCount(): number {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}
