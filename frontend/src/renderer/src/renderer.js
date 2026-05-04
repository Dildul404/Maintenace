// load component
async function loadComponent(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

// load halaman
window.loadPage = async function (page) {
  const res = await fetch(`./${page}.html`);
  const html = await res.text();
  document.getElementById("content").innerHTML = html;
};

// init
loadComponent("sidebar", "./component/sidebar.html");
loadComponent("dasboard", "./component/dashboard.html");


// default page
loadPage("index");

// -------------------------------------
// dashboard
// -------------------------------------

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.card-hover');

  cards.forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Add loading animation for buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function (e) {
      if (this.classList.contains('bg-gradient')) {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
        this.disabled = true;

        setTimeout(() => {
          this.innerHTML = originalText;
          this.disabled = false;
        }, 2000);
      }
    });
  });
});