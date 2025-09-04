const searchInput = document.getElementById('search');
const table = document.getElementById('videoTable');
const tableBody = document.getElementById('videoTableBody');
const pagination = document.getElementById('pagination');
const resultCount = document.getElementById('resultCount');

let allResults = [];
let currentPage = 1;
const resultsPerPage = 10;

async function fetchFilteredVideos(query) {
  const res = await fetch('videos.json');
  const allVideos = await res.json();

  // Simulate backend filtering
  return allVideos.filter(video => {
    const q = query.toLowerCase();
    return video.title.toLowerCase().includes(q) ||
           video.description.toLowerCase().includes(q);
  });
}

function renderTable(videos) {
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedVideos = videos.slice(startIndex, startIndex + resultsPerPage);

  tableBody.innerHTML = '';

  paginatedVideos.forEach(video => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><a class="video-link" href="${video.url}" target="_blank">${video.title}</a></td>
      <td>${video.description}</td>
    `;
    tableBody.appendChild(row);
  });

  table.style.display = videos.length > 0 ? 'table' : 'none';
  resultCount.textContent = videos.length ? `${videos.length} results found.` : '';
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
    });
    pagination.appendChild(btn);
  }
}

searchInput.addEventListener('input', async () => {
  const query = searchInput.value.trim();

  if (query.length < 3) {
    table.style.display = 'none';
    resultCount.textContent = '';
    pagination.innerHTML = '';
    return;
  }

  allResults = await fetchFilteredVideos(query);
  currentPage = 1;
  renderTable(allResults);
  renderPagination(allResults.length);
});
