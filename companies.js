// CSRF Token Generation (Simplified for static site)
function generateCsrfToken() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID(); // Secure random token
  } else {
    // Fallback for older browsers
    return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).substring(0, 32);
  }
}

// Set CSRF token in localStorage and hidden field
function initCsrf() {
  const token = generateCsrfToken();
  const csrfInput = document.getElementById('csrfToken');
  if (csrfInput) {
    csrfInput.value = token;
    // Use localStorage instead of cookie for static site reliability
    localStorage.setItem('csrfToken', token);
  }
}

// Client-side validation and sanitization
function validateForm(formData) {
  const errors = [];
  
  // Sanitize inputs (XSS prevention - strip tags/scripts)
  for (let key in formData) {
    formData[key] = formData[key]
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/on\w+=['"][^'"]*['"]/gi, '') // Remove event handlers
      .trim(); // Trim whitespace
  }
  
  // Field-specific validation
  if (!formData.companyName || formData.companyName.length < 2 || formData.companyName.length > 100) {
    errors.push('Company name must be 2-100 characters.');
  }
  if (!formData.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
    errors.push('Valid email required.');
  }
  if (!formData.roles || formData.roles.length < 5 || formData.roles.length > 200) {
    errors.push('Roles must be 5-200 characters.');
  }
  if (formData.message && formData.message.length > 1000) {
    errors.push('Message must be under 1000 characters.');
  }
  
  // CSRF check (compare localStorage to form token)
  const storedToken = localStorage.getItem('csrfToken');
  const formToken = formData._csrf;
  if (!storedToken || storedToken !== formToken) {
    // Allow form submission in local development (http) for testing
    if (window.location.protocol === 'http:') {
      console.warn('CSRF validation skipped for local testing (http). Ensure HTTPS in production.');
    } else {
      errors.push('Security token mismatch. Please refresh and try again.');
      return { valid: false, errors };
    }
  }
  
  return { valid: errors.length === 0, errors, sanitizedData: formData };
}

// Form submission handler
const form = document.querySelector('#hireForm');
if (form) {
  // Initialize EmailJS
  emailjs.init('y2UjvQWL1EVEg66Eo');
  
  // Initialize CSRF on load
  initCsrf();
  
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const formData = Object.fromEntries(new FormData(form));
    const messageEl = document.getElementById('formMessage');
    
    // Validate form
    const validation = validateForm(formData);
    if (!validation.valid) {
      messageEl.textContent = validation.errors.join(' ');
      messageEl.style.color = 'var(--accent)';
      messageEl.style.display = 'block';
      return;
    }
    
    // Show submitting state
    messageEl.textContent = 'Submitting...';
    messageEl.style.color = 'var(--accent)';
    messageEl.style.display = 'block';
    
    // Send email via EmailJS
    try {
      await emailjs.send('service_jpuzwsp', 'template_61bcocj', validation.sanitizedData);
      messageEl.textContent = 'Thank you! Our HR team will contact you within 24 hours.';
      messageEl.style.color = 'var(--text)';
      form.reset();
      initCsrf(); // Regenerate CSRF token
      localStorage.removeItem('csrfToken'); // Clean up
    } catch (error) {
      console.error('Email send error:', error);
      messageEl.textContent = 'Submission failed. Please try again.';
      messageEl.style.color = 'var(--accent)';
    }
  });
}

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