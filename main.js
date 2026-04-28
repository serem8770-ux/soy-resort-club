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
    const interactives = document.querySelectorAll('a, button, .cal-day:not(.empty), input, .gallery-item, .room-card');
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
            const isHero = layer.classList.contains('hero-image-container') || layer.classList.contains('bg-media');
            if (window.innerWidth <= 768 && !isHero) {
              layer.style.transform = `translate3d(0, 0, 0)`;
            } else {
              let yPos;
              if (isHero) {
                yPos = -(scrollY * speed);
              } else {
                const windowCenter = window.innerHeight / 2;
                const elementCenter = rect.top + (rect.height / 2);
                yPos = (elementCenter - windowCenter) * speed;
              }
              layer.style.transform = `scale(1.15) translate3d(0, ${yPos}px, 0)`;
            }
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

  // =============================================================
  //  BOOKING SYSTEM
  // =============================================================

  // === HTML SANITIZER (XSS Prevention) ===
  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  const ROOM_RATE = 2500;
  const bookingModal = document.getElementById('booking-modal');
  const bookingModalOverlay = bookingModal.querySelector('.booking-modal-overlay');
  const bookingModalClose = document.getElementById('booking-modal-close');
  const bookingForm = document.getElementById('booking-form');
  const step1 = document.getElementById('booking-step-1');
  const step2 = document.getElementById('booking-step-2');
  const selectedRoomDisplay = document.getElementById('selected-room-display');
  const summaryRoom = document.getElementById('summary-room');
  const summaryNights = document.getElementById('summary-nights');
  const summaryTotal = document.getElementById('summary-total');
  const checkinInput = document.getElementById('checkin-date');
  const checkoutInput = document.getElementById('checkout-date');
  const bookingRefNumber = document.getElementById('booking-ref-number');
  const confirmationDetails = document.getElementById('confirmation-details');
  const closeConfirmation = document.getElementById('close-confirmation');

  const checkoutGroup = document.getElementById('checkout-group');
  const checkinLabel = document.getElementById('checkin-label');
  const summaryNightsRow = document.getElementById('summary-nights-row');
  const summaryRoomLabel = document.getElementById('summary-room-label');

  let selectedRoom = '';
  let selectedRoomName = '';
  let isExcursion = false;

  // Set minimum date to today
  const todayStr = today.toISOString().split('T')[0];
  checkinInput.min = todayStr;
  checkoutInput.min = todayStr;

  // Open booking modal
  document.querySelectorAll('.room-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedRoom = btn.dataset.room;
      selectedRoomName = btn.dataset.roomName;
      isExcursion = ['massage', 'yoga', 'sound-bath', 'organic-lounge'].includes(selectedRoom);
      
      if (isExcursion) {
        checkinLabel.textContent = 'Date';
        checkoutGroup.style.display = 'none';
        checkoutInput.removeAttribute('required');
        summaryNightsRow.style.display = 'none';
        summaryRoomLabel.textContent = 'Excursion';
      } else {
        checkinLabel.textContent = 'Check-in';
        checkoutGroup.style.display = 'flex';
        checkoutInput.setAttribute('required', 'true');
        summaryNightsRow.style.display = 'flex';
        summaryRoomLabel.textContent = 'Accommodation';
      }

      selectedRoomDisplay.textContent = selectedRoomName;
      summaryRoom.textContent = selectedRoomName;
      openModal(bookingModal);
      step1.classList.add('active');
      step2.classList.remove('active');
      
      // Update form context
      checkinInput.value = '';
      checkoutInput.value = '';
      updateSummary();
    });
  });

  function openModal(modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  bookingModalClose.addEventListener('click', () => closeModal(bookingModal));
  bookingModalOverlay.addEventListener('click', () => closeModal(bookingModal));
  closeConfirmation.addEventListener('click', () => closeModal(bookingModal));

  // Calculate nights and total
  function updateSummary() {
    if (isExcursion) {
      if (checkinInput.value) {
        summaryTotal.textContent = `KES ${ROOM_RATE.toLocaleString()}`;
      } else {
        summaryTotal.textContent = 'KES 0';
      }
    } else {
      const checkin = new Date(checkinInput.value);
      const checkout = new Date(checkoutInput.value);
      if (checkinInput.value && checkoutInput.value && checkout > checkin) {
        const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
        const total = nights * ROOM_RATE;
        summaryNights.textContent = `${nights} night${nights > 1 ? 's' : ''}`;
        summaryTotal.textContent = `KES ${total.toLocaleString()}`;
      } else {
        summaryNights.textContent = '—';
        summaryTotal.textContent = 'KES 0';
      }
    }
  }

  checkinInput.addEventListener('change', () => {
    // Auto-set checkout min to day after checkin
    if (checkinInput.value) {
      const nextDay = new Date(checkinInput.value);
      nextDay.setDate(nextDay.getDate() + 1);
      checkoutInput.min = nextDay.toISOString().split('T')[0];
      if (checkoutInput.value && new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
        checkoutInput.value = nextDay.toISOString().split('T')[0];
      }
    }
    updateSummary();
  });

  checkoutInput.addEventListener('change', updateSummary);

  // Generate booking reference
  function generateRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let ref = 'SOY-';
    for (let i = 0; i < 6; i++) {
      ref += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return ref;
  }

  // Submit booking
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const checkin = new Date(checkinInput.value);
    let nights = 1;
    let total = ROOM_RATE;
    let checkoutValue = checkinInput.value;

    if (!isExcursion) {
      const checkout = new Date(checkoutInput.value);
      if (checkout <= checkin) {
        alert('Check-out date must be after check-in date.');
        return;
      }
      nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
      total = nights * ROOM_RATE;
      checkoutValue = checkoutInput.value;
    }

    const ref = generateRef();

    const booking = {
      id: Date.now().toString(),
      ref: ref,
      guestName: document.getElementById('guest-name').value.trim(),
      guestEmail: document.getElementById('guest-email').value.trim(),
      guestPhone: document.getElementById('guest-phone').value.trim(),
      guestCount: parseInt(document.getElementById('guest-count').value),
      room: selectedRoomName,
      roomType: selectedRoom,
      checkin: checkinInput.value,
      checkout: checkoutValue,
      nights: nights,
      total: total,
      specialRequests: document.getElementById('special-requests').value.trim(),
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    saveBooking(booking);

    // Show confirmation (sanitized against XSS)
    bookingRefNumber.textContent = ref;
    confirmationDetails.innerHTML = `
      <strong>Guest:</strong> ${escapeHtml(booking.guestName)}<br>
      <strong>${isExcursion ? 'Excursion' : 'Room'}:</strong> ${escapeHtml(booking.room)}<br>
      <strong>${isExcursion ? 'Date' : 'Check-in'}:</strong> ${escapeHtml(formatDate(booking.checkin))}<br>
      ${!isExcursion ? `<strong>Check-out:</strong> ${escapeHtml(formatDate(booking.checkout))}<br>
      <strong>Duration:</strong> ${nights} night${nights > 1 ? 's' : ''}<br>` : ''}
      <strong>Total:</strong> KES ${total.toLocaleString()}
    `;

    step1.classList.remove('active');
    step2.classList.add('active');

    // Reset form
    bookingForm.reset();
    summaryNights.textContent = '—';
    summaryTotal.textContent = 'KES 0';
  });

  // =============================================================
  //  LOCAL STORAGE CRUD
  // =============================================================

  function getBookings() {
    try {
      return JSON.parse(localStorage.getItem('soy_bookings')) || [];
    } catch {
      return [];
    }
  }

  function saveBooking(booking) {
    const bookings = getBookings();
    bookings.push(booking);
    localStorage.setItem('soy_bookings', JSON.stringify(bookings));
  }

  function updateBookingStatus(id, status) {
    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index].status = status;
      localStorage.setItem('soy_bookings', JSON.stringify(bookings));
    }
  }

  function deleteBooking(id) {
    let bookings = getBookings();
    bookings = bookings.filter(b => b.id !== id);
    localStorage.setItem('soy_bookings', JSON.stringify(bookings));
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // =============================================================
  //  CRM DASHBOARD
  // =============================================================

  const CRM_PIN = '1234';
  let pinAttempts = 0;
  const MAX_PIN_ATTEMPTS = 3;
  let pinLockoutUntil = 0;
  const crmPinModal = document.getElementById('crm-pin-modal');
  const crmPinOverlay = crmPinModal.querySelector('.booking-modal-overlay');
  const crmPinClose = crmPinModal.querySelector('.crm-pin-close');
  const crmPinInput = document.getElementById('crm-pin');
  const crmPinSubmit = document.getElementById('pin-submit');
  const pinError = document.getElementById('pin-error');
  const crmDashboard = document.getElementById('crm-dashboard');
  const crmCloseBtn = document.getElementById('crm-close');
  const crmAdminLink = document.getElementById('crm-admin-link');

  // Open CRM via admin link
  crmAdminLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(crmPinModal);
    crmPinInput.value = '';
    pinError.classList.add('hidden');
    setTimeout(() => crmPinInput.focus(), 300);
  });

  // PIN close
  crmPinClose.addEventListener('click', () => closeModal(crmPinModal));
  crmPinOverlay.addEventListener('click', () => closeModal(crmPinModal));

  // PIN submit
  crmPinSubmit.addEventListener('click', () => attemptPinLogin());
  crmPinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptPinLogin();
  });

  function attemptPinLogin() {
    // Rate limiting: block if locked out
    if (Date.now() < pinLockoutUntil) {
      const secsLeft = Math.ceil((pinLockoutUntil - Date.now()) / 1000);
      pinError.textContent = `Too many attempts. Try again in ${secsLeft}s.`;
      pinError.classList.remove('hidden');
      return;
    }

    if (crmPinInput.value === CRM_PIN) {
      pinAttempts = 0;
      closeModal(crmPinModal);
      openCRM();
    } else {
      pinAttempts++;
      if (pinAttempts >= MAX_PIN_ATTEMPTS) {
        pinLockoutUntil = Date.now() + 30000; // 30-second lockout
        pinError.textContent = 'Too many attempts. Locked for 30 seconds.';
        pinAttempts = 0;
      } else {
        pinError.textContent = `Incorrect PIN. ${MAX_PIN_ATTEMPTS - pinAttempts} attempt(s) remaining.`;
      }
      pinError.classList.remove('hidden');
      crmPinInput.value = '';
      crmPinInput.focus();
    }
  }

  function openCRM() {
    crmDashboard.classList.add('active');
    crmDashboard.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    refreshCRM();
  }

  function closeCRM() {
    crmDashboard.classList.remove('active');
    crmDashboard.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  crmCloseBtn.addEventListener('click', closeCRM);

  // CRM Tabs
  document.querySelectorAll('.crm-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.crm-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.crm-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // Refresh CRM Data
  function refreshCRM() {
    const bookings = getBookings();

    // Stats
    document.getElementById('crm-total-bookings').textContent = bookings.length;

    const totalRevenue = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.total || 0), 0);
    document.getElementById('crm-total-revenue').textContent = `KES ${totalRevenue.toLocaleString()}`;

    const pending = bookings.filter(b => b.status === 'confirmed').length;
    document.getElementById('crm-pending').textContent = pending;

    const uniqueGuests = [...new Set(bookings.map(b => b.guestEmail))];
    document.getElementById('crm-total-guests').textContent = uniqueGuests.length;

    // Bookings Table
    renderBookingsTable(bookings);

    // Guests Table
    renderGuestsTable(bookings);
  }

  function renderBookingsTable(bookings, filter = 'all', search = '') {
    const tbody = document.getElementById('crm-bookings-body');
    const empty = document.getElementById('crm-empty-bookings');
    const table = document.getElementById('crm-bookings-table');

    let filtered = bookings;
    if (filter !== 'all') {
      filtered = filtered.filter(b => b.status === filter);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(b =>
        b.guestName.toLowerCase().includes(s) ||
        b.ref.toLowerCase().includes(s) ||
        b.room.toLowerCase().includes(s) ||
        b.guestEmail.toLowerCase().includes(s)
      );
    }

    if (filtered.length === 0) {
      table.style.display = 'none';
      empty.style.display = 'block';
    } else {
      table.style.display = 'table';
      empty.style.display = 'none';
    }

    tbody.innerHTML = filtered.map(b => `
      <tr>
        <td><strong>${escapeHtml(b.ref)}</strong></td>
        <td>${escapeHtml(b.guestName)}</td>
        <td>${escapeHtml(b.room)}</td>
        <td>${escapeHtml(formatDate(b.checkin))}</td>
        <td>${escapeHtml(formatDate(b.checkout))}</td>
        <td>KES ${(b.total || 0).toLocaleString()}</td>
        <td><span class="status-badge status-${escapeHtml(b.status)}">${escapeHtml(b.status.replace('-', ' '))}</span></td>
        <td>
          ${b.status === 'confirmed' ? `<button class="crm-action-btn" data-id="${escapeHtml(b.id)}" data-action="checked-in">Check In</button>` : ''}
          ${b.status === 'checked-in' ? `<button class="crm-action-btn" data-id="${escapeHtml(b.id)}" data-action="checked-out">Check Out</button>` : ''}
          ${b.status !== 'cancelled' && b.status !== 'checked-out' ? `<button class="crm-action-btn danger" data-id="${escapeHtml(b.id)}" data-action="cancelled">Cancel</button>` : ''}
          <button class="crm-action-btn danger" data-id="${escapeHtml(b.id)}" data-action="delete">🗑️</button>
        </td>
      </tr>
    `).join('');

    // Bind action buttons
    tbody.querySelectorAll('.crm-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === 'delete') {
          if (confirm('Delete this booking permanently?')) {
            deleteBooking(id);
            refreshCRM();
          }
        } else {
          updateBookingStatus(id, action);
          refreshCRM();
        }
      });
    });
  }

  function renderGuestsTable(bookings, search = '') {
    const tbody = document.getElementById('crm-guests-body');
    const empty = document.getElementById('crm-empty-guests');
    const table = document.getElementById('crm-guests-table');

    // Group by email
    const guestMap = {};
    bookings.forEach(b => {
      if (!guestMap[b.guestEmail]) {
        guestMap[b.guestEmail] = {
          name: b.guestName,
          email: b.guestEmail,
          phone: b.guestPhone,
          bookings: 0,
          spent: 0
        };
      }
      guestMap[b.guestEmail].bookings++;
      if (b.status !== 'cancelled') {
        guestMap[b.guestEmail].spent += (b.total || 0);
      }
    });

    let guests = Object.values(guestMap);

    if (search) {
      const s = search.toLowerCase();
      guests = guests.filter(g =>
        g.name.toLowerCase().includes(s) ||
        g.email.toLowerCase().includes(s) ||
        g.phone.toLowerCase().includes(s)
      );
    }

    if (guests.length === 0) {
      table.style.display = 'none';
      empty.style.display = 'block';
    } else {
      table.style.display = 'table';
      empty.style.display = 'none';
    }

    tbody.innerHTML = guests.map(g => `
      <tr>
        <td><strong>${escapeHtml(g.name)}</strong></td>
        <td>${escapeHtml(g.email)}</td>
        <td>${escapeHtml(g.phone)}</td>
        <td>${g.bookings}</td>
        <td>KES ${g.spent.toLocaleString()}</td>
      </tr>
    `).join('');
  }

  // CRM Search & Filter
  const searchBookings = document.getElementById('crm-search-bookings');
  const filterStatus = document.getElementById('crm-filter-status');
  const searchGuests = document.getElementById('crm-search-guests');

  searchBookings.addEventListener('input', () => {
    renderBookingsTable(getBookings(), filterStatus.value, searchBookings.value);
  });

  filterStatus.addEventListener('change', () => {
    renderBookingsTable(getBookings(), filterStatus.value, searchBookings.value);
  });

  searchGuests.addEventListener('input', () => {
    renderGuestsTable(getBookings(), searchGuests.value);
  });

  // Export CSV
  document.getElementById('crm-export').addEventListener('click', () => {
    const bookings = getBookings();
    if (bookings.length === 0) {
      alert('No bookings to export.');
      return;
    }

    const headers = ['Ref', 'Guest', 'Email', 'Phone', 'Room', 'Check-in', 'Check-out', 'Nights', 'Total (KES)', 'Status', 'Created'];
    const rows = bookings.map(b => [
      b.ref,
      b.guestName,
      b.guestEmail,
      b.guestPhone,
      b.room,
      b.checkin,
      b.checkout,
      b.nights,
      b.total,
      b.status,
      b.createdAt
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(val => `"${val}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soy-resort-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // =============================================================
  //  NEWSLETTER SUBSCRIPTION
  // =============================================================
  const newsletterSubmitBtn = document.getElementById('newsletter-submit-btn');
  const newsletterEmail = document.getElementById('newsletter-email');

  if (newsletterSubmitBtn && newsletterEmail) {
    newsletterSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newsletterSubmitBtn.textContent = 'Joined!';
        newsletterSubmitBtn.style.backgroundColor = 'var(--color-sage)';
        newsletterSubmitBtn.style.color = 'white';
        newsletterEmail.value = '';
        setTimeout(() => {
          newsletterSubmitBtn.textContent = 'Join';
          newsletterSubmitBtn.style.backgroundColor = '';
          newsletterSubmitBtn.style.color = '';
        }, 3000);
      } else {
        alert('Please enter a valid email address to join our newsletter.');
      }
    });
  }

});
