import html from "./register.html?raw";
import css from "./register.css?inline";
import { Client } from "../../models/user";
import { getUser, register } from "../../services/database/user";
import {
  isValidEmail,
  MIN_FULLNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../../services/validators";
import { InputLabel } from "../../components/input-label/input-label";

class Register extends HTMLElement {
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

    const fullnameInput = shadow.querySelector<InputLabel>(
      'input-label[name="fullname"]',
    );
    const emailInput = shadow.querySelector<InputLabel>(
      'input-label[name="email"]',
    );
    const passwordInput = shadow.querySelector<InputLabel>(
      'input-label[name="password"]',
    );
    const confirmedPasswordInput = shadow.querySelector<InputLabel>(
      'input-label[name="confirmed-password"]',
    );

    if (
      !formElement ||
      !fullnameInput ||
      !emailInput ||
      !passwordInput ||
      !confirmedPasswordInput
    ) {
      return;
    }

    const inputs = [
      fullnameInput,
      emailInput,
      passwordInput,
      confirmedPasswordInput,
    ];

    formElement.addEventListener("submit", async (e) => {
      e.preventDefault();

      for (const input of inputs) input.clearError();

      const fullname = fullnameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmedPassword = confirmedPasswordInput.value;

      let valid = true;

      if (!fullname) {
        fullnameInput.setError("Ingresa tu nombre completo");
        valid = false;
      } else if (fullname.length < MIN_FULLNAME_LENGTH) {
        fullnameInput.setError(
          `El nombre debe tener al menos ${MIN_FULLNAME_LENGTH} caracteres`,
        );
        valid = false;
      }

      if (!email) {
        emailInput.setError("Ingresa tu correo electrónico");
        valid = false;
      } else if (!isValidEmail(email)) {
        emailInput.setError("Ingresa un correo electrónico válido");
        valid = false;
      }

      if (!password) {
        passwordInput.setError("Ingresa una contraseña");
        valid = false;
      } else if (password.length < MIN_PASSWORD_LENGTH) {
        passwordInput.setError(
          `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        );
        valid = false;
      }

      if (!confirmedPassword) {
        confirmedPasswordInput.setError("Repite tu contraseña");
        valid = false;
      } else if (password !== confirmedPassword) {
        confirmedPasswordInput.setError("Las contraseñas no coinciden");
        valid = false;
      }

      if (!valid) return;

      if (await getUser(email)) {
        emailInput.setError("Ya existe una cuenta con este correo electrónico");
        return;
      }

      const user = new Client(fullname, email, password);

      try {
        await register(user);
      } catch {
        // El índice email_idx es único: otra pestaña pudo registrar el correo
        emailInput.setError("No se pudo crear la cuenta, intenta nuevamente");
        return;
      }

      window.location.href = "/login";
    });
  }
}

customElements.define("register-page", Register);
