// import


// export func
export async function loadComponent(component, targetId) {
  try {
    const res = await fetch(`./component/${component}.html`);
    const html = await res.text();

    document.getElementById(targetId).innerHTML = html;
  } catch (err) {
    console.error('[loadComponent]', err);
  }
}