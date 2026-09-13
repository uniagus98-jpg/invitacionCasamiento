 // contador
 document.addEventListener("DOMContentLoaded", function() {
    const targetDate = new Date("2025-03-08T21:00:00").getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            document.getElementById("countdown").innerHTML = `
                <div class="countdown-item"><span>${days}</span>días</div>
                <div class="countdown-item"><span>${hours}</span>horas</div>
                <div class="countdown-item"><span>${minutes}</span>minutos</div>
                <div class="countdown-item"><span>${seconds}</span>segundos</div>
            `;
            
        } else {
            document.getElementById("countdown").textContent = "¡Es el gran día!";
            clearInterval(interval);
        }
    }

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

// secciones emergentes
    const sections = document.querySelectorAll(".section");

    function revealSections() {
        const windowHeight = window.innerHeight;
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop < windowHeight - 100) {
                section.classList.add("visible");
            }
        });
    }

    window.addEventListener("scroll", revealSections);
    revealSections();
});

// reproductor de musica
document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio-player");
    const playPauseButton = document.getElementById("play-pause");
    const playIcon = document.getElementById("play-icon");
    const pauseIcon = document.getElementById("pause-icon");

    // Agregar evento de interacción para activar el audio en caso de bloqueo
    const enableAudio = () => {
        audio.play().then(() => {
            playIcon.style.display = "none";
            pauseIcon.style.display = "block";
        }).catch(error => console.warn("La reproducción automática fue bloqueada por el navegador", error));
        
        document.removeEventListener("click", enableAudio);
        document.removeEventListener("scroll", enableAudio);
    };
    
    document.addEventListener("click", enableAudio);
    document.addEventListener("scroll", enableAudio);

    playPauseButton.addEventListener("click", () => {
        if (audio.paused) {
            audio.play().then(() => {
                playIcon.style.display = "none";
                pauseIcon.style.display = "block";
            }).catch(error => console.error("Error al reproducir audio: ", error));
        } else {
            audio.pause();
            playIcon.style.display = "block";
            pauseIcon.style.display = "none";
        }
    });
});