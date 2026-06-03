// export var
export let activeAssignLaporanIdForModal = null;

// import
import { loadDataLaporan } from "./laporan.js";
import { loadDataTeknisi, loadDataPenunjukan } from "./teknisi.js";
import { showAlert } from "./alert.js";

// export func
export function initCards() {
    document.querySelectorAll('.card-hover').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

export function setupModal() {
    if (window.modalInitialized) return;
    window.modalInitialized = true;

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
            const judul = document.getElementById('input-judul');
            const deskripsi = document.getElementById('input-deskripsi');
            const kategori = document.getElementById('input-kategori');

            if (!judul.value.trim()) {
                showAlert('error', 'Judul wajib diisi');
                judul.focus();
                return;
            }

            if (!deskripsi.value.trim()) {
                showAlert('error', 'Deskripsi wajib diisi');
                deskripsi.focus();
                return;
            }

            if (!kategori.value) {
                showAlert('error', 'Kategori wajib dipilih');
                kategori.focus();
                return;
            }

            if (!editId && !inputFoto.files.length) {
                showAlert('error', 'Foto wajib dipilih');
                inputFoto.focus();
                return;
            }

            const data = {
                judul: judul.value.trim(),
                deskripsi: deskripsi.value.trim(),
                kategori: kategori.value,
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
                    showAlert(
                        'success',
                        editId
                            ? 'Data berhasil diupdate!'
                            : 'Data berhasil disimpan!'
                    );

                    closeModal();
                    await loadDataLaporan('Detail', 'Edit');
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

export function setupDetailModal() {
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

        // Format tanggal selesai jika ada & status selesai
        const tglSelesaiContainer = document.getElementById('detail-tanggal-selesai-container');
        const tglSelesaiEl = document.getElementById('detail-tanggal-selesai');
        if (tglSelesaiContainer && tglSelesaiEl) {
            if (data.status === 'selesai') {
                const rawSelesaiDate = data.updated_at || data.updatedAt;
                const tanggalSelesaiStr = rawSelesaiDate ? new Date(rawSelesaiDate).toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '-';
                tglSelesaiEl.textContent = tanggalSelesaiStr;
                tglSelesaiContainer.classList.remove('hidden');
            } else {
                tglSelesaiContainer.classList.add('hidden');
            }
        }

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

export function setupStatusModal() {
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
        if (data.teknisi === "Belum ditugaskan") {
            showAlert('warning', 'Laporan belum ditugaskan ke teknisi');
            return;
        } else if (data.status === "selesai") {
            showAlert('info', 'Laporan sudah selesai!');
            return;
        } else if (data.status === "ditolak") {
            showAlert('info', 'Laporan sudah ditolak!');
            return;
        }
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

export function setupTeknisiModal() {
    const btnTambah = document.getElementById('btn-tambah-teknisi');
    const modal = document.getElementById('modal-tambah-teknisi');
    const btnClose = document.getElementById('btn-close-teknisi-modal');
    const btnBatal = document.getElementById('btn-batal-teknisi');
    const backdrop = document.getElementById('modal-teknisi-backdrop');
    const inputFoto = document.getElementById('input-teknisi-foto');
    const previewContainer = document.getElementById('preview-teknisi-foto');
    const imgPreview = document.getElementById('img-teknisi-preview');

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

        document.getElementById('form-tambah-teknisi').reset();

        if (previewContainer) {
            previewContainer.classList.add('hidden');
        }

        if (imgPreview) {
            imgPreview.src = '';
        }
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
                    if (imgPreview) {
                        imgPreview.src = ev.target.result;
                    }

                    if (previewContainer) {
                        previewContainer.classList.remove('hidden');
                    }
                };

                reader.readAsDataURL(file);
            }
        });
    }

    const btnSimpan = document.getElementById('btn-simpan-teknisi');

    if (btnSimpan) {
        btnSimpan.addEventListener('click', async function () {
            const namaVal = document.getElementById('input-teknisi-nama').value.trim();
            const emailVal = document.getElementById('input-teknisi-email').value.trim();
            const passwordVal = document.getElementById('input-teknisi-password').value.trim();
            const kategoriVal = document.getElementById('input-teknisi-kategori').value.trim();

            if (!namaVal || !emailVal || !passwordVal || !kategoriVal) {
                showAlert(
                    'error',
                    'Nama, Email, Password, dan Kategori wajib diisi!'
                );
                return;
            }

            const data = {
                nama: namaVal,
                email: emailVal,
                password: passwordVal,
                kategori: kategoriVal,
                foto: (imgPreview && imgPreview.src) || ''
            };

            const originalText = btnSimpan.innerHTML;

            btnSimpan.innerHTML = 'Menyimpan...';
            btnSimpan.disabled = true;

            try {
                const response = await window.api.sendTeknisi(data);

                if (response && response.success) {
                    showAlert(
                        'success',
                        'Teknisi berhasil ditambahkan!'
                    );

                    closeModal();

                    await loadDataTeknisi();
                } else {
                    showAlert(
                        'error',
                        response?.message ||
                        'Gagal menyimpan teknisi ke database'
                    );
                }
            } catch (err) {
                console.error(err);

                showAlert(
                    'error',
                    'Gagal menyimpan data teknisi'
                );
            } finally {
                btnSimpan.innerHTML = originalText;
                btnSimpan.disabled = false;
            }
        });
    }
}

