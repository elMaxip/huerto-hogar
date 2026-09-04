import html from "./catalog.html?raw";
import css from "./catalog.css?inline";

class Catalog extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
            <style>
                ${css}
            </style>

            ${html}
        `;
  }
}

customElements.define("catalog-page", Catalog);
