import { registerPage } from "../app.js";

function setupAccordions() {
  document.querySelectorAll("[data-accordion]").forEach((item) => {
    const button = item.querySelector("button");
    const panel = item.querySelector("[data-accordion-panel]");
    if (!button || !panel) return;

    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  });
}

registerPage("about", async () => {
  setupAccordions();
});
