// contact.js
document.addEventListener('DOMContentLoaded', () => {
  const btnSubmit = document.querySelector('.btn-submit');
  
  if (btnSubmit) {
    btnSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Simulate submission
      btnSubmit.textContent = "Message Sent! ✓";
      btnSubmit.style.background = "linear-gradient(135deg, #00c88a, #00e5a0)";
      btnSubmit.style.color = "#000";
      btnSubmit.disabled = true;
    });
  }
});
