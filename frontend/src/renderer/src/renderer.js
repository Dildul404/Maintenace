// -------------------------------------
// global functions
// -------------------------------------
async function loadComponent(component, targetId) {
  try {
    const res = await fetch(`./component/${component}.html`);
    const html = await res.text();

    document.getElementById(targetId).innerHTML = html;
  } catch (err) {
    console.error('[loadComponent]', err);
  }
}

// -------------------------------------
// sidebar
// -------------------------------------
async function loadSidebar() {
  try {
    const res = await fetch('./component/sidebar.html');
    const html = await res.text();

    document.getElementById('sidebar').innerHTML = html;
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

// animasi card
function initCards() {
  document.querySelectorAll('.card-hover').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });
}

// Button loading
function initButtons() {
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function () {
      if (this.classList.contains('bg-gradient')) {
        const originalText = this.innerHTML;
        this.innerHTML = 'Processing...';
        this.disabled = true;

        setTimeout(() => {
          this.innerHTML = originalText;
          this.disabled = false;
        }, 2000);
      }
    });
  });
}

// -------------------------------------
// navigasi
// -------------------------------------
function initNavigation() {
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('.sidebar-link');
    if (!link) return;

    e.preventDefault();
    console.log('cek');

    const page = link.getAttribute('data-page');
    if (!page) return;

    // Update active class
    document.querySelectorAll('.sidebar-link').forEach(l => {
      l.classList.remove('bg-blue-100', 'text-blue-600');
      l.classList.add('text-gray-700');
    });

    link.classList.remove('text-gray-700');
    link.classList.add('bg-blue-100', 'text-blue-600');

    // Load page
    await loadPage(page);
    if (page == "daftar-laporan") {
      await loadComponent("tabel-daftar", "tabel-daftar");
      await loadComponent("form-popup", "form-popup");
      setupModal();
    }
  });
}

async function loadPage(page) {
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

document.addEventListener('DOMContentLoaded', async () => {
  await loadSidebar();
  initNavigation();

  loadPage('dashboard'); // default page
});

// --------------------------------
// Form popup
// --------------------------------

// Modal Tambah Data
function setupModal() {
  const btnTambah = document.getElementById('btn-tambah-data');
  const modal = document.getElementById('modal-tambah');
  const btnClose = document.getElementById('btn-close-modal');
  const btnBatal = document.getElementById('btn-batal');
  const backdrop = document.getElementById('modal-backdrop');
  const inputFoto = document.getElementById('input-foto');
  const previewContainer = document.getElementById('preview-foto');
  const imgPreview = document.getElementById('img-preview');

  function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    // Reset form
    document.getElementById('form-tambah').reset();
    previewContainer.classList.add('hidden');
  }

  if (btnTambah) btnTambah.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnBatal) btnBatal.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  // Preview foto
  if (inputFoto) {
    inputFoto.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          imgPreview.src = ev.target.result;
          previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Simpan (placeholder)
  const btnSimpan = document.getElementById('btn-simpan');
  if (btnSimpan) {
    btnSimpan.addEventListener('click', function () {
      alert('Data berhasil disimpan!');
      closeModal();
    });
  }
}