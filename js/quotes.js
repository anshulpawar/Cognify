// quotes.js
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.quote-slide');
  const dotsContainer = document.querySelector('.quote-dots');
  if (!slides.length || !dotsContainer) return;

  // Create dots based on slides count
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('dot-btn');
    if (i === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => {
      goTo(i);
      // Reset interval when user interacts
      clearInterval(autoAdvance);
      autoAdvance = setInterval(() => goTo((currentIndex + 1) % slides.length), 5000);
    });
    
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.dot-btn');
  let currentIndex = 0;

  const goTo = (index) => {
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    
    currentIndex = index;
    
    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
  };

  let autoAdvance = setInterval(() => {
    goTo((currentIndex + 1) % slides.length);
  }, 5000);
});
