// import

// export func
export async function showAlert(type, message) {
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