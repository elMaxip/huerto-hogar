import html from "./about.html?raw";
import css from "./about.css?inline";

class About extends HTMLElement {
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

customElements.define("about-page", About);
