// import 

// export function
export function initButtons() {
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function () {
      if (this.classList.contains('bg-gradient')) {
        const originalText = this.innerHTML;
        this.innerHTML = 'Processing...';
        this.disabled = true;

        setTimeout(() => {
          this.innerHTML = originalText;
          this.disabled = false;
        }, 2000);
      }
    });
  });
}

export function hiddenBtn(id) {
  document.getElementById(id).classList.add('hidden');
}