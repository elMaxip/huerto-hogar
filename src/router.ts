type Route = {
  tag: string;
  title: string;
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
};

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

function markActiveLinks(path: string) {
  const navbar = document.querySelector("nav-bar");

  // Los enlaces viven dentro del shadow root, document.querySelectorAll no los ve
  const links =
    navbar?.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? [];

  for (const link of links) {
    if (normalize(new URL(link.href).pathname) === path) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

async function render(path: string) {
  const route = routes[path];

  markActiveLinks(path);

  if (!route) {
    document.title = "Página no encontrada";
    outlet.replaceChildren(notFound(path));
    return;
  }

  const navigation = ++currentNavigation;
  await route.load();

  if (navigation !== currentNavigation) return;

  document.title = route.title;
  outlet.replaceChildren(document.createElement(route.tag));
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
