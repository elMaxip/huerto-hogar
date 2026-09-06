import html from "./input-label.html?raw";
import css from "./input-label.css?inline";

const VALIDATION_ATTRIBUTES = [
  "required",
  "minlength",
  "maxlength",
  "pattern",
  "placeholder",
];

class InputLabel extends HTMLElement {
  static formAssociated = true;
  private internals: ElementInternals;
  private inputElement: HTMLInputElement | null = null;
  private errorElement: HTMLElement | null = null;

  constructor() {
    super();

    this.attachShadow({ mode: "open", delegatesFocus: true });
    this.internals = this.attachInternals();
  }

  get value(): string {
    return this.inputElement?.value ?? "";
  }

  /** Muestra el mensaje en rojo debajo del input */
  setError(message: string) {
    if (!this.inputElement || !this.errorElement) return;

    this.errorElement.textContent = message;
    this.errorElement.hidden = false;
    this.inputElement.classList.add("invalid");
    this.inputElement.setAttribute("aria-invalid", "true");
  }

  clearError() {
    if (!this.inputElement || !this.errorElement) return;

    this.errorElement.textContent = "";
    this.errorElement.hidden = true;
    this.inputElement.classList.remove("invalid");
    this.inputElement.removeAttribute("aria-invalid");
  }

  focusInput() {
    this.inputElement?.focus();
  }

  connectedCallback() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
            <style>
                ${css}
            </style>

            ${html}
        `;

    const labelAttr = this.textContent;
    const typeAttr = this.getAttribute("type");

    const labelElement = this.shadowRoot.querySelector("span");
    const inputElement = this.shadowRoot.querySelector("input");

    if (!labelElement || !inputElement) return;

    this.inputElement = inputElement;
    this.errorElement = this.shadowRoot.getElementById("error");

    labelElement.textContent = labelAttr;

    if (typeAttr) inputElement.setAttribute("type", typeAttr);

    for (const attribute of VALIDATION_ATTRIBUTES) {
      const value = this.getAttribute(attribute);
      if (value !== null) inputElement.setAttribute(attribute, value);
    }

    const sync = () => {
      this.internals.setFormValue(inputElement.value);

      // El <input> vive en el shadow root: su validez no llega sola al <form>
      this.internals.setValidity(
        inputElement.validity,
        inputElement.validationMessage,
        inputElement,
      );
    };

    inputElement.addEventListener("input", () => {
      sync();
      // Al corregir el campo el mensaje deja de tener sentido
      this.clearError();
    });

    sync();
  }
}

customElements.define("input-label", InputLabel);

export { InputLabel };
