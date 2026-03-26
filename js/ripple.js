// ripple.js
document.addEventListener('DOMContentLoaded', () => {
  const addRipples = () => {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(btn => {
      // Prevent adding multiple listeners
      if (btn.hasRipple) return;
      btn.hasRipple = true;
      
      // Make sure button has position relative/overflow hidden if not already set
      if (window.getComputedStyle(btn).position === 'static') {
        btn.style.position = 'relative';
      }
      
      btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height) * 2;
        
        Object.assign(ripple.style, {
          position: 'absolute',
          left: `${x - size / 2}px`,
          top: `${y - size / 2}px`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          transform: 'scale(0)',
          opacity: '1',
          pointerEvents: 'none',
          transition: 'transform 0.5s ease-out, opacity 0.5s ease-out'
        });
        
        this.appendChild(ripple);
        
        // Trigger reflow
        void ripple.offsetWidth;
        
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  };
  
  addRipples();
  
  // Expose to window to re-init if needed
  window.initRipples = addRipples;
});
