// import

// export func
export async function showConfirm(message) {
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