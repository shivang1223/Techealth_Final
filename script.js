
// ─── API CONFIG ───
// Vercel serves frontend + API on the same domain, so we use relative paths.
const API_URL = '/api/contact';

// ─── SCROLL PROGRESS ───
window.addEventListener('scroll', () => {
  const el = document.getElementById('scrollProgress');
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  el.style.width = pct + '%';
});

// ─── INTERSECTION OBSERVER ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ─── MOBILE MENU ───
let menuOpen = false;
function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('mobileMenu').classList.toggle('open', menuOpen);
}
function closeMenu() {
  menuOpen = false;
  document.getElementById('mobileMenu').classList.remove('open');
}

// ─── TOAST ───
function showToast(title, sub, icon) {
  const t = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastSub').textContent = sub;
  document.getElementById('toastIcon').textContent = icon || '✅';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
}

// ─── SEND TO MONGODB ───
async function sendToSheet(data) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await response.json();
    return json.status === 'ok';
  } catch (err) {
    console.error('API error:', err);
    return false;
  }
}

// ─── DEMO FORM ───
async function submitDemoForm() {
  const name = document.getElementById('f_name').value.trim();
  const phone = document.getElementById('f_phone').value.trim();
  const email = document.getElementById('f_email').value.trim();
  const company = document.getElementById('f_company').value.trim();

  if (!name || !phone || !email || !company) {
    showToast('Please complete all required fields', 'Name, company, phone and email are required.', '⚠️');
    return;
  }

  const btn = document.getElementById('demoSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Submitting...';

  const data = {
    type: 'Demo Request',
    timestamp: new Date().toISOString(),
    name, phone, email, company,
    fleet: document.getElementById('f_fleet').value,
    vehicle: document.getElementById('f_vehicle').value,
    message: document.getElementById('f_message').value.trim()
  };

  await sendToSheet(data);

  document.getElementById('formBody').style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
  showToast('Demo Request Sent!', 'Our team will contact you within 24 hours.', '✅');
}

// ─── CONTACT FORM ───
async function submitContactForm() {
  const name = document.getElementById('c_name').value.trim();
  const email = document.getElementById('c_email').value.trim();
  const msg = document.getElementById('c_message').value.trim();

  if (!name || !email || !msg) {
    showToast('Please fill required fields', 'Name, email and message are required.', '⚠️');
    return;
  }

  const btn = document.getElementById('contactSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending...';

  const data = {
    type: 'Contact Message',
    timestamp: new Date().toISOString(),
    name, email,
    phone: document.getElementById('c_phone').value.trim(),
    subject: document.getElementById('c_subject').value.trim(),
    message: msg
  };

  await sendToSheet(data);

  document.getElementById('contactFormBody').style.display = 'none';
  document.getElementById('contactFormSuccess').style.display = 'block';
  showToast('Message Sent!', 'We will reply within 24 hours.', '✉️');
}

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
