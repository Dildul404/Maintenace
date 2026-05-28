async function simpanLogin(event) {
  event.preventDefault();

  // ambil form
  const form = event.target;

  // ambil data form
  const formData = new FormData(form);

  // ambil username & password
  const username = formData.get('username');
  const password = formData.get('password');

  // simpan ke electron-store lewat preload
  window.dataSession.setData('login', {
    username,
    password
  });

  console.log('Data login tersimpan');
}