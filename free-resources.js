let debounceTimeout;

// Debounce function to limit search input events
function debounce(func, wait) {
  return function (...args) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const searchInput = document.getElementById('search');
const table = document.getElementById('videoTable');
const tableBody = document.getElementById('videoTableBody');
const pagination = document.getElementById('pagination');
const resultCount = document.getElementById('resultCount');

let allResults = [];
let currentPage = 1;
const resultsPerPage = 10;

async function fetchFilteredResources(query) {
  try {
    resultCount.textContent = 'Searching...';
    const res = await fetch('list.json');
    const allResources = await res.json();
    return allResources.filter(resource => {
      const q = query.toLowerCase();
      return resource.title.toLowerCase().includes(q) ||
             resource.description.toLowerCase().includes(q);
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    resultCount.textContent = 'Error loading resources.';
    return [];
  }
}

function renderTable(resources) {
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedResources = resources.slice(startIndex, startIndex + resultsPerPage);

  tableBody.innerHTML = '';

  paginatedResources.forEach(resource => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><a class="video-link" href="${resource.url}" target="_blank" rel="noopener">${resource.title}</a></td>
      <td>${resource.description}</td>
    `;
    tableBody.appendChild(row);
  });

  table.style.display = resources.length > 0 ? 'table' : 'none';
  resultCount.textContent = resources.length ? `${resources.length} resources found.` : '';
}

function renderPagination(totalResults) {
  pagination.innerHTML = '';
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentPage = i;
      renderTable(allResults);
      renderPagination(allResults.length);
      // Scroll to table for better UX
      table.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    pagination.appendChild(btn);
  }
}

if (searchInput) {
  searchInput.addEventListener('input', debounce(async () => {
    const query = searchInput.value.trim();

    if (query.length < 3) {
      table.style.display = 'none';
      resultCount.textContent = '';
      pagination.innerHTML = '';
      return;
    }

    allResults = await fetchFilteredResources(query);
    currentPage = 1;
    renderTable(allResults);
    renderPagination(allResults.length);
  }, 300));
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