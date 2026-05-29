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
