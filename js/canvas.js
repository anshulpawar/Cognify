// canvas.js
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas');
  canvas.id = 'neural-canvas';
  document.body.appendChild(canvas);

  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '0',
    pointerEvents: 'none',
    opacity: '0.45'
  });

  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];

  const init = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    const nodeCount = Math.floor((width * height) / 18000);
    nodes = [];
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1
      });
    }
  };

  window.addEventListener('resize', init);
  init();

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    
    // Update nodes
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.55)';
      ctx.fill();

      // Connect nodes
      for (let j = i + 1; j < nodes.length; j++) {
        let node2 = nodes[j];
        let dx = node.x - node2.x;
        let dy = node.y - node2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(node2.x, node2.y);
          let opacity = (1 - dist / 130) * 0.18;
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(draw);
  };
  
  draw();
});
