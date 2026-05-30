export async function loadDashboardData() {
  try {
    // 1. Fetch data from backend APIs
    const responseLaporan = await window.api.getLaporan();
    const responseTeknisi = await window.api.getTeknisi();

    const laporanData = (responseLaporan && responseLaporan.success) ? responseLaporan.data : [];
    const teknisiData = (responseTeknisi && responseTeknisi.success) ? responseTeknisi.data : [];

    const totalLaporan = laporanData.length;
    const totalTeknisi = teknisiData.length;

    // Filter status counts
    const selesai = laporanData.filter(l => l.status === 'selesai').length;
    const proses = laporanData.filter(l => l.status === 'proses').length;
    const menunggu = laporanData.filter(l => l.status === 'menunggu').length;
    const batal = laporanData.filter(l => l.status === 'batal').length;
    const critical = laporanData.filter(l => l.kategori === 'rusak berat').length;

    // 2. Update Top Cards
    // Card 1: TOTAL TEKNISI
    const card1Title = document.getElementById('card-servers-title');
    const card1Value = document.getElementById('card-servers-value');
    const card1Icon = document.getElementById('card-servers-icon');
    const card1Progress = document.getElementById('card-servers-progress');
    const card1Subtext = document.getElementById('card-servers-subtext');

    if (card1Title) card1Title.textContent = 'TOTAL TEKNISI';
    if (card1Value) card1Value.textContent = String(totalTeknisi).padStart(2, '0');
    if (card1Icon) {
      card1Icon.className = 'fas fa-users text-blue-500 text-2xl';
    }
    if (card1Progress) {
      card1Progress.style.width = '100%';
    }
    if (card1Subtext) {
      card1Subtext.textContent = 'Teknisi aktif terdaftar';
      card1Subtext.className = 'text-blue-500 text-sm mt-3 font-medium';
    }

    // Card 2: TUGAS PROSES (Ongoing)
    const card2Title = document.getElementById('card-tasks-title');
    const card2Value = document.getElementById('card-tasks-value');
    const card2Progress = document.getElementById('card-tasks-progress');
    const card2Subtext = document.getElementById('card-tasks-subtext');

    if (card2Title) card2Title.textContent = 'TUGAS PROSES';
    if (card2Value) card2Value.textContent = String(proses).padStart(2, '0');
    if (card2Progress) {
      const taskProgressPercent = totalLaporan > 0 ? (proses / totalLaporan) * 100 : 0;
      card2Progress.style.width = `${taskProgressPercent}%`;
    }
    if (card2Subtext) {
      card2Subtext.textContent = 'Sedang dikerjakan teknisi';
    }

    // Card 3: TUGAS MENUNGGU (Pending)
    const card3Title = document.getElementById('card-security-title');
    const card3Value = document.getElementById('card-security-value');
    const card3Icon = document.getElementById('card-security-icon');
    const card3Progress = document.getElementById('card-security-progress');
    const card3Subtext = document.getElementById('card-security-subtext');

    if (card3Title) card3Title.textContent = 'TUGAS PENDING';
    if (card3Value) card3Value.textContent = String(menunggu).padStart(2, '0');
    if (card3Icon) {
      card3Icon.className = 'fas fa-clock text-amber-500 text-2xl';
      const iconParent = card3Icon.parentElement;
      if (iconParent) {
        iconParent.className = 'w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center';
      }
    }
    if (card3Progress) {
      const securityProgressPercent = totalLaporan > 0 ? (menunggu / totalLaporan) * 100 : 0;
      card3Progress.style.width = `${securityProgressPercent}%`;
      card3Progress.className = 'bg-amber-500 h-full rounded-full';
    }
    if (card3Subtext) {
      card3Subtext.textContent = 'Menunggu verifikasi / penunjukan';
      card3Subtext.className = 'text-amber-500 text-sm mt-3 font-medium';
    }

    // 3. Update Maintenance Progress Lists (Selesai, Proses, Menunggu)
    const progressContainer = document.getElementById('maintenance-progress-container');
    if (progressContainer) {
      const selesaiPercent = totalLaporan > 0 ? Math.round((selesai / totalLaporan) * 100) : 0;
      const prosesPercent = totalLaporan > 0 ? Math.round((proses / totalLaporan) * 100) : 0;
      const menungguPercent = totalLaporan > 0 ? Math.round((menunggu / totalLaporan) * 100) : 0;
      const batalPercent = totalLaporan > 0 ? Math.round((batal / totalLaporan) * 100) : 0;

      let progressHTML = `
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-slate-700 font-medium">Laporan Selesai</span>
            <span class="text-slate-500 font-semibold">${selesaiPercent}%</span>
          </div>
          <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${selesaiPercent}%;"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-slate-700 font-medium">Sedang Diproses</span>
            <span class="text-slate-500 font-semibold">${prosesPercent}%</span>
          </div>
          <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div class="bg-blue-500 h-full rounded-full transition-all duration-500" style="width: ${prosesPercent}%;"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-slate-700 font-medium">Menunggu Penunjukan</span>
            <span class="text-slate-500 font-semibold">${menungguPercent}%</span>
          </div>
          <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div class="bg-amber-500 h-full rounded-full transition-all duration-500" style="width: ${menungguPercent}%;"></div>
          </div>
        </div>
      `;

      if (batal > 0) {
        progressHTML += `
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-slate-700 font-medium">Laporan Dibatalkan</span>
              <span class="text-slate-500 font-semibold">${batalPercent}%</span>
            </div>
            <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div class="bg-rose-500 h-full rounded-full transition-all duration-500" style="width: ${batalPercent}%;"></div>
            </div>
          </div>
        `;
      }

      progressContainer.innerHTML = progressHTML;
    }

    // 4. Update Statistika Laporan (Mini Cards)
    const statTotalDamage = document.getElementById('stat-total-damage');
    const statFixedItems = document.getElementById('stat-fixed-items');
    const statCriticalIssues = document.getElementById('stat-critical-issues');

    if (statTotalDamage) statTotalDamage.textContent = String(totalLaporan);
    if (statFixedItems) statFixedItems.textContent = String(selesai);
    if (statCriticalIssues) statCriticalIssues.textContent = String(critical);

    // 5. Update Monthly Bar Chart (Last 6 Months)
    const barChartContainer = document.getElementById('dashboard-bar-chart');
    if (barChartContainer) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const last6Months = [];
      const today = new Date();

      // Generate the last 6 months list chronologically
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        last6Months.push({
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          name: monthNames[d.getMonth()],
          count: 0
        });
      }

      // Populate counts from database
      laporanData.forEach(item => {
        const dateStr = item.created_at || item.createdAt;
        if (dateStr) {
          const itemDate = new Date(dateStr);
          const itemMonth = itemDate.getMonth();
          const itemYear = itemDate.getFullYear();

          const match = last6Months.find(m => m.monthIndex === itemMonth && m.year === itemYear);
          if (match) {
            match.count++;
          }
        }
      });

      // Find max count for scaling
      const maxCount = Math.max(...last6Months.map(m => m.count), 1);

      // Gradients for the bars
      const gradients = [
        'bg-gradient-to-t from-blue-600 to-blue-400',
        'bg-gradient-to-t from-sky-600 to-sky-400',
        'bg-gradient-to-t from-cyan-600 to-cyan-400',
        'bg-gradient-to-t from-teal-600 to-teal-400',
        'bg-gradient-to-t from-indigo-600 to-indigo-400',
        'bg-gradient-to-t from-blue-700 to-cyan-500'
      ];

      // Render the HTML for each bar
      barChartContainer.innerHTML = '';
      last6Months.forEach((m, idx) => {
        const heightPercent = (m.count / maxCount) * 100;
        const grad = gradients[idx % gradients.length];
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'flex flex-col items-center w-full h-full justify-end';
        barWrapper.innerHTML = `
          <div
            class="${grad} w-full rounded-t-2xl shadow-lg hover:scale-105 transition-all duration-300"
            style="height: ${Math.max(heightPercent, 2)}%; min-height: 4px;"
            title="${m.count} Laporan di ${m.name} ${m.year}"
          ></div>
          <span class="mt-4 font-semibold text-slate-700 text-xs sm:text-sm">${m.name}</span>
          <span class="text-slate-400 text-xs">${m.count}</span>
        `;
        barChartContainer.appendChild(barWrapper);
      });
    }

  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}
