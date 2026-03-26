// navbar.js
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const btnDevelop = document.querySelector('.btn-develop');
  if (btnDevelop) {
    btnDevelop.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#develop-skills');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  const quizLink = document.querySelector('a[href="#quiz"]');
  if (quizLink) {
    quizLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#quiz');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  const parentalLink = document.querySelector('a[href="#parental"]');
  if (parentalLink) {
    parentalLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#parental');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
