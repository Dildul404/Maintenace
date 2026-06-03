let activeAssignLaporanId = null;

// import
import { showAlert } from "./alert.js";
import { showConfirm } from "./confirm.js";

// export function
export async function loadDataTeknisi(btn) {
  const container = document.getElementById('teknisi-list-container');
  if (!container) return;

  try {
    container.innerHTML = '<div class="p-4 text-center text-slate-500 text-sm">Memuat data teknisi...</div>';

    const response = await window.api.getTeknisi();

    if (response && response.success && response.data && response.data.length > 0) {
      container.innerHTML = '';

      response.data.forEach(item => {
        const imgSrc = item.foto && !item.foto.startsWith('http') && !item.foto.startsWith('data:image')
          ? `http://localhost:3000/${item.foto}`
          : (item.foto || 'https://via.placeholder.com/150');

        const div = document.createElement('div');
        div.className = 'p-3 flex items-center justify-between hover:bg-slate-50 transition duration-150 border-b border-gray-100';

        let catBadgeColor = 'bg-indigo-50 text-indigo-700 border border-indigo-100';
        if (item.kategori.includes('Elektronik')) catBadgeColor = 'bg-blue-50 text-blue-700 border border-blue-100';
        else if (item.kategori.includes('Furniture')) catBadgeColor = 'bg-amber-50 text-amber-700 border border-amber-100';
        else if (item.kategori.includes('Plambing')) catBadgeColor = 'bg-cyan-50 text-cyan-700 border border-cyan-100';
        else if (item.kategori.includes('Listrik')) catBadgeColor = 'bg-yellow-50 text-yellow-700 border border-yellow-100';
        else if (item.kategori.includes('Bangunan')) catBadgeColor = 'bg-rose-50 text-rose-700 border border-rose-100';

        div.innerHTML = `
          <div class="flex items-center gap-3">
            <img src="${imgSrc}" alt="${item.nama}" class="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100" onerror="this.src='https://via.placeholder.com/150'" />
            <div class="min-w-0">
              <p class="font-medium text-slate-800 text-sm truncate">${item.nama}</p>
              <span class="inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium mt-0.5 ${catBadgeColor}">${item.kategori}</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            ${btn == true ? `
              <button data-id="${item.id}" class="btn-hapus-teknisi text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            ` : `
            `}
          </div>
        `;
        container.appendChild(div);
      });

      // Bind events for delete & assign
      container.querySelectorAll('.btn-hapus-teknisi').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const isConfirmed = await showConfirm('Apakah Anda yakin ingin menghapus teknisi ini?');
          if (isConfirmed) {
            try {
              const res = await window.api.deleteTeknisi(id);
              if (res.success) {
                showAlert('success', 'Teknisi berhasil dihapus!');
                await loadDataTeknisi();
              } else {
                showAlert('error', 'Gagal menghapus teknisi.');
              }
            } catch (err) {
              console.error(err);
              showAlert('error', 'Gagal menghapus teknisi.');
            }
          }
        });
      });

      container.querySelectorAll('.btn-tunjuk-teknisi').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const namaTeknisi = btn.getAttribute('data-nama');
          if (activeAssignLaporanId && namaTeknisi) {
            try {
              btn.innerHTML = '...';
              btn.disabled = true;

              const item = window.laporanData.find(i => i.id == activeAssignLaporanId);
              const updateData = { ...item, teknisi: namaTeknisi, status: 'proses' };

              const res = await window.api.updateLaporan(activeAssignLaporanId, updateData);
              if (res.success) {
                showAlert('success', `Teknisi ${namaTeknisi} berhasil ditunjuk!`);
                activeAssignLaporanId = null;
                await loadDataTeknisi();
                await loadDataLaporan("Pilih teknisi");
              } else {
                showAlert('error', 'Gagal menunjuk teknisi.');
              }
            } catch (err) {
              console.error(err);
              showAlert('error', 'Gagal menunjuk teknisi.');
            }
          }
        });
      });

    } else {
      container.innerHTML = '<div class="p-4 text-center text-slate-400 text-sm">Belum ada data teknisi.</div>';
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="p-4 text-center text-red-500 text-sm">Gagal memuat data teknisi.</div>';
  }
}

