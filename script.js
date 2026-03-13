(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Lead capture:
  // If you provide a Google Apps Script Web App URL, paste it below.
  // It should accept POST JSON and write to a Google Sheet.
  const LEAD_WEBHOOK_URL = window.LEAD_WEBHOOK_URL || "";

  // Booking (one-step CTA)
  // Set BOOKING_URL to a Google Calendar Appointment Schedule link.
  const BOOKING_URL = window.BOOKING_URL || "";
  const bookingWrap = document.getElementById('bookingWrap');
  const bookingFrame = document.getElementById('bookingFrame');
  const bookingOpen = document.getElementById('bookingOpen');

  if (BOOKING_URL && bookingFrame && bookingWrap && bookingOpen) {
    bookingFrame.src = BOOKING_URL;
    bookingFrame.style.display = 'block';
    bookingOpen.href = BOOKING_URL;
    bookingOpen.style.display = 'inline-flex';
    bookingWrap.style.display = 'none';
  }

  document.querySelectorAll('[data-booking]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (BOOKING_URL) {
        e.preventDefault();
        window.open(BOOKING_URL, '_blank', 'noopener');
      }
    });
  });

  // Scroll reveal
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.12 }
    );
    revealEls.forEach(el => io.observe(el));
  }

  // Scrollspy (active nav)
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const linkToSection = navLinks
    .map(a => [a, document.querySelector(a.getAttribute('href'))])
    .filter(([, s]) => s);

  if (linkToSection.length) {
    const so = new IntersectionObserver((entries) => {
      // pick the most visible section
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => (b.intersectionRatio||0) - (a.intersectionRatio||0))[0];
      if (!visible) return;
      navLinks.forEach(a => a.classList.remove('active'));
      const match = linkToSection.find(([, s]) => s === visible.target);
      if (match) match[0].classList.add('active');
    }, { rootMargin: '-20% 0px -70% 0px', threshold: [0.05, 0.15, 0.3] });

    linkToSection.forEach(([, s]) => so.observe(s));
  }

  // Hero micro-interaction (subtle parallax on desktop)
  const heroPhoto = document.querySelector('.hero-photo');
  const heroWrap = document.querySelector('.hero-photo-wrap');
  if (heroPhoto && heroWrap) {
    let raf = null;
    const onMove = (ev) => {
      const r = heroWrap.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - 0.5;
      const y = (ev.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        heroPhoto.style.transform = `translate(${x*10}px, ${y*10}px) scale(1.06)`;
      });
    };
    const onLeave = () => {
      heroPhoto.style.transform = 'scale(1.03)';
    };
    heroWrap.addEventListener('mousemove', onMove);
    heroWrap.addEventListener('mouseleave', onLeave);
  }

  const form = document.getElementById('leadForm');
  const statusEl = document.getElementById('formStatus');

  function setStatus(msg, ok=false){
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = ok ? '#16a34a' : '#64748b';
  }

  async function postLead(payload){
    const res = await fetch(LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('bad_status');
  }

  function mailtoLead(payload){
    const subject = encodeURIComponent('Navexela — new consultation request');
    const body = encodeURIComponent(
      `Name: ${payload.name}\nEmail: ${payload.email}\nCompany: ${payload.company||''}\n\nMessage:\n${payload.message}`
    );
    window.location.href = `mailto:d.murray@navexela.com?subject=${subject}&body=${body}`;
  }

  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: String(fd.get('name')||'').trim(),
        email: String(fd.get('email')||'').trim(),
        company: String(fd.get('company')||'').trim(),
        message: String(fd.get('message')||'').trim(),
        ts: new Date().toISOString(),
        page: window.location.href
      };

      if (!payload.name || !payload.email || !payload.message) {
        setStatus('Please fill name, email and message.');
        return;
      }

      try {
        if (LEAD_WEBHOOK_URL) {
          setStatus('Sending…');
          await postLead(payload);
          form.reset();
          setStatus('Sent. We’ll reply within 24h.', true);
        } else {
          setStatus('Opening email…');
          mailtoLead(payload);
        }
      } catch (err) {
        setStatus('Send failed. Falling back to email…');
        mailtoLead(payload);
      }
    });
  }
})();
