import html from "./home.html?raw";
import css from "./home.css?inline";
import { getProducts } from "../../services/database/product";
import { Category } from "../../models/product";

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  [Category.FrutaFresca]: "Cosechadas en su punto justo, dulces y jugosas.",
  [Category.VerduraOrganica]: "Cultivadas sin pesticidas por productores locales.",
  [Category.ProductoOrganico]: "Despensa natural, sin aditivos ni conservantes.",
  [Category.ProductoLacteo]: "Frescura del campo directo a tu mesa.",
};

class Home extends HTMLElement {
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

    const promotions = shadow.getElementById("promotions");
    const featuredProducts = shadow.getElementById("featured-products");
    const categories = shadow.getElementById("categories");

    const products = await getProducts();

    products.forEach((product) => {
      const productCard = document.createElement("product-card");
      productCard.setAttribute("product-id", product.id);
      productCard.setAttribute("price", product.price.toString());
      productCard.setAttribute("name", product.name);
      productCard.setAttribute("category", product.category);
      console.log(product.img);
      productCard.setAttribute("img", product.img);

      if (product.discount) {
        productCard.setAttribute("discount", product.discount.toString());
        promotions?.appendChild(productCard);
      } else {
        featuredProducts?.appendChild(productCard);
      }
    });

    Object.values(Category).forEach((category) => {
      const categoryCard = document.createElement("category-card");
      categoryCard.setAttribute("category", category);
      categoryCard.setAttribute("miniDescription", CATEGORY_DESCRIPTIONS[category]);
      categoryCard.setAttribute("img", category + ".webp");

      categories?.appendChild(categoryCard);
    });
  }
}

customElements.define("home-page", Home);
