// Shared Theme Engine
document.addEventListener('DOMContentLoaded', () => {
  // 1. Restore theme on load
  const savedTheme = localStorage.getItem('gtrack-theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
  } else {
    document.body.removeAttribute('data-theme');
  }

  // 2. Settings Page Logic: Bind buttons if they exist
  const themeBtns = document.querySelectorAll('.theme-btn');
  if (themeBtns.length > 0) {
    // Apply visual active status sequentially on load
    themeBtns.forEach(btn => {
      if (btn.getAttribute('data-theme-value') === savedTheme) {
        btn.classList.add('active');
        btn.style.borderColor = 'var(--lime)';
        btn.style.backgroundColor = 'var(--lime)';
        btn.style.color = '#111'; // Lock dark text
      } else {
        btn.classList.remove('active');
        btn.style.borderColor = 'var(--grey)';
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--black)';
      }
    });

    // Handle clicks securely
    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Reset all visually
        themeBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'var(--grey)';
          b.style.backgroundColor = 'transparent';
          b.style.color = 'var(--black)';
        });
        
        // Boost newly active
        btn.classList.add('active');
        btn.style.borderColor = 'var(--lime)';
        btn.style.backgroundColor = 'var(--lime)';
        btn.style.color = '#111';

        // Physically execute DOM CSS token update
        const targetedTheme = btn.getAttribute('data-theme-value');
        if (targetedTheme === 'dark') {
          document.body.setAttribute('data-theme', 'dark');
        } else {
          document.body.removeAttribute('data-theme');
        }
        
        // Secure saving
        localStorage.setItem('gtrack-theme', targetedTheme);
      });
    });
  }
});
