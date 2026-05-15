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

async function showAlert(type, message) {
  try {
    const res = await fetch('./component/alert.html');
    const htmlText = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    const alertElement = doc.querySelector(`.alert-${type}`);
    if (alertElement) {
      alertElement.querySelector('span').textContent = message;
      alertElement.classList.add('transition-all', 'duration-300', 'transform', '-translate-y-4', 'opacity-0', 'pointer-events-auto', 'bg-white', 'shadow-lg');

      const container = document.getElementById('alert-container');
      if (container) {
        const clone = alertElement.cloneNode(true);
        container.appendChild(clone);

        requestAnimationFrame(() => {
          clone.classList.remove('-translate-y-4', 'opacity-0');
        });

        setTimeout(() => {
          clone.classList.add('-translate-y-4', 'opacity-0');
          setTimeout(() => clone.remove(), 300);
        }, 3000);
      }
    }
  } catch (err) {
    console.error('Error showing alert:', err);
  }
}

async function showConfirm(message) {
  const modal = document.getElementById('modal-konfirmasi');
  if (!modal) return confirm(message); // fallback jika HTML tidak ada

  const desc = document.getElementById('konfirmasi-desc');
  if (desc) desc.textContent = message;

  return new Promise((resolve) => {
    const handleClose = () => {
      modal.removeEventListener('close', handleClose);
      resolve(modal.returnValue === 'ya');
      modal.returnValue = ''; // reset setelah ditutup
    };
    modal.addEventListener('close', handleClose);
    modal.showModal();
  });
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
      await loadComponent("confirmation", "confirmation-popup");
      await loadComponent("detail-kerusakan", "detail-kerusakan");
      setupModal();
      setupDetailModal();
      await loadDataLaporan("Detail"); // Ambil & tampilkan data dinamis
    } else if (page == "status-laporan") {
      await loadComponent("tabel-daftar", "tabel-daftar");
      await loadComponent("edit-status", "edit-status-popup");
      await loadComponent("confirmation", "confirmation-popup");
      await loadComponent("detail-kerusakan", "detail-kerusakan");
      setupStatusModal();
      setupDetailModal();
      await loadDataLaporan("Edit status"); // Ambil & tampilkan data dinamis
    } else if (page == "penunjukan-teknisi") {
      await loadComponent("list-teknisi", "list-teknisi");
      await loadComponent("tabel-daftar", "tabel-daftar");
      await loadDataLaporan("Pilih teknisi"); // Ambil & tampilkan data dinamis
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

// Render data laporan ke tabel
async function loadDataLaporan(...items) {
  const tbody = document.querySelector('#tabel-daftar tbody');
  if (!tbody) return;

  try {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-500">Memuat data dari server...</td></tr>';

    // Panggil API getLaporan
    const response = await window.api.getLaporan();

    if (response.success && response.data) {
      window.laporanData = response.data; // Simpan data di global variable untuk edit
      tbody.innerHTML = ''; // bersihkan tabel

      // td custom untuk tombol spesifik
      function tdCustom(id, namaButton) {
        if (namaButton == "") return '';
        return `<button data-id="${id}" class="btn-${namaButton.toLowerCase().replace(" ", "-")} rounded-lg bg-lime-100 px-2 py-1 text-xs font-medium text-lime-700 transition hover:bg-lime-200 sm:px-3 sm:py-1.5 sm:text-sm cursor-pointer">${namaButton}</button>`;
      }

      response.data.forEach(item => {
        // Tentukan styling badge berdasarkan status & kategori
        let statusBadge = '';
        if (item.status === 'selesai') statusBadge = '<span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"><span class="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>Selesai</span>';
        else if (item.status === 'proses') statusBadge = '<span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"><span class="h-1.5 w-1.5 rounded-full bg-amber-600"></span>Proses</span>';
        else statusBadge = '<span class="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800"><span class="h-1.5 w-1.5 rounded-full bg-rose-600"></span>Menunggu</span>';

        let catBadge = '';
        if (item.kategori === 'rusak ringan') catBadge = 'bg-emerald-100 text-emerald-800';
        else if (item.kategori === 'rusak sedang') catBadge = 'bg-amber-100 text-amber-800';
        else if (item.kategori === 'rusak berat') catBadge = 'bg-rose-100 text-rose-800';
        else catBadge = 'bg-gray-100 text-gray-800';

        const imgSrc = item.foto && !item.foto.startsWith('http') && !item.foto.startsWith('data:image')
          ? `http://localhost:3000/${item.foto}`
          : (item.foto || 'https://via.placeholder.com/150');

        const tr = document.createElement('tr');
        tr.className = 'transition hover:bg-lime-50';
        tr.innerHTML = `
          <td class="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 lg:px-6 lg:py-3.5">
            <img src="${imgSrc}" alt="Foto" class="h-14 w-14 flex-shrink-0 rounded-lg object-cover ring-2 ring-lime-200 sm:h-16 sm:w-16" onerror="this.src='https://via.placeholder.com/150'" />
          </td>
          <td class="px-2 py-2 text-slate-600 sm:px-3 sm:py-2.5 md:px-4 md:py-3 lg:px-6 lg:py-3.5">
            <div class="max-w-xs">
              <p class="font-medium text-slate-800">${item.judul}</p>
              <p class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">${item.deskripsi}</p>
            </div>
          </td>
          <td class="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 lg:px-6 lg:py-3.5">
            <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${catBadge}">${item.kategori || '-'}</span>
          </td>
          <td class="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 lg:px-6 lg:py-3.5">
            <div class="flex items-center gap-2">
              <div class="min-w-0">
                <div class="truncate font-medium text-slate-800">${item.teknisi || 'Belum ditugaskan'}</div>
              </div>
            </div>
          </td>
          <td class="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 lg:px-6 lg:py-3.5">
            ${statusBadge}
          </td>
          <td class="px-2 py-2 text-center sm:px-3 sm:py-2.5 md:px-4 md:py-3 lg:px-6 lg:py-3.5">
            <div class="flex flex-col gap-1 sm:flex-row sm:justify-center sm:gap-1.5">
              ${items.length != 0? items.map(btn => tdCustom(item.id, btn)).join(''): ''}
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Event listener detail laporan
      tbody.onclick = async (e) => {
        if (e.target.classList.contains('btn-detail') || e.target.closest('.btn-detail')) {
          const btn = e.target.classList.contains('btn-detail') ? e.target : e.target.closest('.btn-detail');
          const id = btn.getAttribute('data-id');
          const item = window.laporanData.find(i => i.id == id);
          if (item) {
            if (typeof window.openModalDetail === 'function') {
              window.openModalDetail(item);
            }
          }
        } else if (e.target.classList.contains('btn-edit')) {
          const id = e.target.getAttribute('data-id');
          const item = window.laporanData.find(i => i.id == id);
          if (item) {
            if (typeof window.openModalEdit === 'function') {
              window.openModalEdit(item);
            }
          }
        } else if (e.target.classList.contains('btn-edit-status')) {
          const id = e.target.getAttribute('data-id');
          const item = window.laporanData.find(i => i.id == id);
          if (item) {
            if (typeof window.openModalStatus === 'function') {
              window.openModalStatus(item);
            }
          }
        } else if (e.target.classList.contains('btn-hapus')) {
          const isConfirmed = await showConfirm('Apakah Anda yakin ingin menghapus data ini?');
          if (isConfirmed) {
            const id = e.target.getAttribute('data-id');
            e.target.innerHTML = 'Menghapus...';
            e.target.disabled = true;
            try {
              const res = await window.api.deleteLaporan(id);
              if (res.success) {
                showAlert('success', 'Data berhasil dihapus!');
                loadDataLaporan(); // muat ulang
              } else {
                showAlert('error', 'Gagal menghapus data.');
              }
            } catch (err) {
              console.error(err);
              showAlert('error', 'Gagal menghapus data.');
            }
          }
        }
      };
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Gagal memuat data laporan</td></tr>';
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Terjadi kesalahan koneksi</td></tr>';
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
// Modal ini digunakan untuk menambah laporan
function setupModal() {
  const btnTambah = document.getElementById('btn-tambah-data');
  const modal = document.getElementById('modal-tambah');
  const btnClose = document.getElementById('btn-close-modal');
  const btnBatal = document.getElementById('btn-batal');
  const backdrop = document.getElementById('modal-backdrop');
  const inputFoto = document.getElementById('input-foto');
  const previewContainer = document.getElementById('preview-foto');
  const imgPreview = document.getElementById('img-preview');

  let editId = null;

  function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Set default waktu untuk data baru
    const inputWaktu = document.getElementById('input-waktu');
    if (inputWaktu) {
      inputWaktu.value = new Date().toISOString();
    }
  }

  // Terekspos ke window agar bisa dipanggil dari tbody.onclick
  window.openModalEdit = function (data) {
    editId = data.id;
    document.getElementById('input-judul').value = data.judul || '';
    document.getElementById('input-deskripsi').value = data.deskripsi || '';
    document.getElementById('input-kategori').value = data.kategori || '';
    document.getElementById('input-teknisi').value = data.teknisi || '';
    document.getElementById('input-status').value = data.status || 'menunggu';

    if (data.foto) {
      const imgSrc = data.foto && !data.foto.startsWith('http') && !data.foto.startsWith('data:image')
        ? `http://localhost:3000/${data.foto}`
        : data.foto;
      imgPreview.src = imgSrc;
      previewContainer.classList.remove('hidden');
    } else {
      imgPreview.src = '';
      previewContainer.classList.add('hidden');
    }

    const inputWaktu = document.getElementById('input-waktu');
    if (inputWaktu) {
      inputWaktu.value = data.createdAt || data.created_at || '';
    }

    const titleEl = document.querySelector('#modal-tambah h2');
    if (titleEl) titleEl.textContent = 'Edit Data Laporan';

    openModal();
  };

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    // Reset form
    editId = null;
    const titleEl = document.querySelector('#modal-tambah h2');
    if (titleEl) titleEl.textContent = 'Tambah Data Laporan';
    document.getElementById('form-tambah').reset();
    previewContainer.classList.add('hidden');
    imgPreview.src = '';
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

  const btnSimpan = document.getElementById('btn-simpan');
  if (btnSimpan) {
    btnSimpan.addEventListener('click', async function () {
      const data = {
        judul: document.getElementById('input-judul').value,
        deskripsi: document.getElementById('input-deskripsi').value,
        kategori: document.getElementById('input-kategori').value,
        teknisi: document.getElementById('input-teknisi').value,
        status: document.getElementById('input-status').value,
        foto: imgPreview.src || '',
        createdAt: document.getElementById('input-waktu').value
      };

      const originalText = btnSimpan.innerHTML;
      btnSimpan.innerHTML = 'Menyimpan...';
      btnSimpan.disabled = true;

      try {
        let response;
        if (editId) {
          response = await window.api.updateLaporan(editId, data);
        } else {
          response = await window.api.sendLaporan(data);
        }

        if (response && response.success) {
          showAlert('success', editId ? 'Data berhasil diupdate!' : 'Data berhasil disimpan!');
          closeModal();
          loadDataLaporan(); // Reload table
        } else {
          showAlert('error', 'Gagal menyimpan data ke database');
        }
      } catch (err) {
        console.error(err);
        showAlert('error', 'Gagal menyimpan data');
      } finally {
        btnSimpan.innerHTML = originalText;
        btnSimpan.disabled = false;
      }
    });
  }
}

// Modal Detail Kerusakan
// Detail dari data kerusakan berbentuk kartu
function setupDetailModal() {
  const modalDetail = document.getElementById('modal-detail');
  const btnClose = document.getElementById('btn-close-detail');
  const btnTutup = document.getElementById('btn-tutup-detail');

  function closeDetailModal() {
    if (modalDetail) {
      modalDetail.classList.add('hidden');
      modalDetail.classList.remove('flex');
    }
  }

  if (btnClose) btnClose.addEventListener('click', closeDetailModal);
  if (btnTutup) btnTutup.addEventListener('click', closeDetailModal);

  window.openModalDetail = function (data) {
    if (!modalDetail) return;

    document.getElementById('detail-judul').textContent = data.judul || '-';
    document.getElementById('detail-deskripsi').textContent = data.deskripsi || '-';
    document.getElementById('detail-kategori').textContent = data.kategori || '-';
    document.getElementById('detail-teknisi').textContent = data.teknisi || 'Belum ditugaskan';

    // Status badge styling
    const statusEl = document.getElementById('detail-status');
    statusEl.textContent = data.status || '-';
    if (data.status === 'selesai') {
      statusEl.className = 'inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
    } else if (data.status === 'proses') {
      statusEl.className = 'inline-block rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
    } else {
      statusEl.className = 'inline-block rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
    }

    // Category badge styling
    const catEl = document.getElementById('detail-kategori');
    catEl.textContent = data.kategori || '-';
    if (data.kategori === 'rusak ringan') {
      catEl.className = 'inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
    } else if (data.kategori === 'rusak sedang') {
      catEl.className = 'inline-block rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
    } else if (data.kategori === 'rusak berat') {
      catEl.className = 'inline-block rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
    } else {
      catEl.className = 'inline-block rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
    }

    // Format tanggal jika ada
    const rawDate = data.createdAt || data.created_at;
    const tanggalStr = rawDate ? new Date(rawDate).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '-';
    const tglEl = document.getElementById('detail-tanggal');
    if (tglEl) tglEl.textContent = tanggalStr;

    const imgEl = document.getElementById('detail-foto');
    if (imgEl) {
      const imgSrc = data.foto && !data.foto.startsWith('http') && !data.foto.startsWith('data:image')
        ? `http://localhost:3000/${data.foto}`
        : (data.foto || 'https://via.placeholder.com/400x200?text=No+Image');
      imgEl.src = imgSrc;
    }

    modalDetail.classList.remove('hidden');
    modalDetail.classList.add('flex');
  };
}

// Modal Ubah Status
function setupStatusModal() {
  const modal = document.getElementById('modal-status');
  const btnClose = document.getElementById('btn-close-status');
  const btnBatal = document.getElementById('btn-batal-status');
  const backdrop = document.getElementById('modal-status-backdrop');
  const btnSimpan = document.getElementById('btn-save-status');
  const inputStatus = document.getElementById('input-edit-status');
  const titleEl = document.getElementById('status-laporan-judul');

  let currentId = null;

  function openModal() {
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    currentId = null;
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnBatal) btnBatal.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  window.openModalStatus = function (data) {
    currentId = data.id;
    if (titleEl) titleEl.textContent = data.judul || '-';
    if (inputStatus) inputStatus.value = data.status || 'menunggu';
    openModal();
  };

  if (btnSimpan) {
    btnSimpan.addEventListener('click', async function () {
      if (!currentId) return;

      const newStatus = inputStatus.value;
      const originalText = btnSimpan.innerHTML;
      
      btnSimpan.innerHTML = 'Menyimpan...';
      btnSimpan.disabled = true;

      try {
        // Kita hanya update status, tapi API updateLaporan butuh data lengkap jika mengikuti backend saat ini
        // Namun backend router/laporan.js PUT /:id mengambil semua field dari req.body
        // Jadi kita ambil data lama dan ganti statusnya
        const item = window.laporanData.find(i => i.id == currentId);
        const updateData = { ...item, status: newStatus };

        const response = await window.api.updateLaporan(currentId, updateData);

        if (response && response.success) {
          showAlert('success', 'Status laporan berhasil diperbarui!');
          closeModal();
          loadDataLaporan("Edit status"); // Reload table with buttons
        } else {
          showAlert('error', 'Gagal memperbarui status.');
        }
      } catch (err) {
        console.error(err);
        showAlert('error', 'Terjadi kesalahan saat menyimpan.');
      } finally {
        btnSimpan.innerHTML = originalText;
        btnSimpan.disabled = false;
      }
    });
  }
}