type Route = {
  tag: string;
  title: string;
  chrome?: boolean;
  load: () => Promise<unknown>;
};

const routes: Record<string, Route> = {
  "/": {
    tag: "home-page",
    title: "Inicio",
    load: () => import("./pages/home/home"),
  },
  "/catalog": {
    tag: "catalog-page",
    title: "Catálogo",
    load: () => import("./pages/catalog/catalog"),
  },
  "/catalog/:category": {
    tag: "catalog-page",
    title: "Catálogo",
    load: () => import("./pages/catalog/catalog"),
  },
  "/blog": {
    tag: "blog-page",
    title: "Blog",
    load: () => import("./pages/blog/blog"),
  },
  "/about": {
    tag: "about-page",
    title: "Sobre nosotros",
    load: () => import("./pages/about/about"),
  },
  "/login": {
    tag: "login-page",
    title: "Iniciar sesión",
    chrome: false,
    load: () => import("./pages/login/login"),
  },
  "/register": {
    tag: "register-page",
    title: "Registrar cuenta",
    chrome: false,
    load: () => import("./pages/register/register"),
  },
  "/cart": {
    tag: "cart-page",
    title: "Carrito de compras",
    load: () => import("./pages/cart/cart"),
  },
  "/product/:product-id": {
    tag: "product-page",
    title: "Producto",
    load: () => import("./pages/product/product"),
  },
};

type Match = {
  route: Route;
  params: Record<string, string>;
};

/** Busca la ruta exacta y, si no existe, prueba con los patrones que llevan :parametro */
function matchRoute(path: string): Match | null {
  const exact = routes[path];
  if (exact) return { route: exact, params: {} };

  const segments = path.split("/");

  for (const [pattern, route] of Object.entries(routes)) {
    if (!pattern.includes(":")) continue;

    const patternSegments = pattern.split("/");
    if (patternSegments.length !== segments.length) continue;

    const params: Record<string, string> = {};
    let matches = true;

    for (const [index, patternSegment] of patternSegments.entries()) {
      const segment = segments[index];

      if (patternSegment.startsWith(":")) {
        if (!segment) {
          matches = false;
          break;
        }

        params[patternSegment.slice(1)] = decodeURIComponent(segment);
        continue;
      }

      if (patternSegment !== segment) {
        matches = false;
        break;
      }
    }

    if (matches) return { route, params };
  }

  return null;
}

function getOutlet() {
  const element = document.querySelector<HTMLElement>("#app");

  if (!element) {
    throw new Error('No se encontró <main id="app"> en index.html');
  }

  return element;
}

const outlet = getOutlet();

let currentNavigation = 0;

function normalize(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function notFound(path: string) {
  const section = document.createElement("section");

  const heading = document.createElement("h1");
  heading.textContent = "404";

  const message = document.createElement("p");
  message.textContent = `No existe la página ${path}`;

  section.append(heading, message);

  return section;
}

function setChrome(visible: boolean) {
  const navbar = document.querySelector<HTMLElement>("nav-bar");

  if (navbar) navbar.hidden = !visible;
}

function markActiveLinks(path: string) {
  const navbar = document.querySelector("nav-bar");

  // Los enlaces viven dentro del shadow root, document.querySelectorAll no los ve
  const links =
    navbar?.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [];

  for (const link of links) {
    const linkPath = normalize(new URL(link.href).pathname);

    // /catalog sigue activo mientras estemos en /catalog/frutas-frescas
    const isActive =
      linkPath === path ||
      (linkPath !== "/" && path.startsWith(`${linkPath}/`));

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

async function render(path: string) {
  const match = matchRoute(path);

  markActiveLinks(path);

  if (!match) {
    document.title = "Página no encontrada";
    setChrome(true);
    outlet.replaceChildren(notFound(path));
    return;
  }

  const { route, params } = match;

  const navigation = ++currentNavigation;
  await route.load();

  if (navigation !== currentNavigation) return;

  document.title = route.title;
  setChrome(route.chrome ?? true);

  const page = document.createElement(route.tag);

  for (const [name, value] of Object.entries(params)) {
    page.setAttribute(name, value);
  }

  outlet.replaceChildren(page);
}

export function navigate(path: string) {
  const target = normalize(path);

  if (target === normalize(location.pathname)) return;

  history.pushState({}, "", target);
  render(target);
}

document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  // composedPath() atraviesa el shadow DOM; event.target apuntaría a <nav-bar>
  const anchor = event
    .composedPath()
    .find(
      (element): element is HTMLAnchorElement =>
        element instanceof HTMLAnchorElement,
    );

  if (!anchor || !anchor.getAttribute("href")) return;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

  const url = new URL(anchor.href);
  if (url.origin !== location.origin) return;

  event.preventDefault();
  navigate(url.pathname);
});

window.addEventListener("popstate", () => {
  render(normalize(location.pathname));
});

render(normalize(location.pathname));
