// import
import { initCards } from "./modal.js";
import { initButtons } from "./button.js";

// export function
export async function loadPage(page) {
  try {
    const res1 = await fetch(`./pages/${page}.html`);
    const html1 = await res1.text();

    document.getElementById('app').innerHTML = html1;

    // re-init setelah inject
    initCards();
    initButtons();

    const res = await fetch(`./pages/${page}.html`);

    if (!res.ok) {
      throw new Error('Halaman tidak ditemukan');
    }

    const html = await res.text();

    const app = document.getElementById('app');
    app.innerHTML = html;

  } catch (err) {
    console.error('[loadPage]', err);
    document.getElementById('app').innerHTML = `
      <h1 class="text-red-500">Halaman tidak ditemukan</h1>
    `;
  }
}