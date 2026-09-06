import html from "./session-card.html?raw";
import css from "./session-card.css?inline";
import { User } from "../../models/user";

class SessionCard extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
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

    const sessionButtonsElement = shadow.getElementById("session-buttons");
    const accountElement = shadow.getElementById("account");
    const fullnameElement = shadow.getElementById("fullname");
    const emailElement = shadow.getElementById("email");
    const logoutElement = shadow.querySelector("primary-button");

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser) as User;
      sessionButtonsElement!.style.display = "none";
      accountElement!.style.display = "flex";
      fullnameElement!.textContent = user.fullname;
      emailElement!.textContent = user.email;
    }

    logoutElement!.addEventListener("click", () => {
      localStorage.clear();
      location.reload();
    });
  }
}

customElements.define("session-card", SessionCard);
