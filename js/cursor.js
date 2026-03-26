// cursor.js
document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  
  const ring = document.createElement('div');
  ring.classList.add('cursor-ring');
  
  Object.assign(cursor.style, {
    position: 'fixed',
    width: '12px',
    height: '12px',
    backgroundColor: 'var(--cyan, #00d4ff)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: '9999',
    transform: 'translate(-50%, -50%)',
    transition: 'opacity 0.3s'
  });

  Object.assign(ring.style, {
    position: 'fixed',
    width: '36px',
    height: '36px',
    border: '1px solid var(--cyan, #00d4ff)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: '9998',
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.3s, height 0.3s, border-color 0.3s'
  });

  document.body.appendChild(cursor);
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let isHovering = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate cursor update
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  const lerp = (a, b, n) => (1 - n) * a + n * b;

  const animate = () => {
    ringX = lerp(ringX, mouseX, 0.14);
    ringY = lerp(ringY, mouseY, 0.14);
    
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    if (isHovering) {
      ring.style.width = '64.8px';
      ring.style.height = '64.8px';
      ring.style.borderColor = 'rgba(0,212,255,0.7)';
    } else {
      ring.style.width = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'var(--cyan, #00d4ff)';
    }

    requestAnimationFrame(animate);
  };
  animate();

  const addHoverEffect = () => {
    const interactables = document.querySelectorAll('button, a, .feat-card, .skill-item, .quiz-container');
    
    interactables.forEach(el => {
      // Clean up previous listeners if function called multiple times
      el.addEventListener('mouseenter', () => isHovering = true);
      el.addEventListener('mouseleave', () => isHovering = false);
    });
  };

  addHoverEffect();
  
  // Expose to window so we can re-init if new elements added
  window.initCursorHover = addHoverEffect;
});
