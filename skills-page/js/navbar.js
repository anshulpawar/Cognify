// NAVBAR SCROLL LOGIC
document.addEventListener('DOMContentLoaded', () => {
  const topbar = document.querySelector('.topbar');
  
  if (topbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        topbar.classList.add('scrolled');
      } else {
        topbar.classList.remove('scrolled');
      }
    });
  }
});
