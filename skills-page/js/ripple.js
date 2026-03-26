// BUTTON RIPPLE EFFECT
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .btn-ripple');
    if (!btn) return;
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    // Add styling directly or via class
    ripple.style.position = 'absolute';
    ripple.style.background = 'rgba(255, 255, 255, 0.4)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.animation = 'ripple-effect 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    // Calculate position
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    
    // Append and remove
    btn.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Add keyframes dynamically if not present
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple-effect {
    to {
      transform: translate(-50%, -50%) scale(2.5);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
