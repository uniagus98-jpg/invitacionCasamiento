// Cambiá esta fecha por la fecha real del evento (AAAA-MM-DDTHH:MM:SS).
const eventDate = new Date("2026-12-05T18:00:00");

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
// Galería: cambia la foto solo cuando la imagen solicitada cargó correctamente.
const galleryFiles = [
  "img/foto1.webp",
  "img/foto2.webp",
  "img/foto3.webp"
];

let galleryIndex = 0;
const galleryImage = document.getElementById("galleryImage");
const placeholder = document.getElementById("photoPlaceholder");
const galleryFrame = document.querySelector(".gallery-frame");
const dots = [...document.querySelectorAll(".dots span")];
let galleryRequest = 0;
let galleryTouchStart = null;

function showGalleryImage(index) {
  galleryIndex = (index + galleryFiles.length) % galleryFiles.length;

  const requestedIndex = galleryIndex;
  const requestId = ++galleryRequest;
  const candidate = new Image();

  candidate.onload = () => {
    // Ignora cargas anteriores si se hicieron clics rápidos.
    if (requestId !== galleryRequest) return;

    galleryImage.src = candidate.src;
    galleryImage.style.display = "block";
    placeholder.style.display = "none";

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === requestedIndex);
    });
  };

  candidate.onerror = () => {
    if (requestId !== galleryRequest) return;

    // Intenta cargar la siguiente foto si el archivo falla.
    const nextIndex = requestedIndex + 1;

    if (nextIndex >= galleryFiles.length) {
      galleryImage.style.display = "none";
      placeholder.style.display = "flex";

      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === requestedIndex);
      });

      return;
    }

    showGalleryImage(nextIndex);
  };

  candidate.src = galleryFiles[requestedIndex];
}

document.querySelector(".gallery-arrow.prev")
  .addEventListener("click", () => {
    showGalleryImage(galleryIndex - 1);
  });

document.querySelector(".gallery-arrow.next")
  .addEventListener("click", () => {
    showGalleryImage(galleryIndex + 1);
  });

galleryFrame.addEventListener("pointerdown", event => {
  if (event.pointerType !== "touch") return;
  galleryTouchStart = { x: event.clientX, y: event.clientY };
});

galleryFrame.addEventListener("pointerup", event => {
  if (!galleryTouchStart) return;

  const deltaX = event.clientX - galleryTouchStart.x;
  const deltaY = event.clientY - galleryTouchStart.y;
  galleryTouchStart = null;

  if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
  showGalleryImage(galleryIndex + (deltaX < 0 ? 1 : -1));
});

galleryFrame.addEventListener("pointercancel", () => {
  galleryTouchStart = null;
});

// Carga la primera imagen al abrir la página.
showGalleryImage(0);
