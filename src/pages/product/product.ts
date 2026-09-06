import html from "./product.html?raw";
import css from "./product.css?inline";
import fallbackImg from "../../assets/products/manzanas-fuji.webp";
import { getFinalPrice, priceFormat } from "../../models/product";
import { getProduct } from "../../services/database/product";
import { addToCart } from "../../services/cart";
import { navigate } from "../../router";

class ProductPage extends HTMLElement {
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

    const detailElement = shadow.getElementById("detail")!;
    const notFoundElement = shadow.getElementById("not-found")!;

    const productId = this.getAttribute("product-id");
    const product = productId ? await getProduct(productId) : undefined;

    if (!product) {
      notFoundElement.hidden = false;
      document.title = "Producto no encontrado";
      return;
    }

    document.title = product.name;
    detailElement.hidden = false;

    const imgElement = shadow.getElementById("img") as HTMLImageElement;
    const quantityElement = shadow.getElementById("quantity") as HTMLInputElement;
    const stockElement = shadow.getElementById("stock")!;
    const priceElement = shadow.getElementById("price")!;
    const discountPriceElement = shadow.getElementById("discount-price")!;
    const discountElement = shadow.getElementById("discount")!;
    const addButton = shadow.getElementById("add")!;

    imgElement.src = product.img || fallbackImg;
    imgElement.alt = product.name;

    shadow.getElementById("name")!.textContent = product.name;
    shadow.getElementById("category")!.textContent = product.category;
    shadow.getElementById("description")!.textContent = product.description;
    shadow.getElementById("unit")!.textContent = product.unidadVenta;

    priceElement.textContent = priceFormat.format(product.price);

    if (product.discount) {
      discountPriceElement.textContent = priceFormat.format(
        getFinalPrice(product),
      );
      priceElement.style.textDecoration = "line-through 3px";
      priceElement.style.color = "var(--color-bg-600)";
      priceElement.style.fontSize = "1.1rem";

      discountElement.textContent = `%${product.discount} OFF`;
      discountElement.style.display = "inline";
    }

    if (product.stock > 0) {
      stockElement.textContent = `${product.stock} unidades disponibles`;
      quantityElement.max = product.stock.toString();
    } else {
      stockElement.textContent = "Sin stock";
      stockElement.classList.add("out");
      quantityElement.disabled = true;
    }

    addButton.addEventListener("click", () => {
      if (product.stock <= 0) return;

      const quantity = Math.min(
        Math.max(Math.trunc(Number(quantityElement.value)) || 1, 1),
        product.stock,
      );

      addToCart(product.id, quantity);
      navigate("/cart");
    });
  }
}

customElements.define("product-page", ProductPage);
