function loadHTML(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      const currentPage = window.location.pathname.split("/").pop();
      document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === currentPage);
      });
    })
    .catch(err => console.error(`Error loading ${file}:`, err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadHTML('navbar', 'components/navbar.html');
  loadHTML('footer', 'components/footer.html');
});
