document.addEventListener('DOMContentLoaded', () => {
  // Toast Notification System
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Visual Ripple / Scale Down Effect on Click
  document.querySelectorAll('button, .select-dropdown, .dropdown-pill, .card, .cal-day').forEach(el => {
    el.addEventListener('mousedown', () => el.style.transform = 'scale(0.97)');
    el.addEventListener('mouseup', () => el.style.transform = '');
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });

  // Highlight days in calendar on click
  const calendarDays = document.querySelectorAll('.cal-day');
  calendarDays.forEach((day) => {
    day.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarDays.forEach(d => d.classList.remove('active-cal'));
      day.classList.add('active-cal');
      showToast(`Selected calendar day: ${day.querySelector('.cal-date').textContent}`);
    });
  });

  // Assign specific toast messages to Interactive Elements
  const bindings = [
    { selector: '.ph-gear', message: 'Opened System Settings' },
    { selector: '.ph-bell', message: 'You have 3 new alerts' },
    { selector: '.ph-sliders', message: 'Opened Widget Configuration' },
    { selector: '.user-info', message: 'Viewing Alesha\'s Manager Profile' },
    { selector: '.select-dropdown', message: 'Loading available reports list...' },
    { selector: '.ph-paper-plane-tilt', message: 'G-TRACK dashboard report sent successfully!' },
    { selector: '.pill-btn', message: 'Opening new feature task modal...' },
    { selector: '.dropdown-pill', message: 'Selecting active month...' },
    { selector: '.widget-date', message: 'Opening full calendar schedule...' },
    { selector: '.widget-total-time', message: 'Viewing detailed timesheets (645h total)...' },
    { selector: '.widget-efficiency', message: 'Loading graphical efficiency breakdown...' },
    { selector: '.widget-ai', message: 'Initializing AI Smart Assistant sequence...' }
  ];

  // Navigate to Real-Time Monitoring on G-TRACK Title Area click
  const projectInfo = document.querySelector('.project-info');
  if (projectInfo) {
    projectInfo.style.cursor = 'pointer';
    projectInfo.addEventListener('click', (e) => {
      e.stopPropagation();
      // Added a brief UI feedback showing transition
      projectInfo.style.opacity = '0.5';
      showToast('Loading Real-Time Monitoring Dashboard...');
      setTimeout(() => {
        projectInfo.style.opacity = '1';
        window.location.href = 'monitoring.html';
      }, 500);
    });
  }

  bindings.forEach(binding => {
    const elements = document.querySelectorAll(binding.selector);
    elements.forEach(el => {
      // Find the closest clickable parent if necessary
      const target = el.closest('button, .card, .select-dropdown, .dropdown-pill') || el;
      target.addEventListener('click', (e) => {
        e.stopPropagation();
        showToast(binding.message);
      });
    });
  });

  // Fallback for clicking cards themselves
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      // If the card wasn't intercepted by a specific binding button
      showToast('Exploring dashboard widget...');
    });
  });

  // Real-time Gas Weight Monitoring Simulation has been removed.
  // The application strictly relies on user-dashboard-api.js for live telemetry.

  // Interactive Calendar inside Report Dashboard
  const reportCalCells = document.querySelectorAll('.cal-cell:not(.old-month)');
  const analyticsLine = document.getElementById('analytics-line');
  const analyticsArea = document.getElementById('analytics-area');
  const analyticsAvg = document.getElementById('analytics-avg');

  if (analyticsLine && analyticsArea && reportCalCells.length > 0) {
    reportCalCells.forEach(cell => {
      cell.addEventListener('click', () => {
        // Update active class
        document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('active-date'));
        cell.classList.add('active-date');

        // Generate smooth path to simulate data change
        let pts = [];
        for(let i = 0; i <= 5; i++) {
           pts.push({ x: i * 200, y: Math.floor(Math.random() * 120 + 40) });
        }
        let d = `M${pts[0].x},${pts[0].y}`;
        for(let i = 0; i < 5; i++) {
           const p1 = pts[i];
           const p2 = pts[i+1];
           const mx = (p1.x + p2.x) / 2;
           d += ` C${mx},${p1.y} ${mx},${p2.y} ${p2.x},${p2.y}`;
        }
        
        // Update SVG (animations are handled by CSS transitions)
        analyticsLine.setAttribute('d', d);
        analyticsArea.setAttribute('d', d + ' L1000,200 L0,200 Z');
        
        // Update stats
        if(analyticsAvg) {
           analyticsAvg.textContent = (Math.floor(Math.random() * 25) + 12) + ' min/avg';
        }
        
        const dateStr = Array.from(cell.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .join('');

        showToast('Updated Delivery Analytics for Day ' + dateStr);
      });
    });
  }

  // Dynamic Tooltip for Usage History Graph
  const barCols = document.querySelectorAll('.bar-col');
  if (barCols.length > 0) {
    const tooltip = document.createElement('div');
    tooltip.className = 'dynamic-tooltip';
    document.body.appendChild(tooltip);

    barCols.forEach(col => {
      col.addEventListener('mousemove', (e) => {
        const text = col.getAttribute('data-tooltip');
        if (text) {
          tooltip.textContent = text;
          tooltip.classList.add('show');
          // Place slightly above the cursor
          tooltip.style.left = e.pageX + 'px';
          tooltip.style.top = (e.pageY - 45) + 'px';
        }
      });
      col.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
      });
    });
  }

  // Set the usage history current month dynamically
  const usageMonth = document.getElementById('usage-month');
  if (usageMonth) {
    const today = new Date();
    usageMonth.textContent = today.toLocaleDateString('en-US', { month: 'long' });
  }

  // --- Dynamic Dashboard Date Syncer ---
  const today = new Date();
  
  // 1. Report Subtitle Date
  const reportSubtitle = document.getElementById('report-subtitle');
  if (reportSubtitle) {
    const options = { weekday: 'short', day: 'numeric' };
    reportSubtitle.innerHTML = `<i class="ph ph-file-text"></i> 3 reports &bull; ${today.toLocaleDateString('en-US', options)}`;
  }

  // 2. Report Horizontal Calendar Syncer (center on today)
  const calScrollDays = document.querySelectorAll('.calendar-scroll .cal-day');
  if (calScrollDays.length === 6) {
    const offsetStart = -3; // Put today at index 3 (4th item)
    calScrollDays.forEach((el, index) => {
      const iterDate = new Date();
      iterDate.setDate(today.getDate() + offsetStart + index);
      
      el.querySelector('.cal-date').textContent = iterDate.getDate();
      el.querySelector('.cal-name').textContent = iterDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (offsetStart + index === 0) {
        el.classList.add('active-cal');
      } else {
        el.classList.remove('active-cal');
      }
    });
  }

  // 3. Usage History Bars Syncer
  const usageBars = document.querySelectorAll('.bar-container .bar-col');
  const currentNumDay = today.getDate();
  usageBars.forEach((col, index) => {
    const day = index + 1; // 1 to 30
    const innerBar = col.querySelector('.bar');
    if (!innerBar) return;

    if (day > currentNumDay) {
      // Future
      col.classList.add('future-col');
      col.removeAttribute('data-tooltip');
      innerBar.className = 'bar bar-future';
      // Fallback height for aesthetics
      innerBar.style.height = '50%';
    } else {
      // Past or present
      col.classList.remove('future-col');
      if (innerBar.classList.contains('bar-future')) {
         innerBar.className = 'bar bar-green'; 
         innerBar.style.height = '30%'; 
         col.setAttribute('data-tooltip', `${today.toLocaleDateString('en-US', { month: 'short' })} ${day}`);
      }

      // If it's today's bar
      if (day === currentNumDay) {
        col.id = 'live-bar-col';
        innerBar.id = 'live-bar-fill';
        col.setAttribute('data-tooltip', `${today.toLocaleDateString('en-US', { month: 'short' })} ${day}`);
      }
    }
  });

  // --- Yearly Trend Animation (Intersection Observer) ---
  const trendBars = document.querySelectorAll('.trend-bar');
  if (trendBars.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Set height to data-target to trigger the CSS transition
          const targetHeight = entry.target.getAttribute('data-target');
          if (targetHeight) {
            entry.target.style.height = targetHeight;
          }
          // Optionally unobserve after animating once
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1 // Trigger when at least 10% of the bar is visible
    });

    trendBars.forEach(bar => {
      observer.observe(bar);
    });
  }

});
