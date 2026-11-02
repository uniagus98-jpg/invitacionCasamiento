// Cambiá esta fecha por la fecha real del evento (AAAA-MM-DDTHH:MM:SS).
const eventDate = new Date("2026-12-05T17:30:00");
const RSVP_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwEBdqZ77p_l0C0kte9xPQPTErxG7R5a2HGWB7t65Dk8WUneITD1prleFnuaXBNB95I5Q/exec";

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
const attendanceOptions = document.getElementById("attendanceOptions");
const noAttendanceChoice = document.getElementById("noAttendanceChoice");
const noAttendanceInput = noAttendanceChoice?.querySelector('input[type="radio"]');
const attendanceHint = document.getElementById("attendanceHint");
let noAttendanceAnimationStarted = false;
let noAttendanceMoveInterval;

function moveNoAttendanceChoice() {
  if (!attendanceOptions || !noAttendanceChoice) return;

  const maxLeft = Math.max(0, attendanceOptions.clientWidth - noAttendanceChoice.offsetWidth);
  const maxTop = Math.max(0, attendanceOptions.clientHeight - noAttendanceChoice.offsetHeight);
  const positions = [
    [maxLeft, 0],
    [0, Math.min(54, maxTop)],
    [maxLeft, Math.min(54, maxTop)],
    [0, maxTop],
    [maxLeft, maxTop]
  ];
  let position = positions[Math.floor(Math.random() * positions.length)];

  if (noAttendanceChoice.dataset.position) {
    const previousPosition = Number(noAttendanceChoice.dataset.position);
    let positionIndex = positions.indexOf(position);
    while (positionIndex === previousPosition) {
      positionIndex = Math.floor(Math.random() * positions.length);
      position = positions[positionIndex];
    }
    noAttendanceChoice.dataset.position = String(positionIndex);
  } else {
    noAttendanceChoice.dataset.position = String(positions.indexOf(position));
  }

  noAttendanceChoice.style.left = `${position[0]}px`;
  noAttendanceChoice.style.top = `${position[1]}px`;
}

function startNoAttendanceAnimation() {
  if (noAttendanceAnimationStarted || !noAttendanceChoice || !noAttendanceInput) return;
  noAttendanceAnimationStarted = true;
  noAttendanceChoice.classList.add("is-moving");
  noAttendanceInput.disabled = true;
  attendanceHint.textContent = "La opción «No podré asistir» estará disponible en unos segundos…";
  moveNoAttendanceChoice();
  noAttendanceMoveInterval = setInterval(moveNoAttendanceChoice, 780);

  setTimeout(() => {
    clearInterval(noAttendanceMoveInterval);
    noAttendanceChoice.classList.remove("is-moving");
    attendanceOptions.classList.add("is-settled");
    noAttendanceChoice.style.left = "0px";
    noAttendanceChoice.style.top = "56px";
    noAttendanceInput.disabled = false;
    attendanceHint.textContent = "¡Listo! Ya podés seleccionar «No podré asistir».";
  }, 10000);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  previousFocus = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (id === "rsvpModal") startNoAttendanceAnimation();
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
document.querySelectorAll(".copy-alias-button").forEach(button => {
  button.addEventListener("click", async () => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(button.dataset.copy);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      const temporaryField = document.createElement("textarea");
      temporaryField.value = button.dataset.copy;
      temporaryField.setAttribute("readonly", "");
      temporaryField.style.position = "fixed";
      temporaryField.style.opacity = "0";
      document.body.append(temporaryField);
      temporaryField.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
      temporaryField.remove();
    }

    showToast(copied ? "Alias copiado al portapapeles" : "No se pudo copiar. Seleccioná el alias para copiarlo.");
  });
});
const rsvpForm = document.getElementById("rsvpForm");
const rsvpResponseFrame = document.getElementById("rsvpResponseFrame");
let rsvpSubmissionPending = false;
rsvpResponseFrame?.addEventListener("load", () => {
  if (!rsvpSubmissionPending) return;
  rsvpSubmissionPending = false;
  showToast("¡Gracias! Tu respuesta se guardó correctamente.");
  rsvpForm.reset();
  closeModal(rsvpForm.closest(".modal"));
});

