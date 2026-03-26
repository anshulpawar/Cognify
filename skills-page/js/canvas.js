// NEURAL CANVAS BACKGROUND
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let nodes = [];
  
  function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    nodes = [];
    const numNodes = Math.floor((width * height) / 12000);
    
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.5
      });
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Update and draw nodes
    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      node.x += node.vx;
      node.y += node.vy;
      
      // Bounce off edges
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
      ctx.fill();
      
      // Draw connections
      for (let j = i + 1; j < nodes.length; j++) {
        let node2 = nodes[j];
        let dx = node.x - node2.x;
        let dy = node.y - node2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(node2.x, node2.y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  init();
  animate();
  
  window.addEventListener('resize', init);
});
