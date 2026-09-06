import html from "./cart.html?raw";
import css from "./cart.css?inline";
import fallbackImg from "../../assets/products/manzanas-fuji.webp";
import { getFinalPrice, priceFormat, Product } from "../../models/product";
import { getProducts } from "../../services/database/product";
import {
  clearCart,
  getCart,
  removeFromCart,
  setQuantity,
} from "../../services/cart";

class CartPage extends HTMLElement {
  private products = new Map<string, Product>();

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    shadow.innerHTML = `
            <style>
                ${css}
            </style>

            ${html}
        `;

    for (const product of await getProducts()) {
      this.products.set(product.id, product);
    }

    const clearButton = shadow.getElementById("clear")!;
    const buyButton = shadow.getElementById("buy")!;

    clearButton.addEventListener("click", () => {
      clearCart();
      this.render();
    });

    buyButton.addEventListener("click", () => {
      if (getCart().length === 0) return;

      clearCart();
      this.render("¡Gracias por tu compra! Tu carrito quedó vacío.");
    });

    this.render();
  }

  private render(message?: string) {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const itemsElement = shadow.getElementById("items")!;
    const emptyElement = shadow.getElementById("empty")!;
    const messageElement = shadow.getElementById("message")!;
    const summaryElement = shadow.getElementById("summary")!;
    const clearButton = shadow.getElementById("clear")!;
    const template = shadow.getElementById(
      "item-template",
    ) as HTMLTemplateElement;

    if (message) {
      messageElement.textContent = message;
      messageElement.hidden = false;
    } else {
      messageElement.hidden = true;
    }

    // Un producto puede haber desaparecido de la base de datos
    const saved = getCart().filter((item) => this.products.has(item.productId));

    // El stock pudo bajar desde que se guardó el carrito
    for (const item of saved) {
      const stock = this.products.get(item.productId)!.stock;
      if (item.quantity > stock) setQuantity(item.productId, stock);
    }

    const items = getCart().filter((item) => this.products.has(item.productId));

    itemsElement.replaceChildren();

    emptyElement.hidden = items.length > 0;
    summaryElement.hidden = items.length === 0;
    clearButton.hidden = items.length === 0;

    let total = 0;

    for (const item of items) {
      const product = this.products.get(item.productId)!;
      const unitPrice = getFinalPrice(product);
      const quantity = item.quantity;

      total += unitPrice * quantity;

      const fragment = template.content.cloneNode(true) as DocumentFragment;

      const imageLink = fragment.querySelector<HTMLAnchorElement>(".image-link")!;
      const img = fragment.querySelector("img")!;
      const nameLink = fragment.querySelector<HTMLAnchorElement>(".name-link")!;
      const quantityInput = fragment.querySelector<HTMLInputElement>(".quantity")!;
      const subtotal = fragment.querySelector<HTMLElement>(".subtotal")!;
      const removeButton = fragment.querySelector<HTMLButtonElement>(".remove")!;

      const productUrl = `/product/${encodeURIComponent(product.id)}`;
      imageLink.href = productUrl;
      nameLink.href = productUrl;
      nameLink.textContent = product.name;

      img.src = product.img || fallbackImg;
      img.alt = product.name;

      fragment.querySelector<HTMLElement>(".category")!.textContent =
        product.category;
      fragment.querySelector<HTMLElement>(".unit-price")!.textContent =
        `${priceFormat.format(unitPrice)} ${product.unidadVenta}`;

      quantityInput.value = quantity.toString();
      quantityInput.max = product.stock.toString();
      subtotal.textContent = priceFormat.format(unitPrice * quantity);

      quantityInput.addEventListener("change", () => {
        const requested = Math.trunc(Number(quantityInput.value));

        if (!requested || requested < 1) {
          // Bajar de 1 equivale a sacar el producto del carrito
          removeFromCart(product.id);
          this.render();
          return;
        }

        const clamped = Math.min(requested, product.stock);

        quantityInput.value = clamped.toString();
        setQuantity(product.id, clamped);
        this.updateTotal();
        subtotal.textContent = priceFormat.format(unitPrice * clamped);
      });

      removeButton.addEventListener("click", () => {
        removeFromCart(product.id);
        this.render();
      });

      itemsElement.appendChild(fragment);
    }

    this.setTotal(total);
  }

  private updateTotal() {
    const total = getCart().reduce((sum, item) => {
      const product = this.products.get(item.productId);
      if (!product) return sum;

      return sum + getFinalPrice(product) * item.quantity;
    }, 0);

    this.setTotal(total);
  }

  private setTotal(total: number) {
    const totalElement = this.shadowRoot?.getElementById("total");
    if (totalElement) totalElement.textContent = priceFormat.format(total);
  }
}

customElements.define("cart-page", CartPage);
