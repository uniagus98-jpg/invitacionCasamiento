// Cambiá esta fecha por la fecha real del evento (AAAA-MM-DDTHH:MM:SS).
const eventDate = new Date("2027-08-08T17:00:00");

function updateCountdown() {
  const remaining = Math.max(0, eventDate.getTime() - Date.now());
  const units = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000)
  };
  Object.entries(units).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value).padStart(2, "0");
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

const modals = [...document.querySelectorAll(".modal")];
let previousFocus = null;
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  previousFocus = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modal.querySelector(".close")?.focus();
}
function closeModal(modal) {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (!modals.some(m => m.classList.contains("open"))) document.body.style.overflow = "";
  previousFocus?.focus?.();
}
document.querySelectorAll("[data-modal]").forEach(button => {
  button.addEventListener("click", () => openModal(button.dataset.modal));
});
modals.forEach(modal => {
  modal.querySelector(".close")?.addEventListener("click", () => closeModal(modal));
  modal.querySelectorAll(".close-action").forEach(button => button.addEventListener("click", () => closeModal(modal)));
  modal.addEventListener("click", event => { if (event.target === modal) closeModal(modal); });
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    const active = modals.find(modal => modal.classList.contains("open"));
    if (active) closeModal(active);
  }
});

const toast = document.getElementById("toast");
let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3500);
}
document.querySelectorAll(".local-form").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    showToast(form.dataset.message || "¡Gracias!");
    form.reset();
    closeModal(form.closest(".modal"));
  });
});

// Galería de ejemplo. Cuando agregues tus fotos, copiá los archivos en /img
// y cambiá los nombres de este arreglo. Sin fotos cargadas se muestra el placeholder.
const galleryFiles = ["img/foto1.jpg", "img/foto2.jpg", "img/foto3.jpg"];
let galleryIndex = 0;
const galleryImage = document.getElementById("galleryImage");
const placeholder = document.getElementById("photoPlaceholder");
const dots = [...document.querySelectorAll(".dots span")];
function showGalleryImage(index) {
  galleryIndex = (index + galleryFiles.length) % galleryFiles.length;
  galleryImage.src = galleryFiles[galleryIndex];
  galleryImage.style.display = "block";
  placeholder.style.display = "none";
  dots.forEach((dot, i) => dot.classList.toggle("active", i === galleryIndex));
  galleryImage.onerror = () => {
    galleryImage.style.display = "none";
    placeholder.style.display = "flex";
  };
}
document.querySelector(".gallery-arrow.prev").addEventListener("click", () => showGalleryImage(galleryIndex - 1));
document.querySelector(".gallery-arrow.next").addEventListener("click", () => showGalleryImage(galleryIndex + 1));
