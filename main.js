//Section: Make interactive dots
const dots = document.querySelectorAll('.dot');
const pages = document.querySelectorAll('.page');
const container = document.querySelector('.container');

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        console.log("Pressing the dot")
        const index = dot.getAttribute('data-page');
        pages[index].scrollIntoView({ behavior: 'smooth' });
    });
});

// Highlight active dot
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const index = Array.from(pages).indexOf(entry.target);
        if (entry.isIntersecting) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
        }
    });
}, { threshold: 0.7 });

pages.forEach(page => observer.observe(page));