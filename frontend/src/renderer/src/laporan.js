// import
import { setupStatusModal, openModalPilihTeknisi } from "./modal.js";
import { showAlert } from "./alert.js";

// export function
export async function loadDataLaporan(...items) {
    const table = document.querySelector('#tabel-daftar');
    const verifikasi = table.getAttribute('verifikasi');
    const tbody = table.querySelector('tbody');

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
                if (verifikasi == 1) {

                }
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
                      ${items.length != 0 ? items.map(btn => tdCustom(item.id, btn)).join('') : ''}
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
                        if (item.status === "selesai") {
                            showAlert('info', 'Laporan sudah selesai!');
                            return;
                        } else {
                            if (typeof window.openModalEdit === 'function') {
                                window.openModalEdit(item);
                            }
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
                } else if (e.target.classList.contains('btn-pilih-teknisi')) {
                    const id = e.target.getAttribute('data-id');
                    const item = window.laporanData.find(i => i.id == id);
                    if (item && item.status === "selesai") {
                        showAlert('info', 'Laporan sudah di proses!');
                        return;
                    } else {
                        openModalPilihTeknisi(id);
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

function verifikasi(tbody, verifikasi) {
    if (verifikasi == 1) {

    } else if (verifikasi == 2) {

    }
}