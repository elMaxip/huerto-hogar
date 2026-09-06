import html from "./login.html?raw";
import css from "./login.css?inline";
import { getUser } from "../../services/database/user";
import { isValidEmail } from "../../services/validators";
import { InputLabel } from "../../components/input-label/input-label";

class Login extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
            <style>
                ${css}
            </style>

            ${html}
        `;

    const formElement = shadow.querySelector("form");

    const emailInput = shadow.querySelector<InputLabel>(
      'input-label[name="email"]',
    );
    const passwordInput = shadow.querySelector<InputLabel>(
      'input-label[name="password"]',
    );

    if (!formElement || !emailInput || !passwordInput) return;

    formElement.addEventListener("submit", async (e) => {
      e.preventDefault();

      emailInput.clearError();
      passwordInput.clearError();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      let valid = true;

      if (!email) {
        emailInput.setError("Ingresa tu correo electrónico");
        valid = false;
      } else if (!isValidEmail(email)) {
        emailInput.setError("Ingresa un correo electrónico válido");
        valid = false;
      }

      if (!password) {
        passwordInput.setError("Ingresa tu contraseña");
        valid = false;
      }

      if (!valid) return;

      const user = await getUser(email);

      if (!user) {
        emailInput.setError("No existe una cuenta con este correo electrónico");
        return;
      }

      if (user.password !== password) {
        passwordInput.setError("La contraseña es incorrecta");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/";
    });
  }
}

customElements.define("login-page", Login);
