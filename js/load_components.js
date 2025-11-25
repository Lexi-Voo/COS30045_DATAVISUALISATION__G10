function loadHTML(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      const currentPage = window.location.pathname.split("/").pop() || "index.html";

      document.querySelectorAll(".nav-link").forEach(link => {
        const href = link.getAttribute("href");

        // Highlight Index when URL is simply "/"
        if (currentPage === "index.html" && href === "index.html") {
            link.classList.add("active");
        } else {
            link.classList.toggle("active", href === currentPage);
        }
      });

    })
    .catch(err => console.error(`Error loading ${file}:`, err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadHTML('navbar', 'components/navbar.html');
  loadHTML('footer', 'components/footer.html');
});
