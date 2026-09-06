import html from "./product-card.html?raw";
import css from "./product-card.css?inline";
import fallbackImg from "../../assets/products/manzanas-fuji.webp";
import { priceFormat } from "../../models/product";

class ProductCard extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    shadow.innerHTML = `
            <style>
                ${css}
            </style>

            ${html}
        `;

    const productIdAttr = this.getAttribute("product-id");
    const priceAttr = this.getAttribute("price");
    const discountAttr = this.getAttribute("discount");
    const categoryAttr = this.getAttribute("category");
    const nameAttr = this.getAttribute("name");
    const imgAttr = this.getAttribute("img");

    const linkElement = shadow.getElementById("link") as HTMLAnchorElement;
    const articleElement = shadow.querySelector("article")!;
    const imgElement = shadow.getElementById("img") as HTMLImageElement;
    const priceElement = shadow.getElementById("price");
    const categoryElement = shadow.getElementById("category");
    const nameElement = shadow.getElementById("name");
    const discountPriceElement = shadow.getElementById("discount-price");
    const discountNumberElement = shadow.getElementById("discount");

    // El router intercepta el click del enlace y navega sin recargar
    linkElement.href = `/product/${encodeURIComponent(productIdAttr ?? "")}`;

    imgElement.src = imgAttr || fallbackImg;
    imgElement.alt = nameAttr ?? "";

    const price = Number(priceAttr);

    priceElement!.textContent = priceFormat.format(price);
    categoryElement!.textContent = categoryAttr;
    nameElement!.textContent = nameAttr;

    if (discountAttr) {
      const discount = Number(discountAttr);
      const discountPrice = Math.trunc((price * (100 - discount)) / 100);

      discountPriceElement!.textContent = priceFormat.format(discountPrice);
      discountNumberElement!.textContent = `${discountAttr}% OFF`;

      // El resto del estilo con descuento vive en el CSS
      articleElement.classList.add("with-discount");
    }
  }
}

customElements.define("product-card", ProductCard);
