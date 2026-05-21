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

  // Real-time Arc Gauge Monitoring API Integration
  const gasWeightValue = document.getElementById('gas-weight-value2');
  const gasWeightFill = document.getElementById('gauge-fill2');
  const gaugePointer = document.getElementById('gauge-pointer');
  
  if (gasWeightValue && gasWeightFill && gaugePointer) {
    const maxCapacity = 14; // in kg
    const pathLength = 251.3;
    
    // Initial Setup
    gasWeightFill.style.strokeDasharray = pathLength;
    
    function updateGauge(weight) {
      gasWeightValue.textContent = `${weight.toFixed(1)} kg`;
      
      const percentage = Math.max(0, Math.min(1, weight / maxCapacity));
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
      
      if (percentage < 0.2) {
        gasWeightFill.style.stroke = '#ff3a3a'; 
        gasWeightValue.style.color = '#ff3a3a';
      } else {
        gasWeightFill.style.stroke = 'var(--black)'; 
        gasWeightValue.style.color = 'var(--black)';
      }
    }

    // Set to 0 instantly for entrance animation
    gasWeightFill.style.transition = 'none';
    gaugePointer.style.transition = 'none';
    updateGauge(0);
    void gasWeightFill.getBoundingClientRect(); // reflow

    // Setup transitions
    gasWeightFill.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.6s ease';
    gaugePointer.style.transition = 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';

    // Fetch API Data
    async function fetchLiveData() {
      try {
        const auth = window.GTrackApi.readAuth();
        if (!auth || !auth.token) return;

        const me = await window.GTrackApi.request('/api/v1/users/me', { token: auth.token });
        if (!me.device_id) return;

        const summary = await window.GTrackApi.request(`/api/v1/dashboard/summary?device_id=${encodeURIComponent(me.device_id)}`);
        
        const currentWeight = Number(summary.remaining_gas || 0);
        updateGauge(currentWeight);
      } catch (err) {
        console.error('Failed to fetch dashboard2 gauge data:', err);
      }
    }
    
    setTimeout(fetchLiveData, 100);
  }
});
