// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('active'));
});

// Accordion functionality
document.querySelectorAll('.accordion').forEach(accordion => {
  accordion.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const isActive = item.classList.contains('active');

      // Close all siblings in same accordion
      accordion.querySelectorAll('.accordion-item').forEach(sibling => {
        sibling.classList.remove('active');
        sibling.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        sibling.querySelector('.accordion-body').style.maxHeight = null;
      });

      // Open clicked if it wasn't active
      if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
});

// Contact form — show success state
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.style.display = 'none';
  document.getElementById('contactSuccess').hidden = false;
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.blog-card, .social-card, .process-col').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
