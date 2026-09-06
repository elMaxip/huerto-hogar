import html from "./category-card.html?raw";
import css from "./category-card.css?inline";
import { findCategory, toCategorySlug } from "../../models/product";

class CategoryCard extends HTMLElement {
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
    const categoryAttr = this.getAttribute("category");
    const miniDescriptionAttr = this.getAttribute("miniDescription");
    const imgAttr = this.getAttribute("img");

    const linkElement = shadow.getElementById("link") as HTMLAnchorElement;
    const categoryElement = shadow.getElementById("category");
    const miniDescriptionElement = shadow.getElementById("mini-description");
    const imgElement = shadow.getElementById("img");

    categoryElement!.textContent = categoryAttr;
    miniDescriptionElement!.textContent = miniDescriptionAttr;
    imgElement?.setAttribute("src", `/src/assets/categories/${imgAttr}`);

    // El catálogo filtra por el slug de la categoría
    const category = categoryAttr ? findCategory(categoryAttr) : undefined;

    linkElement.href = category
      ? `/catalog/${toCategorySlug(category)}`
      : "/catalog";
  }
}

customElements.define("category-card", CategoryCard);