export function setupPilihTeknisiModal() {
    const modal = document.getElementById('modal-pilih-teknisi');
    const btnClose = document.getElementById('btn-close-pilih-teknisi');
    const btnBatal = document.getElementById('btn-batal-pilih-teknisi');
    const backdrop = document.getElementById('modal-pilih-teknisi-backdrop');
    const btnSimpan = document.getElementById('btn-simpan-pilih-teknisi');

    function closeModal() {
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        activeAssignLaporanIdForModal = null;
        // Reset durasi & deadline
        const inputDurasi = document.getElementById('input-durasi-hari');
        const deadlineEl = document.getElementById('pilih-teknisi-deadline');
        if (inputDurasi) inputDurasi.value = '';
        if (deadlineEl) deadlineEl.textContent = 'Isi durasi di atas untuk melihat tenggat';
    }

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnBatal) btnBatal.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Auto-calculate deadline saat durasi diisi
    const inputDurasi = document.getElementById('input-durasi-hari');
    const deadlineEl = document.getElementById('pilih-teknisi-deadline');
    if (inputDurasi && deadlineEl) {
        inputDurasi.addEventListener('input', function () {
            const durasi = parseInt(inputDurasi.value);
            if (durasi && durasi > 0) {
                const now = new Date();
                const deadline = new Date(now.getTime() + durasi * 24 * 60 * 60 * 1000);
                deadlineEl.textContent = deadline.toLocaleDateString('id-ID', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                deadlineEl.classList.remove('text-slate-500');
                deadlineEl.classList.add('text-amber-700', 'font-semibold');
            } else {
                deadlineEl.textContent = 'Isi durasi di atas untuk melihat tenggat';
                deadlineEl.classList.remove('text-amber-700', 'font-semibold');
                deadlineEl.classList.add('text-slate-500');
            }
        });
    }

    if (btnSimpan) {
        btnSimpan.addEventListener('click', async function () {
            if (!activeAssignLaporanIdForModal) return;

            const selectEl = document.getElementById('select-pilih-teknisi');
            const selectVal = selectEl.value;
            if (!selectVal) {
                showAlert('error', 'Silakan pilih teknisi terlebih dahulu!');
                return;
            }

            const durasiVal = parseInt(document.getElementById('input-durasi-hari').value);
            if (!durasiVal || durasiVal <= 0) {
                showAlert('error', 'Silakan isi durasi penyelesaian!');
                return;
            }

            // Hitung deadline
            const now = new Date();
            const deadline = new Date(now.getTime() + durasiVal * 24 * 60 * 60 * 1000);

            // Ambil id_teknisi dari option yang dipilih
            const selectedOption = selectEl.options[selectEl.selectedIndex];
            const idTeknisi = selectedOption.getAttribute('data-id');

            const originalText = btnSimpan.innerHTML;
            btnSimpan.innerHTML = 'Menyimpan...';
            btnSimpan.disabled = true;

            try {
                // Kirim data penunjukan melalui API baru
                const penunjukanData = {
                    id_laporan: activeAssignLaporanIdForModal,
                    id_teknisi: parseInt(idTeknisi),
                    awal: now.toISOString(),
                    akhir: deadline.toISOString()
                };

                const res = await window.api.assignTeknisi(penunjukanData);
                if (res.success) {
                    showAlert('success', `Teknisi ${selectVal} berhasil ditunjuk! Tenggat: ${deadline.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`);
                    closeModal();
                    await loadDataLaporan("Pilih teknisi"); // Reload table
                } else {
                    showAlert('error', res.error || 'Gagal menunjuk teknisi.');
                }
            } catch (err) {
                console.error(err);
                showAlert('error', 'Gagal menunjuk teknisi.');
            } finally {
                btnSimpan.innerHTML = originalText;
                btnSimpan.disabled = false;
            }
        });
    }
}

