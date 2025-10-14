/**********************
 * COURSE DATA (editable)
 *
 * Edit values here to change course names, packages, durations, prices,
 * index (sections) and nextBatch (ISO date).
 *
 * Keys:
 *  - top-level groups: job | cert | private
 *  - each course -> packages -> { duration, price, index:[], nextBatch }
 **********************/
const COURSES = {
  job: {
    "VAPT": {
      "Only Training": { duration: "2 Months", price: "₹4,999", index: ["Linux (33 Labs)", "Web Recon (10 Labs)","Web application attacks (100+ Labs)\
      ","Practical LLM Attacks","Professional Reporting","Live VAPT Project"], nextBatch: "2025-11-01" },
      "Training + Job Assistance": { duration: "4 Months", price: "₹34,999", index: ["All Only-Training modules","Real-World Projects","Resume Creation","Interview Preparation","Placement Support"], nextBatch: "2025-10-15" },
      "Internship": { duration: "6 weeks", price: "₹2,499", index: ["Shadowing Projects","Mentor Feedback","Report Submission","Completion Certificate"], nextBatch: "2025-10-25" }
    },
    "SOC L1": {
      "Only Training": { duration: "2 Months", price: "₹4,499", index: ["Log Analysis","SIEM Tools and Techniques","Splunk","Wireshark","Wazug","Alert Triage","Incident Escalation"], nextBatch: "2025-10-20" },
      "Training + Job Assistance": { duration: "4 Months", price: "₹29,999", index: ["SOC Playbooks","Live SOC Labs","Shift Simulations","Placement Support"], nextBatch: "2025-11-05" },
      "Internship": { duration: "2 Months", price: "₹1,999", index: ["On-Shift Shadowing","Ticketing & Reporting"], nextBatch: "2025-11-15" }
    },
    "SOC L2": {
      "Only Training": { duration: "3 Months", price: "₹8,999", index: ["Advanced Detection","Threat Hunting","Forensics","Scripting for SOC"], nextBatch: "2025-11-10" },
      "Training + Job Assistance": { duration: "5 Months", price: "₹49,999", index: ["Advanced Labs","Threat Hunting Projects","Interview Prep","Placement Support"], nextBatch: "2025-12-01" }
    }
  },

  cert: {
    "CompTIA Security+": {
      "Only Training": { duration: "4 Weeks", price: "₹4,499", index: ["Security Fundamentals","Network Security","Threats & Vulns","Access Control"], nextBatch: "2025-10-12" },
      "100% Guarenteed Certificate": { duration: "2 Months", price: "₹24,999", index: ["Training","Practice Tests","Exam Guidance","Support","Post-pass Career Guidance"], nextBatch: "2025-11-01" }
    },
    "CISSP": {
      "Only Training": { duration: "2 Months", price: "₹9,999", index: ["CBK Domains Overview","Risk Management","Security Architecture","Practice Tests"], nextBatch: "2025-11-05" },
      "100% Guarenteed Certificate": { duration: "2 Months", price: "₹39,999", index: ["Deep Domain Coaching","Exam Strategy","Mock Exams","Support","Post-pass Career Guidance"], nextBatch: "2026-01-10" }
    },
    "CEH Theory": {
      "Only Training": { duration: "4 Weeks", price: "₹3,499", index: ["Ethical Hacking Basics","Attack Vectors","Security Controls"], nextBatch: "2025-10-25" },
      "100% Guarenteed Certificate": { duration: "2 Months", price: "₹11,999", index: ["Theory + Labs","Mentor Sessions","Support","Post-pass Career Guidance"], nextBatch: "2025-11-20" }
    },
    "CEH Practical": {
      "Only Training": { duration: "4 Weeks", price: "₹7,499", index: ["Hands-on Exploits","Lab-based Tasks","Report Writing"], nextBatch: "2025-11-02" },
      "100% Guarenteed Certificate": { duration: "2 Months", price: "₹17,999", index: ["Practice Labs","Exam Guidance","Mentor Sessions","Support","Post-pass Career Guidance"], nextBatch: "2025-12-05" }
    },
    "CEH Master": {
      "Only Training": { duration: "2 Months", price: "₹9,999", index: ["Mastery Labs","Advanced Exploits","Red Team Projects"], nextBatch: "2026-01-15" },
      "100% Guarenteed Certificate": { duration: "2 Months", price: "₹25,999", index: ["Mentorship","Live Projects","Practical Labs","Support","Post-pass Career Guidance"], nextBatch: "2026-02-01" }
    },
    "CISM": {
      "Only Training": { duration: "4 Weeks", price: "₹9,999", index: ["Governance","Risk Management","Incident Management"], nextBatch: "2025-11-20" },
      "100% Guarenteed Certificate": { duration: "2 Months", price: "₹29,999", index: ["Deep Coaching","Practical Labs","Professional Guidance","Support","Post-pass Career Guidance"], nextBatch: "2026-01-05" }
    },
    "OSCP+": {
      "Only Training": { duration: "2 Months", price: "₹19,999", index: ["Buffer Overflows","Web Exploits","Privilege Escalation"], nextBatch: "2025-10-30" },
      "100% Guarenteed Certificate": { duration: "3 Months", price: "₹49,999", index: ["Deep Coaching","Labs Access","Mentor Pairing","Support","Post-pass Career Guidance"], nextBatch: "2026-01-20" }
    }
  },

  private: {
    "Bug Bounty": {
      "Only Training": { duration: "2 Months", price: "₹36,499", index: ["Recon Tools","Exploitation Techniques","Automation","Payout Strategy"], nextBatch: "2025-10-18" },
      "Training + Mentorship for 1 year": { duration: "12 Months", price: "₹119,999", index: ["Live Hunting","Mentor Program","Collab","Earning Roadmap"], nextBatch: "2025-11-10" }
    },
    "Dark Web": {
      "Only Training": { duration: "6 Weeks", price: "₹35,999", index: ["Darknet Basics","Darkweb Tools","Safety & Ethics","Server hosting","Operational Security","System hardening","Escrow System","Cryptocurrencies"], nextBatch: "2025-11-03" },
      "Training + Mentorship for 1 year": { duration: "12 Months", price: "₹199,999", index: ["Deep Research","Mentorship","Darknet Basics","Darkweb Tools","Safety & Ethics","Server hosting","Operational Security","System hardening","Escrow System","Cryptocurrencies","Red Team Use Cases"], nextBatch: "2025-12-01" }
    },
    "Data Recovery": {
      "Only Training": { duration: "6 Weeks", price: "₹34,999", index: ["Forensic Imaging","Recovery Tools","File Systems"], nextBatch: "2025-11-15" },
      "Training + Mentorship for 1 year": { duration: "12 Months", price: "₹89,999", index: ["Advanced Forensics","Case Studies","Mentorship"], nextBatch: "2026-01-10" }
    }
  }
};

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
  if (!formData.fullname || formData.fullname.length < 2 || formData.fullname.length > 100) {
    errors.push('Full name must be 2-100 characters.');
  }
  if (!formData.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
    errors.push('Valid email required.');
  }
  if (!formData.phone || formData.phone.length < 5 || formData.phone.length > 15) {
    errors.push('Phone number must be 5-15 characters.');
  }
  if (!formData.courseType) {
    errors.push('Please select course type.');
  }
  if (!formData.course) {
    errors.push('Please select course.');
  }
  if (!formData.package) {
    errors.push('Please select package.');
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

/* ---------- UI References ---------- */
const courseTypeEl = document.getElementById('courseType');
const courseContainer = document.getElementById('courseContainer');
const courseEl = document.getElementById('course');
const packageContainer = document.getElementById('packageContainer');
const packageEl = document.getElementById('package');
const courseDetails = document.getElementById('courseDetails');
const form = document.getElementById('learnerForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');

/* ---------- Helper: format date readable ---------- */
function formatDateISO(iso){
  try {
    const d = new Date(iso + 'T00:00:00');
    const opts = { year:'numeric', month:'short', day:'numeric' };
    return d.toLocaleDateString(undefined, opts);
  } catch(e){
    return iso;
  }
}

/* ---------- Populate Course Dropdown when Course Type changes ---------- */
courseTypeEl.addEventListener('change', () => {
  const type = courseTypeEl.value;
  courseEl.innerHTML = '';
  packageEl.innerHTML = '';
  courseDetails.style.display = 'none';
  packageContainer.style.display = 'none';
  courseContainer.style.display = 'none';

  if (!type || !COURSES[type]) return;

  // show courses for chosen type
  courseContainer.style.display = 'block';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '-- Choose course --';
  courseEl.appendChild(placeholder);

  Object.keys(COURSES[type]).forEach(cname => {
    const opt = document.createElement('option');
    opt.value = cname;
    opt.textContent = cname;
    courseEl.appendChild(opt);
  });
});

/* ---------- Populate Package when Course changes ---------- */
courseEl.addEventListener('change', () => {
  const type = courseTypeEl.value;
  const cname = courseEl.value;
  packageEl.innerHTML = '';
  courseDetails.style.display = 'none';
  packageContainer.style.display = 'none';

  if (!type || !cname) return;
  const packs = COURSES[type][cname];
  if (!packs) return;

  packageContainer.style.display = 'block';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '-- Choose package --';
  packageEl.appendChild(placeholder);

  Object.keys(packs).forEach(pname => {
    const opt = document.createElement('option');
    opt.value = pname;
    opt.textContent = pname;
    packageEl.appendChild(opt);
  });
});

/* ---------- Show Course Details when Package selected ---------- */
packageEl.addEventListener('change', () => {
  const type = courseTypeEl.value;
  const cname = courseEl.value;
  const pname = packageEl.value;
  courseDetails.style.display = 'none';
  courseDetails.innerHTML = '';
  if (!type || !cname || !pname) return;

  const info = COURSES[type][cname][pname];
  if (!info) return;

  // Duration & Price as italic side-by-side
  const dSpan = document.createElement('span');
  dSpan.innerHTML = `<em>Duration: ${info.duration}</em>`;
  const pSpan = document.createElement('span');
  pSpan.innerHTML = `<em>Price: ${info.price}</em>`;
  pSpan.style.marginLeft = '16px';

  // Next batch
  const nb = document.createElement('div');
  nb.className = 'next-batch';
  nb.innerHTML = `Next batch starts at ${formatDateISO(info.nextBatch)}`;

  // Index list
  const idxTitle = document.createElement('div');
  idxTitle.style.marginTop = '8px';
  idxTitle.style.fontWeight = '700';
  idxTitle.textContent = 'Course index';

  const ol = document.createElement('ol');
  (info.index || []).forEach(it => {
    const li = document.createElement('li');
    li.textContent = it;
    ol.appendChild(li);
  });

  // Render
  courseDetails.appendChild(dSpan);
  courseDetails.appendChild(pSpan);
  courseDetails.appendChild(nb);
  courseDetails.appendChild(idxTitle);
  courseDetails.appendChild(ol);
  courseDetails.style.display = 'block';
});

// Form submission handler
if (form) {
  // Initialize EmailJS
  emailjs.init('y2UjvQWL1EVEg66Eo');
  
  // Initialize CSRF on load
  initCsrf();
  
  submitBtn.addEventListener('click', async function (e) {
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
    
    // Attach course summary to the message
    const chosen = COURSES[formData.courseType] && COURSES[formData.courseType][formData.course] && COURSES[formData.courseType][formData.course][formData.package];
    const courseSummary = chosen ? `Course: ${formData.course} — ${formData.package}\nDuration: ${chosen.duration}\nPrice: ${chosen.price}\nNext batch: ${formatDateISO(chosen.nextBatch)}\n\nIndex:\n- ${chosen.index.join('\n- ')}` : 'Course details not found';

    // Prepare template params (template must map to these keys)
    const templateParams = {
      fullname: formData.fullname,
      email: formData.email,
      phone: formData.phone,
      courseType: formData.courseType,
      course: formData.course,
      package: formData.package,
      courseSummary: courseSummary
    };
    
    // Show submitting state
    messageEl.textContent = 'Submitting...';
    messageEl.style.color = 'var(--accent)';
    messageEl.style.display = 'block';
    
    // Send email via EmailJS
    try {
      await emailjs.send('service_jpuzwsp', 'template_qsmgluf', templateParams);
      messageEl.textContent = 'Thanks — your request has been sent. We will contact you within 24 hours.';
      messageEl.style.color = 'var(--text)';
      form.reset();
      initCsrf(); // Regenerate CSRF token
      localStorage.removeItem('csrfToken'); // Clean up
      courseContainer.style.display = 'none';
      packageContainer.style.display = 'none';
      courseDetails.style.display = 'none';
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