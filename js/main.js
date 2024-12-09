//Section: Make interactive dots
const dots = document.querySelectorAll('.navdot');
const pages = document.querySelectorAll('.page');
const container = document.querySelector('.container');
const image = document.getElementById('main_field');

const positions = [
    { top: '50%', rot: '0deg', width: '1000px', left: '70%' }, // Page 1
    { top: '110%', rot: '45deg', width: '5000px', left: '-100%' }, // Page 2
    { top: '100%', rot: '0deg', width: '5000px', left: '20%' }, // Page 3
    { top: '100%', rot: '0deg', width: '5000px', left: '20%' }, // Page 3
    { top: '100%', rot: '0deg', width: '5000px', left: '20%' }, // Page 3
    { top: '-270%', rot: '-45deg', width: '5000px', left: '100%' },  // Page 
    { top: '-270%', rot: '-45deg', width: '5000px', left: '100%' },  // Page 
    { top: '-270%', rot: '-45deg', width: '5000px', left: '80%' }, // Page 
    { top: '-270%', rot: '-45deg', width: '5000px', left: '80%' }
];

dots.forEach(dot => {
    dot.addEventListener('click', () => {
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

            const position = positions[index];
            image.style.top = position.top;
            image.style.left = position.left;
            image.style.width = position.width;
            image.style.rotate = position.rot;
        }
    });
}, { threshold: 0.7 });

pages.forEach(page => observer.observe(page));