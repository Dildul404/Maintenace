// import
import { loadPage } from "./page.js";
import { loadSidebar, initNavigation } from "./sidebar.js";

const user = window.dataSession.getData('login');

// export function
export async function userRegister() {
  // ambil username & password
  let inpUsername = document.getElementById('username')
  let inpEmail = document.getElementById('email')
  let inpPassword = document.getElementById('password')
  let inpRole = document.getElementById('role')
  let username = inpUsername.value
  let email = inpEmail.value
  let password = inpPassword.value
  let role = inpRole.value

  // simpan ke database
  window.api.sendUser({
    username: username,
    email: email,
    password: password,
    role: role
  })

  // simpan ke store
  window.dataSession.setData('login', {
    username: username,
    email: email,
    password: password,
    role: role
  })

  // Update kondisi login
  window.dataSession.updateData('is-login', { login: true })
  location.reload()
}

export async function userLogin() {
  // ambil username & password
  let inpEmail = document.getElementById('email')
  let inpPassword = document.getElementById('password')
  let email = inpEmail.value
  let password = inpPassword.value

  // Ambil data user dari database
  const user = await window.api.getUser(email, password)
  console.log(user);

  // simpan ke store
  window.dataSession.setData('login', {
    username: user.data.username,
    email: email,
    password: password,
    role: user.data.role
  })

  // Update kondisi login
  window.dataSession.updateData('is-login', { login: true })
  location.reload()
}

export async function logout() {
  // Update kondisi login
  window.dataSession.updateData('is-login', { login: false })
  location.reload()
}

document.addEventListener('DOMContentLoaded', async () => {
  const auth = window.dataSession.getData('is-login');

  if (auth.login === false) {
    // Jika user belum login
    await loadPage("login");
    document.getElementById("sidebar").classList.add("hidden");
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.addEventListener("click", async () => {
      await userLogin();
    });

    // Register
    document.getElementById("register-link").addEventListener("click", async () => {
      await loadPage("register");
      document.getElementById("register-btn").addEventListener("click", async () => {
        await userRegister();
      });

      document.getElementById("login-link").addEventListener("click", async () => {
        await loadPage("login");
      });
    });
  } else {
    if (user.role === "admin") {
      loadPage("dashboard");
      await loadSidebar("admin-sidebar");
      initNavigation("dashboard");
    } else if (user.role === "user") {
      loadPage("daftar-laporan");
      await loadSidebar("user-sidebar");
      initNavigation("daftar-laporan");
    } else if (user.role === "teknisi") {
      loadPage("dashboard");
      await loadSidebar("teknisi-sidebar");
      initNavigation("dashboard");
    }
  }
});