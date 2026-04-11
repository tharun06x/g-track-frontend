document.addEventListener('DOMContentLoaded', () => {
  // Toast Notification System
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.add('show'));
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Visual Ripple / Scale Down Effect on Click
  document.querySelectorAll('button, .select-dropdown, .dropdown-pill, .card, .act-bar').forEach(el => {
    el.addEventListener('mousedown', () => el.style.transform = 'scale(0.97)');
    el.addEventListener('mouseup', () => el.style.transform = '');
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });

  // Highlight Activity days on click
  const activityCols = document.querySelectorAll('.activity-col');
  activityCols.forEach((col) => {
    col.addEventListener('click', (e) => {
      e.stopPropagation();
      activityCols.forEach(c => c.classList.remove('active-col'));
      col.classList.add('active-col');
      
      // Toggle badges
      activityCols.forEach(c => {
         const badge = c.querySelector('.act-badge');
         if(badge && !c.classList.contains('active-col')) badge.remove();
      });
      
      if (!col.querySelector('.act-badge')) {
         const badge = document.createElement('div');
         badge.className = 'act-badge label-badge';
         badge.textContent = Math.floor(Math.random() * 30 + 10);
         col.insertBefore(badge, col.firstChild);
      }
      showToast(`Viewing activity for ${col.querySelector('.act-day').textContent}`);
    });
  });

  // Assign specific toast messages to Interactive Elements
  const bindings = [
    { selector: '.dropdown-pill', message: 'Opening QA Team dropdown...' },
    { selector: '.ph-wallet', message: 'Entering budget manager...' },
    { selector: '.ph-dots-three', message: 'Opening additional options...' },
    { selector: '.vert-bar-col', message: 'Viewing specific performance details...' },
  ];

  bindings.forEach(binding => {
    const elements = document.querySelectorAll(binding.selector);
    elements.forEach(el => {
      const target = el.closest('button, .card, .dropdown-pill, .vert-bar-col') || el;
      target.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast(binding.message);
      });
    });
  });

  // Real-time Arc Gauge Monitoring Simulation
  const gasWeightValue = document.getElementById('gas-weight-value2');
  const gasWeightFill = document.getElementById('gauge-fill2');
  const gaugePointer = document.getElementById('gauge-pointer');
  
  if (gasWeightValue && gasWeightFill && gaugePointer) {
    let currentWeight = 11.4;
    const maxCapacity = 14; // in kg
    const pathLength = 251.3;
    
    // Initial Setup
    gasWeightFill.style.strokeDasharray = pathLength;
    
    function updateGauge(weight) {
      gasWeightValue.textContent = `${weight.toFixed(1)} kg`;
      
      const percentage = weight / maxCapacity;
      const offset = pathLength * (1 - percentage);
      gasWeightFill.style.strokeDashoffset = offset;
      
      const angle = percentage * Math.PI;
      const x_tip = 100 - 80 * Math.cos(angle);
      const y_tip = 110 - 80 * Math.sin(angle);
      const x_cap = x_tip + 10 * Math.sin(angle);
      const y_cap = y_tip - 10 * Math.cos(angle);
      const dx = x_cap - 100;
      const dy = y_cap - 85;
      
      let angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
      if (angleDeg < 100) angleDeg += 360;
      const rotation = angleDeg - 180;
      
      gaugePointer.style.transformOrigin = '0px 0px';
      gaugePointer.style.transform = `rotate(${rotation}deg)`;
      
      if (percentage > 0.85) {
        gasWeightFill.style.stroke = '#ff3a3a'; 
        gasWeightValue.style.color = '#ff3a3a';
      } else {
        gasWeightFill.style.stroke = 'var(--black)'; 
        gasWeightValue.style.color = 'var(--black)';
      }
    }

    // Set to 0 instantly
    gasWeightFill.style.transition = 'none';
    gaugePointer.style.transition = 'none';
    updateGauge(0);

    // Force a reflow
    void gasWeightFill.getBoundingClientRect();

    // Enable slower transition for the initial load animation
    gasWeightFill.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.6s ease';
    gaugePointer.style.transition = 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    // Trigger animation to current weight
    setTimeout(() => {
      updateGauge(currentWeight);
    }, 100);
    
    // Resume random interval variations with normal transition speed
    setInterval(() => {
      const change = (Math.random() * 0.2) - 0.1; 
      currentWeight = Math.max(0, Math.min(maxCapacity, currentWeight + change));
      
      // Keep standard update speed for tick variations
      gasWeightFill.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.6s ease';
      gaugePointer.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      
      updateGauge(currentWeight);
    }, 2000);
  }
});
