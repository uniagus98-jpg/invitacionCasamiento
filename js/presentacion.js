document.addEventListener("DOMContentLoaded", () => {
    const paragraphs = document.querySelectorAll(".animated");
    let delay = 1500;
    paragraphs.forEach((p, index) => {
        setTimeout(() => {
            p.classList.add("visible");
        }, index * delay);
    });
});