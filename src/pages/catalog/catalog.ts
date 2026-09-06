import html from "./catalog.html?raw";
import css from "./catalog.css?inline";
import { Category, findCategory, toCategorySlug } from "../../models/product";
import {
  getProducts,
  getProductsByCategory,
} from "../../services/database/product";

class Catalog extends HTMLElement {
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

    const slug = this.getAttribute("category");
    const category = slug ? findCategory(slug) : undefined;

    const titleElement = shadow.getElementById("title")!;
    const subtitleElement = shadow.getElementById("subtitle")!;
    const emptyElement = shadow.getElementById("empty")!;
    const productsElement = shadow.getElementById("products")!;

    if (category) {
      titleElement.textContent = category;
      subtitleElement.textContent = "Productos de esta categoría";
      document.title = category;
    } else if (slug) {
      subtitleElement.textContent = `No existe la categoría "${slug}"`;
    } else {
      subtitleElement.textContent = "Todos nuestros productos";
    }

    this.renderFilters(category);

    const products = category
      ? await getProductsByCategory(category)
      : slug
        ? []
        : await getProducts();

    emptyElement.hidden = products.length > 0;

    for (const product of products) {
      const productCard = document.createElement("product-card");
      productCard.setAttribute("product-id", product.id);
      productCard.setAttribute("price", product.price.toString());
      productCard.setAttribute("name", product.name);
      productCard.setAttribute("category", product.category);
      productCard.setAttribute("img", product.img);

      if (product.discount) {
        productCard.setAttribute("discount", product.discount.toString());
      }

      productsElement.appendChild(productCard);
    }
  }

  private renderFilters(active?: Category) {
    const filtersElement = this.shadowRoot?.getElementById("filters");
    if (!filtersElement) return;

    const filters: { label: string; href: string; current: boolean }[] = [
      { label: "Todas", href: "/catalog", current: !active },
      ...Object.values(Category).map((category) => ({
        label: category,
        href: `/catalog/${toCategorySlug(category)}`,
        current: category === active,
      })),
    ];

    for (const filter of filters) {
      const link = document.createElement("a");
      link.href = filter.href;
      link.textContent = filter.label;

      if (filter.current) link.setAttribute("aria-current", "page");

      filtersElement.appendChild(link);
    }
  }
}

customElements.define("catalog-page", Catalog);