export async function loadDataPenunjukan(user, btn) {
  const table = document.querySelector('#tabel-penunjukan-laporan');
  const thead = table.querySelector('thead');
  const trow = thead.querySelector('tr');
  const tbody = table.querySelector('tbody');

  if (btn) {
    trow.innerHTML += `
        <th class="px-2 py-2 text-left font-semibold sm:px-3 sm:py-2.5 md:px-4 md:py-3 lg:px-6 lg:py-3.5">Aksi</th>
        `;
  }

  try {
    tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-slate-500">
                    Memuat data dari server...
                </td>
            </tr>
        `;

    const response = await window.api.getPenunjukan();

    if (response.success && response.data) {
      window.penunjukanData = response.data;

      tbody.innerHTML = '';


      response.data.forEach((item, index) => {
        if (user != undefined) {
          if (item.Teknisi?.nama == user) {
            const tr = document.createElement('tr');

            let statusBadge = '';
            if (item.status === 'sukses') statusBadge = 'bg-emerald-100 text-emerald-800';
            else if (item.status === 'berlangsung') statusBadge = 'bg-amber-100 text-amber-800';
            else if (item.status === 'dibatalkan') statusBadge = 'bg-rose-100 text-rose-800';

            tr.className = 'transition hover:bg-lime-50';

            const awal = item.awal
              ? new Date(item.awal).toLocaleString('id-ID')
              : '-';

            const akhir = item.akhir
              ? new Date(item.akhir).toLocaleString('id-ID')
              : '-';

            tr.innerHTML = `
                    <td class="px-4 py-3">
                        ${index + 1}
                    </td>

                    <td class="px-4 py-3">
                        ${item.Laporan?.judul || '-'}
                    </td>

                    <td class="px-4 py-3">
                        ${item.Teknisi?.nama || '-'}
                    </td>

                    <td class="px-4 py-3">
                        ${awal}
                    </td>

                    <td class="px-4 py-3">
                        ${akhir}
                    </td>

                    <td class="px-4 py-3">
                        <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge}">${item.status}</span>
                    </td>

                    ${btn == true ? ` <td class="px-4 py-3">
                        <button data-id="${item.id}" data-laporan-id="${item.id_laporan}" class="btn-detail-edit-laporan rounded-lg bg-lime-100 px-2 py-1 text-xs font-medium text-lime-700 transition hover:bg-lime-200 sm:px-3 sm:py-1.5 sm:text-sm cursor-pointer">Detail / Edit</button>
                    </td>` : ``}
                `;

            tbody.appendChild(tr);
          } else {
            return
          }
        } else {
          const tr = document.createElement('tr');

          let statusBadge = '';
          if (item.status === 'sukses') statusBadge = 'bg-emerald-100 text-emerald-800';
          else if (item.status === 'berlangsung') statusBadge = 'bg-amber-100 text-amber-800';
          else if (item.status === 'dibatalkan') statusBadge = 'bg-rose-100 text-rose-800';

          tr.className = 'transition hover:bg-lime-50';

          const awal = item.awal
            ? new Date(item.awal).toLocaleString('id-ID')
            : '-';

          const akhir = item.akhir
            ? new Date(item.akhir).toLocaleString('id-ID')
            : '-';

          tr.innerHTML = `
                    <td class="px-4 py-3">
                        ${index + 1}
                    </td>

                    <td class="px-4 py-3">
                        ${item.Laporan?.judul || '-'}
                    </td>

                    <td class="px-4 py-3">
                        ${item.Teknisi?.nama || '-'}
                    </td>

                    <td class="px-4 py-3">
                        ${awal}
                    </td>

                    <td class="px-4 py-3">
                        ${akhir}
                    </td>

                    <td class="px-4 py-3">
                        <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge}">${item.status}</span>
                    </td>

                    ${btn == true ? ` <td class="px-4 py-3">
                        <button data-id="${item.id}" data-laporan-id="${item.id_laporan}" class="btn-detail-edit-laporan rounded-lg bg-lime-100 px-2 py-1 text-xs font-medium text-lime-700 transition hover:bg-lime-200 sm:px-3 sm:py-1.5 sm:text-sm cursor-pointer">Detail / Edit</button>
                    </td>` : ``}
                `;

          tbody.appendChild(tr);
        }
      });

      if (response.data.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-4 text-slate-500">
                            Tidak ada data penunjukan
                        </td>
                    </tr>
                `;
      }

    } else {
      tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-red-500">
                        Gagal memuat data penunjukan
                    </td>
                </tr>
            `;
    }

    // Panggil API getLaporan
    const responseLaporan = await window.api.getLaporan();
    window.laporanData = (responseLaporan && responseLaporan.success) ? responseLaporan.data : [];

    document.querySelectorAll(".btn-detail-edit-laporan").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const btn = e.target.classList.contains('btn-detail-edit-laporan') ? e.target : e.target.closest('.btn-detail-edit-laporan');
        const penunjukanId = btn.getAttribute('data-id');
        const laporanId = btn.getAttribute('data-laporan-id');
        console.log("laporanId:", laporanId, "penunjukanId:", penunjukanId);
        const item = window.laporanData.find(i => i.id == laporanId);
        const penunjukanItem = window.penunjukanData.find(p => p.id == penunjukanId);
        if (item) {
          if (typeof window.openModalDetailPenunjukan === 'function') {
            window.openModalDetailPenunjukan(item, penunjukanItem);
          }
        }
      });
    });

  } catch (err) {
    console.error(err);

    tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-red-500">
                    Terjadi kesalahan koneksi
                </td>
            </tr>
        `;
  }
}