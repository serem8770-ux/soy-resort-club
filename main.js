import './style.css'

document.addEventListener('DOMContentLoaded', () => {

  // === CUSTOM CURSOR ===
  const cursor = document.querySelector('.custom-cursor');
  const cursorFollower = document.querySelector('.custom-cursor-follower');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (cursor && cursorFollower && !isTouchDevice) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });

    // Smooth follower animation
    function animateFollower() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover effect on interactive elements
    const interactives = document.querySelectorAll('a, button, .cal-day:not(.empty), input, .gallery-item');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // === MOBILE NAVIGATION ===
  const hamburger = document.getElementById('hamburger-btn');
  const mainNav = document.getElementById('main-nav');
  const overlay = document.getElementById('mobile-overlay');

  function toggleMobileNav() {
    const isOpen = mainNav.classList.contains('open');
    mainNav.classList.toggle('open');
    hamburger.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeMobileNav() {
    mainNav.classList.remove('open');
    hamburger.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMobileNav);
  overlay.addEventListener('click', closeMobileNav);

  // Close nav on link click
  mainNav.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // === HEADER SCROLL EFFECT ===
  const header = document.getElementById('main-header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // === INTERSECTION OBSERVER (fade-in) ===
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
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

  // === COUNTER ANIMATION ===
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.stat-number[data-target]');
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'));
          let current = 0;
          const increment = target / 60;
          const duration = 1500;
          const stepTime = duration / 60;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target;
              clearInterval(timer);
            } else {
              counter.textContent = Math.ceil(current);
            }
          }, stepTime);
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-bar');
  if (statsSection) {
    counterObserver.observe(statsSection);
  }

  // === PARALLAX ===
  const parallaxLayers = document.querySelectorAll('.parallax-layer');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxLayers.forEach(layer => {
          const speed = parseFloat(layer.getAttribute('data-speed')) || 0.2;
          const rect = layer.getBoundingClientRect();
          // Only apply parallax when element is in or near viewport
          if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
            const yPos = -(scrollY * speed);
            layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // === MAGNETIC BUTTONS ===
  const magneticItems = document.querySelectorAll('.magnetic-btn');
  magneticItems.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x / 3}px, ${y / 3}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
      btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    });
    
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'none';
    });
  });

  // === CALENDAR ===
  const monthDisplay = document.getElementById('month-display');
  const calendarGrid = document.getElementById('calendar-grid');
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');
  const selectedInfo = document.getElementById('selected-date-info');
  const chosenDateSpan = document.getElementById('chosen-date');

  let currentDate = new Date();
  const today = new Date();
  
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

      // Mark today
      if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
        el.classList.add('today');
      }

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

  // === ACTIVE NAV HIGHLIGHT ===
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          item.classList.toggle('active-nav', item.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -70% 0px' });

  sections.forEach(section => navObserver.observe(section));

  // === HIDE SCROLL INDICATOR ON SCROLL ===
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = '';
      }
    }, { passive: true });
  }
});
