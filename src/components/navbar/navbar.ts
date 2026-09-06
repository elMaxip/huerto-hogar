import html from "./navbar.html?raw";
import css from "./navbar.css?inline";
import { CART_CHANGE_EVENT, getCartCount } from "../../services/cart";

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

    const accountButton = shadow.getElementById("account");
    const modal = shadow.getElementById("session-card") as HTMLDialogElement;
    const cartCount = shadow.getElementById("cart-count")!;

    const updateCartCount = () => {
      const count = getCartCount();

      cartCount.textContent = count.toString();
      cartCount.hidden = count === 0;
    };

    updateCartCount();
    window.addEventListener(CART_CHANGE_EVENT, updateCartCount);

    accountButton!.addEventListener("click", () => {
      modal.showModal();
    });

    // Un diálogo modal deja inerte al resto del documento: si navegamos sin
    // cerrarlo, la página queda sin responder porque la navbar se oculta
    modal.addEventListener("click", (e) => {
      const clickedLink = e
        .composedPath()
        .some((element) => element instanceof HTMLAnchorElement);

      if (clickedLink) {
        modal.close();
        return;
      }

      const dialogDimensions = modal.getBoundingClientRect();

      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        modal.close();
      }
    });

    window.addEventListener("popstate", () => modal.close());
  }
}

customElements.define("nav-bar", NavBar);
