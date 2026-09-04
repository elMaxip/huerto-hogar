import html from "./primary-button.html?raw";
import css from "./primary-button.css?inline";

class PrimaryButton extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = `
            <style>
                ${css}
            </style>

            ${html}
        `;
  }
}

customElements.define("primary-button", PrimaryButton);
