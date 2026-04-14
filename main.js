import './style.css'

document.addEventListener('DOMContentLoaded', () => {

  // Custom Cursor Logic
  const cursor = document.querySelector('.custom-cursor');
  const cursorFollower = document.querySelector('.custom-cursor-follower');

  if (cursor && cursorFollower) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      
      // Follower has slight delay via CSS transition on transform? No, do it with JS for smoother feel or just let CSS handle it.
      // Better to just update left/top and let CSS transform translate handle center
      cursorFollower.style.left = `${e.clientX}px`;
      cursorFollower.style.top = `${e.clientY}px`;
    });

    // Add hover effect to interactive elements
    const interactives = document.querySelectorAll('a, button, .cal-day, input, .gallery-item');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // Header scroll effect
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Fade-in elements on scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in-up, .stagger-wrapper').forEach(el => {
    observer.observe(el);
  });

  // Smooth Parallax
  const parallaxLayers = document.querySelectorAll('.parallax-layer');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxLayers.forEach(layer => {
      const speed = layer.getAttribute('data-speed') || 0.2;
      const yPos = -(scrollY * speed);
      // We apply it smoothly via CSS translate
      layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }, { passive: true });

  // Magnetic Button Hover
  const magneticItems = document.querySelectorAll('.magnetic-btn');
  magneticItems.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Gentle pull (divide by 3 for subtle effect)
      btn.style.transform = `translate(${x / 2.5}px, ${y / 2.5}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
      btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    });
    
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'none'; // remove transition for smooth tracking
    });
  });

  // Calendar Logic
  const monthDisplay = document.getElementById('month-display');
  const calendarGrid = document.getElementById('calendar-grid');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');
  const selectedInfo = document.getElementById('selected-date-info');
  const chosenDateSpan = document.getElementById('chosen-date');

  let currentDate = new Date();
  
  function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    monthDisplay.textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    days.forEach(day => {
      const el = document.createElement('div');
      el.className = 'cal-day-header';
      el.textContent = day;
      calendarGrid.appendChild(el);
    });

    for (let i = 0; i < firstDay; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day empty';
      calendarGrid.appendChild(el);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const el = document.createElement('div');
      el.className = 'cal-day';
      el.textContent = i;
      el.addEventListener('click', () => {
        document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('active'));
        el.classList.add('active');
        selectedInfo.classList.remove('hidden');
        chosenDateSpan.textContent = `${monthNames[month]} ${i}, ${year}`;
      });
      calendarGrid.appendChild(el);
    }
  }

  prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
});
