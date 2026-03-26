// CUSTOM CURSOR
document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  
  if (!cursor || !ring) return;
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  
  // Update mouse coordinates exactly on move
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Direct position for dot (zero lag)
    cursor.style.transform = `translate3d(${mouseX - 6}px, ${mouseY - 6}px, 0)`;
  });
  
  // Lerp for the outer ring
  function render() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    
    ring.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;
    requestAnimationFrame(render);
  }
  
  render();
  
  // Dynamic scale ring on interactive elements
  document.body.addEventListener('mouseover', (e) => {
    const target = e.target.closest('button, a, input, .skill-card, .option-btn, .puzzle-shape, .match-tile, .seq-tile, .mem-card, .clickable');
    if (target) {
      ring.classList.add('hover');
    }
  });
  
  document.body.addEventListener('mouseout', (e) => {
    const target = e.target.closest('button, a, input, .skill-card, .option-btn, .puzzle-shape, .match-tile, .seq-tile, .mem-card, .clickable');
    if (target) {
      ring.classList.remove('hover');
    }
  });
});