export async function openModalPilihTeknisi(laporanId) {
    const modal = document.getElementById('modal-pilih-teknisi');
    const judulEl = document.getElementById('pilih-teknisi-judul-laporan');
    const select = document.getElementById('select-pilih-teknisi');
    const tanggalEl = document.getElementById('pilih-teknisi-tanggal-laporan');
    const deadlineEl = document.getElementById('pilih-teknisi-deadline');
    const inputDurasi = document.getElementById('input-durasi-hari');

    if (!modal || !judulEl || !select) return;

    activeAssignLaporanIdForModal = laporanId;

    // Set judul laporan
    const item = window.laporanData.find(i => i.id == laporanId);
    judulEl.textContent = item ? item.judul : '-';

    // Tampilkan tanggal & waktu laporan dibuat
    if (tanggalEl && item) {
        const rawDate = item.createdAt || item.created_at;
        if (rawDate) {
            tanggalEl.textContent = new Date(rawDate).toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } else {
            tanggalEl.textContent = '-';
        }
    }

    // Reset durasi & deadline
    if (inputDurasi) inputDurasi.value = '';
    if (deadlineEl) {
        deadlineEl.textContent = 'Isi durasi di atas untuk melihat tenggat';
        deadlineEl.classList.remove('text-amber-700', 'font-semibold');
        deadlineEl.classList.add('text-slate-500');
    }

    // Load select options with available technicians
    try {
        select.innerHTML = '<option value="">-- Memuat Teknisi... --</option>';
        const response = await window.api.getTeknisi();

        if (response && response.success && response.data && response.data.length > 0) {
            select.innerHTML = '<option value="">-- Pilih Teknisi --</option>';
            response.data.forEach(tek => {
                select.innerHTML += `<option value="${tek.nama}" data-id="${tek.id}">${tek.nama} (${tek.kategori})</option>`;
            });
        } else {
            select.innerHTML = '<option value="">Belum ada data teknisi</option>';
        }
    } catch (err) {
        console.error(err);
        select.innerHTML = '<option value="">Gagal memuat teknisi</option>';
    }

    // Open modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function setupModalDetailPenunjukan() {
    const modalDetail = document.getElementById('modal-edit-penunjukan');
    const btnClose = document.getElementById('btn-close-detail-penunjukan');
    const btnBatal = document.getElementById('btn-batal-status-tugas');
    const btnSimpan = document.getElementById('btn-simpan-status-tugas');
    const inputStatus = document.getElementById('input-status-tugas');

    let currentPenunjukanId = null;

    function closeDetailModalPenunjukan() {
        if (modalDetail) {
            modalDetail.classList.add('hidden');
            modalDetail.classList.remove('flex');
        }
    }

    if (btnClose) {
        btnClose.addEventListener('click', closeDetailModalPenunjukan);
    }
    if (btnBatal) {
        btnBatal.addEventListener('click', closeDetailModalPenunjukan);
    }

    if (btnSimpan) {
        btnSimpan.addEventListener('click', async function () {
            if (!currentPenunjukanId) return;

            const newStatus = inputStatus.value;
            const originalText = btnSimpan.innerHTML;

            btnSimpan.innerHTML = 'Menyimpan...';
            btnSimpan.disabled = true;

            try {
                const response = await window.api.updatePenunjukan(currentPenunjukanId, { status: newStatus });

                if (response && response.success) {
                    showAlert('success', 'Status tugas berhasil diperbarui!');
                    closeDetailModalPenunjukan();
                    const user = window.dataSession.getData('login');
                    await loadDataPenunjukan(user ? user.username : undefined, true);
                } else {
                    showAlert('error', response?.error || 'Gagal memperbarui status tugas.');
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

    window.openModalDetailPenunjukan = function (data, penunjukanData) {
        if (!modalDetail) return;

        currentPenunjukanId = penunjukanData ? penunjukanData.id : null;
        if (inputStatus && penunjukanData) {
            inputStatus.value = penunjukanData.status || 'berlangsung';
        }

        const isEditable = !penunjukanData || penunjukanData.status === 'berlangsung';
        if (inputStatus) {
            inputStatus.disabled = !isEditable;
        }
        if (btnSimpan) {
            btnSimpan.disabled = !isEditable;
            if (isEditable) {
                btnSimpan.className = "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer";
                btnSimpan.textContent = 'Simpan Status';
            } else {
                btnSimpan.className = "rounded-lg bg-gray-400 px-4 py-2.5 text-sm font-semibold text-white transition-colors cursor-not-allowed opacity-75";
                btnSimpan.textContent = penunjukanData.status === 'sukses' ? 'Tugas Sukses' : 'Tugas Dibatalkan';
            }
        }

        document.getElementById('detail-judul-penunjukan').textContent =
            data.judul || '-';

        document.getElementById('detail-deskripsi-penunjukan').textContent =
            data.deskripsi || '-';

        document.getElementById('detail-kategori-penunjukan').textContent =
            data.kategori || '-';

        document.getElementById('detail-teknisi-penunjukan').textContent =
            data.teknisi || 'Belum ditugaskan';

        // Status badge
        const statusEl = document.getElementById('detail-status-penunjukan');

        if (statusEl) {
            statusEl.textContent = data.status || '-';

            if (data.status === 'selesai') {
                statusEl.className =
                    'inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
            } else if (data.status === 'proses') {
                statusEl.className =
                    'inline-block rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
            } else if (data.status === 'ditolak') {
                statusEl.className =
                    'inline-block rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
            } else {
                statusEl.className =
                    'inline-block rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
            }
        }

        // Kategori badge
        const catEl = document.getElementById('detail-kategori-penunjukan');

        if (catEl) {
            if (data.kategori === 'rusak ringan') {
                catEl.className =
                    'inline-block rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
            } else if (data.kategori === 'rusak sedang') {
                catEl.className =
                    'inline-block rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
            } else if (data.kategori === 'rusak berat') {
                catEl.className =
                    'inline-block rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
            } else {
                catEl.className =
                    'inline-block rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs font-semibold tracking-wide uppercase';
            }
        }

        // Tanggal Masuk Laporan
        const rawDate = data.createdAt || data.created_at;

        const tanggalStr = rawDate
            ? new Date(rawDate).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
              })
            : '-';

        const tglEl = document.getElementById('detail-tanggal-penunjukan');

        if (tglEl) {
            tglEl.textContent = tanggalStr;
        }

        // Tanggal Mulai Penunjukan
        const rawAwalDate = penunjukanData ? penunjukanData.awal : null;
        const awalStr = rawAwalDate
            ? new Date(rawAwalDate).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
              })
            : '-';
        const awalEl = document.getElementById('detail-awal-penunjukan');
        if (awalEl) {
            awalEl.textContent = awalStr;
        }

        // Tanggal Akhir/Tenggat Penunjukan
        const rawAkhirDate = penunjukanData ? penunjukanData.akhir : null;
        const akhirStr = rawAkhirDate
            ? new Date(rawAkhirDate).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
              })
            : '-';
        const akhirEl = document.getElementById('detail-akhir-penunjukan');
        if (akhirEl) {
            akhirEl.textContent = akhirStr;
        }

        // Format tanggal selesai jika ada & status selesai
        const tglSelesaiContainer = document.getElementById('detail-tanggal-selesai-container-penunjukan');
        const tglSelesaiEl = document.getElementById('detail-tanggal-selesai-penunjukan');
        if (tglSelesaiContainer && tglSelesaiEl) {
            if (data.status === 'selesai') {
                const rawSelesaiDate = data.updated_at || data.updatedAt;
                const tanggalSelesaiStr = rawSelesaiDate ? new Date(rawSelesaiDate).toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '-';
                tglSelesaiEl.textContent = tanggalSelesaiStr;
                tglSelesaiContainer.classList.remove('hidden');
            } else {
                tglSelesaiContainer.classList.add('hidden');
            }
        }

        // Foto
        const imgEl = document.getElementById('detail-foto-penunjukan');

        if (imgEl) {
            const imgSrc =
                data.foto &&
                !data.foto.startsWith('http') &&
                !data.foto.startsWith('data:image')
                    ? `http://localhost:3000/${data.foto}`
                    : data.foto || 'https://via.placeholder.com/400x200?text=No+Image';

            imgEl.src = imgSrc;
        }

        modalDetail.classList.remove('hidden');
        modalDetail.classList.add('flex');
    };
}