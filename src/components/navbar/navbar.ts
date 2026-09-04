import html from "./navbar.html?raw";
import css from "./navbar.css?inline";

class NavBar extends HTMLElement {
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

customElements.define("nav-bar", NavBar);
