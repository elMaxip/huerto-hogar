import html from "./blog.html?raw";
import css from "./blog.css?inline";

class Blog extends HTMLElement {
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

customElements.define("blog-page", Blog);
