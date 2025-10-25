/* script.js - handles nav toggle, dynamic content from data.json, gallery modal, testimonials, smooth scroll, and form */

/* ---------- Mobile Menu Toggle ---------- */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainNav = document.getElementById('mainNav');

mobileMenuBtn.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('nav-open');
  mainNav.classList.toggle('nav-closed', !isOpen);
  mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
});

/* Close mobile nav on link click (for small screens) */
document.querySelectorAll('#mainNav a').forEach(a => {
  a.addEventListener('click', () => {
    if (mainNav.classList.contains('nav-open')) {
      mainNav.classList.remove('nav-open');
      mainNav.classList.add('nav-closed');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  });
});

/* ---------- Smooth Scrolling ---------- */
function scrollToSelector(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href.startsWith('#') || href === '#') return;
    e.preventDefault();
    scrollToSelector(href);
  });
});

/* ---------- Testimonials Slider ---------- */
const testimonialsContainer = document.querySelector('.testimonials-container');
const testimonialCards = document.querySelectorAll('.testimonial');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentIndex = 0;

function updateSlider() {
  testimonialsContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
}

nextBtn && nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % testimonialCards.length;
  updateSlider();
});

prevBtn && prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + testimonialCards.length) % testimonialCards.length;
  updateSlider();
});

setInterval(() => {
  currentIndex = (currentIndex + 1) % testimonialCards.length;
  updateSlider();
}, 5000);

/* ---------- Gallery Modal ---------- */
const modal = document.getElementById('gallery-modal');
const modalImage = document.getElementById('modal-image');
const modalClose = document.getElementById('modal-close');

function openModalWith(src, alt = '') {
  modalImage.src = src;
  modalImage.alt = alt;
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  modalImage.src = '';
  document.body.style.overflow = '';
}

modalClose && modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
});

/* ---------- Contact Form ---------- */
const enrollmentForm = document.getElementById('enrollment-form');
enrollmentForm && enrollmentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thank you for your inquiry! We will contact you soon.');
  enrollmentForm.reset();
});

/* ---------- Data (fetch from data.json) ---------- */
/* Admin can edit data.json in root (news array, gallery array, contact object).
   If you host the site via a server (or GitHub Pages) fetch('data.json') will work.
   If you open the HTML via file:// in some browsers, fetch may be blocked — host via a simple local server:
     python -m http.server 8000
*/

async function loadData() {
  try {
    const res = await fetch('data.json', {cache: "no-store"});
    if (!res.ok) throw new Error('Failed to load data.json');
    const data = await res.json();

    // Populate contact info if present
    if (data.contact) {
      const { location, phone, email, hours } = data.contact;
      document.getElementById('contact-location').textContent = location || document.getElementById('contact-location').textContent;
      document.getElementById('contact-phone').textContent = phone || document.getElementById('contact-phone').textContent;
      document.getElementById('contact-email').textContent = email || document.getElementById('contact-email').textContent;
      document.getElementById('contact-hours').textContent = hours || document.getElementById('contact-hours').textContent;

      // footer mirrors
      const footerLocation = document.getElementById('footer-location');
      const footerPhone = document.getElementById('footer-phone');
      const footerEmail = document.getElementById('footer-email');
      if (footerLocation) footerLocation.textContent = location || footerLocation.textContent;
      if (footerPhone) footerPhone.textContent = phone || footerPhone.textContent;
      if (footerEmail) footerEmail.textContent = email || footerEmail.textContent;
    }

    // Populate News
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = '';
    if (Array.isArray(data.news) && data.news.length) {
      data.news.forEach(item => {
        const card = document.createElement('article');
        card.className = 'news-card';
        const date = item.date ? `<div class="news-date">${item.date}</div>` : '';
        card.innerHTML = `
          <h4>${escapeHtml(item.title || '')}</h4>
          ${date}
          <p>${escapeHtml(item.description || '')}</p>
        `;
        newsList.appendChild(card);
      });
    } else {
      newsList.innerHTML = '<p>No news available right now.</p>';
    }

    // Populate Gallery
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = '';
    if (Array.isArray(data.gallery) && data.gallery.length) {
      data.gallery.forEach((g) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
          <img src="${escapeAttr(g.image)}" alt="${escapeAttr(g.alt || 'Gallery image')}">
          <div class="gallery-overlay"><i class="fas fa-search-plus"></i></div>
        `;
        // click to open modal
        item.addEventListener('click', () => {
          const img = item.querySelector('img');
          openModalWith(img.src, img.alt);
        });
        galleryGrid.appendChild(item);
      });
    } else {
      galleryGrid.innerHTML = '<p>No gallery images available.</p>';
    }
  } catch (err) {
    console.error(err);
    const newsList = document.getElementById('news-list');
    const galleryGrid = document.getElementById('galleryGrid');
    if (newsList) newsList.innerHTML = '<p>Unable to load news (check data.json).</p>';
    if (galleryGrid) galleryGrid.innerHTML = '<p>Unable to load gallery (check data.json).</p>';
  }
}

/* Escaping helpers */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;');
}

/* Load data on start */
loadData();
