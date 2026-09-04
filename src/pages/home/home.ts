import html from "./home.html?raw";
import css from "./home.css?inline";

class Home extends HTMLElement {
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

customElements.define("home-page", Home);
