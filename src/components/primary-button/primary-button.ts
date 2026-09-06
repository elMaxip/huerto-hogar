import html from "./primary-button.html?raw";
import css from "./primary-button.css?inline";

class PrimaryButton extends HTMLElement {
  static formAssociated = true;
  private internals: ElementInternals;
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.internals = this.attachInternals();
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

    const text = this.textContent;

    const button = shadow.querySelector("button");

    button!.textContent = text;

    button!.addEventListener("click", () => {
      this.internals.form?.requestSubmit();
    });
  }
}

customElements.define("primary-button", PrimaryButton);
