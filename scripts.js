// Mobile menu toggle
document.querySelector('.menu-toggle').addEventListener('click', function () {
  const nav = document.querySelector('nav');
  const isExpanded = this.getAttribute('aria-expanded') === 'true';
  this.setAttribute('aria-expanded', !isExpanded);
  nav.classList.toggle('show');
});

// Close mobile menu on link click
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    const nav = document.querySelector('nav');
    const toggle = document.querySelector('.menu-toggle');
    nav.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  const nav = document.querySelector('nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('show')) {
    nav.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

// Handle keyboard navigation for accessibility
document.querySelector('.menu-toggle').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const isExpanded = e.target.getAttribute('aria-expanded') === 'true';
    e.target.setAttribute('aria-expanded', !isExpanded);
    document.querySelector('nav').classList.toggle('show');
  }
});