// hero.js
// No counter animation needed as per instructions.
document.addEventListener('DOMContentLoaded', () => {
  const cta = document.querySelector('.hero-cta');
  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#features');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
