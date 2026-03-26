// reveal.js
document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Simple index-based stagger delay if needed, or rely on CSS transition
        const index = Array.from(revealElements).indexOf(entry.target);
        const delay = (index % 10) * 50; // simple stagger bounded
        
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => observer.observe(el));
});
