// import
import { loadPage } from "./page.js";
import { hiddenBtn } from "./button.js";
import { logout } from "./auth.js";
import { loadComponent } from "./component.js";
import { setupModal, setupDetailModal, setupPilihTeknisiModal, setupTeknisiModal, setupStatusModal } from "./modal.js";
import { loadDataLaporan } from "./laporan.js";
import { loadDataTeknisi, loadDataPenunjukan } from "./teknisi.js";
import { loadDashboardData } from "./dashboard.js";

const user = window.dataSession.getData('login');

// export func
export function dashboardLink() {
  const btn1 = document.getElementById("daftar-laporan-link");
  const btn2 = document.querySelector("#nav-input");

  if (btn1 && btn2) {
    btn1.addEventListener("click", (e) => {
      e.preventDefault();
      btn2.click();
    });
  }
}

export async function loadSidebar(sidebar) {
  try {
    const res = await fetch(`./component/${sidebar}.html`);
    const html = await res.text();

    document.getElementById('sidebar').innerHTML = html;
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', logout)
  } catch (err) {
    console.error('[loadSidebar]', err);
  }
}

// tampilan navigasi
document.addEventListener('click', (e) => {
  const link = e.target.closest('.sidebar-link');
  if (!link) return;

  e.preventDefault();

  document.querySelectorAll('.sidebar-link').forEach(l => {
    l.classList.remove('bg-blue-100', 'text-blue-600');
    l.classList.add('text-gray-700');
  });

  link.classList.remove('text-gray-700');
  link.classList.add('bg-blue-100', 'text-blue-600');

  const page = link.dataset.page;
  if (page) loadPage(page);
});

export function setActiveLink(link) {
  document.querySelectorAll('.sidebar-link').forEach(l => {
    l.classList.remove('bg-blue-100', 'text-blue-600');
    l.classList.add('text-gray-700');
  });

  link.classList.remove('text-gray-700');
  link.classList.add('bg-blue-100', 'text-blue-600');
}

export async function handlePage(page) {
  await loadPage(page);

  switch (page) {
    case "daftar-laporan":
      await loadComponent("tabel-daftar", "tabel-daftar");
      await loadComponent("form-popup", "form-popup");
      await loadComponent("confirmation", "confirmation-popup");
      await loadComponent("detail-kerusakan", "detail-kerusakan");
      setupModal();
      setupDetailModal();
      if (user.role === "admin") {
        await loadDataLaporan("Detail", "Edit");
      } else if (user.role === "teknisi") {
        await loadDataLaporan("Detail");
        hiddenBtn("btn-tambah-data");
      } else if (user.role === "user") {
        await loadDataLaporan("Detail");
      }
      break;

    case "status-laporan":
      await loadComponent("tabel-daftar", "tabel-daftar");
      await loadComponent("edit-status", "edit-status-popup");
      await loadComponent("confirmation", "confirmation-popup");
      await loadComponent("detail-kerusakan", "detail-kerusakan");
      setupStatusModal();
      setupDetailModal();
      await loadDataLaporan("Edit status");
      break;

    case "penunjukan-teknisi":
      await loadComponent("list-teknisi", "list-teknisi");
      await loadComponent("tabel-daftar", "tabel-daftar");
      await loadComponent("form-teknisi", "form-teknisi-popup");
      await loadComponent("confirmation", "confirmation-popup");
      await loadComponent("pilih-teknisi", "pilih-teknisi-popup");
      setupTeknisiModal();
      setupPilihTeknisiModal();
      await loadDataTeknisi(true);
      await loadDataLaporan("Pilih teknisi");
      break;

    case "lihat-teknisi":
      await loadComponent("lihat-list-teknisi", "lihat-list-teknisi");
      await loadComponent("tabel-penunjukan-laporan", "tabel-penunjukan-laporan");
      await loadDataTeknisi(false);
      await loadDataPenunjukan();
      break;

    case "tugas-teknisi":
      await loadComponent("tabel-penunjukan-laporan", "tabel-penunjukan-laporan");
      await loadDataPenunjukan(user.username);
      setupDetailModal();
      break;

    case "dashboard":
      dashboardLink();
      await loadDashboardData();
      break;
  }
}

export function initNavigation(currentPage) {

  document.addEventListener('click', async (e) => {
    const link = e.target.closest('.sidebar-link');
    if (!link) return;

    e.preventDefault();

    const page = link.dataset.page;
    if (!page) return;

    setActiveLink(link);
    await handlePage(page);
  });

  // halaman aktif saat pertama kali load
  const currentLink = document.querySelector(
    `.sidebar-link[data-page="${currentPage}"]`
  );

  if (currentLink) {
    setActiveLink(currentLink);
    handlePage(currentPage);
  }
}