document.querySelectorAll(".local-form").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (form.id === "rsvpForm") {
      if (!RSVP_WEB_APP_URL) {
        showToast("La hoja de confirmaciones todavía no está conectada.");
        return;
      }
      form.action = RSVP_WEB_APP_URL;
      form.method = "POST";
      form.target = "rsvpResponseFrame";
      rsvpSubmissionPending = true;
      HTMLFormElement.prototype.submit.call(form);
      return;
    }
    showToast(form.dataset.message || "¡Gracias!");
    form.reset();
    closeModal(form.closest(".modal"));
  });
});

const celebrationEffects = document.getElementById("celebrationEffects");
const attendanceRadios = [...document.querySelectorAll('input[name="attendance"]')];

function celebrateAttendance() {
  if (!celebrationEffects) return;
  const colors = ["#668d68", "#8eaa7f", "#d8c9a8", "#f5f1e8", "#a7bd92"];
  celebrationEffects.replaceChildren();

  for (let i = 0; i < 38; i += 1) {
    const isStreamer = i % 7 === 0;
    const piece = document.createElement("i");
    piece.className = isStreamer ? "confetti-piece streamer" : "confetti-piece paper-bit";
    piece.style.setProperty("--x", `${Math.random() * 100}vw`);
    piece.style.setProperty("--fall-time", `${2.6 + Math.random() * 1.8}s`);
    piece.style.setProperty("--fall-delay", `${Math.random() * 0.55}s`);
    piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    piece.style.setProperty("--spin", `${Math.random() * 900 - 450}deg`);
    if (isStreamer) {
      piece.style.setProperty("--streamer-color", colors[Math.floor(Math.random() * 2)]);
    } else {
      piece.style.setProperty("--paper-color", colors[Math.floor(Math.random() * colors.length)]);
    }
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
    celebrationEffects.append(piece);
  }
}

function shakeInvitation() {
  [document.querySelector(".invitation"), document.querySelector("#rsvpModal .modal-panel")]
    .filter(Boolean)
    .forEach(element => {
      element.classList.remove("screen-shake");
      void element.offsetWidth;
      element.classList.add("screen-shake");
      element.addEventListener("animationend", () => element.classList.remove("screen-shake"), { once: true });
    });
}

attendanceRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    if (!radio.checked) return;
    if (radio.value === "Sí, ahí estaré") celebrateAttendance();
    if (radio.value === "No podré asistir") shakeInvitation();
  });
});

// Fotos optimizadas de la pareja en WebP para cargar más rápido en móviles.
// Galería: cambia la foto solo cuando la imagen solicitada cargó correctamente.
const galleryFiles = [
  "img/f1.webp",
  "img/f2.webp",
  "img/f3.webp",
  "img/f4.webp",
  "img/f5.webp"
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

    const revealImage = () => {
      if (requestId !== galleryRequest) return;

      galleryImage.src = candidate.src;
      galleryImage.style.objectPosition = requestedIndex === 4
        ? "center 88%"
        : requestedIndex === 2
          ? "center bottom"
          : "center center";
      galleryImage.style.display = "block";
      placeholder.style.display = "none";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (requestId === galleryRequest) galleryImage.classList.add("is-visible");
        });
      });
    };

    if (galleryImage.classList.contains("is-visible")) {
      galleryImage.classList.remove("is-visible");
      setTimeout(revealImage, 240);
    } else {
      revealImage();
    }

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === requestedIndex);
    });
  };

  candidate.onerror = () => {
    if (requestId !== galleryRequest) return;

    // Intenta cargar la siguiente foto si el archivo falla.
    const nextIndex = requestedIndex + 1;

    if (nextIndex >= galleryFiles.length) {
      galleryImage.classList.remove("is-visible");
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
