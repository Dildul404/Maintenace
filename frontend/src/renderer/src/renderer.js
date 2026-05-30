const user = window.dataSession.getData('login');

// ------------------------------------
// import
// ------------------------------------

import { userLogin, logout } from "./auth.js";
import { setupStatusModal, setupDetailModal, setupPilihTeknisiModal, setupModal } from "./modal.js";
import { loadDataLaporan } from "./laporan.js";
import { loadDataTeknisi } from "./teknisi.js";