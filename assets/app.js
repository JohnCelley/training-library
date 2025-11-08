// Basic client-side app to load modules.json and render cards with search + tag filter + YouTube modal

const state = {
  modules: [],
  filtered: [],
  tags: new Set(),
};

const els = {
  grid: document.getElementById('moduleGrid'),
  search: document.getElementById('search'),
  tagFilter: document.getElementById('tagFilter'),
  clearFilters: document.getElementById('clearFilters'),
  tplCard: document.getElementById('moduleCard'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  videoWrap: document.getElementById('videoWrap'),
};

document.getElementById('year').textContent = new Date().getFullYear();

// Try to infer repo link from GitHub Pages host patterns
(function setGhLink(){
  const a = document.getElementById('ghLink');
  if (!a) return;
  const host = location.host;
  if (host.endsWith('.github.io')) {
    const user = host.split('.')[0];
    a.href = `https://github.com/${user}/${location.pathname.split('/')[1] || user + '.github.io'}`;
    a.textContent = 'Repo';
  } else {
    a.remove();
  }
})();

async function loadModules() {
  try {
    const res = await fetch('modules/modules.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load modules.json');
    const data = await res.json();
    state.modules = Array.isArray(data) ? data : (data.modules || []);
    buildTags();
    applyFilters();
  } catch (err) {
    console.error(err);
    els.grid.innerHTML = `<p style="color:#fca5a5">Error: ${err.message}. Make sure <code>modules/modules.json</code> exists and is valid JSON.</p>`;
  }
}

function buildTags() {
  state.tags = new Set();
  state.modules.forEach(m => (m.tags||[]).forEach(t => state.tags.add(t)));
  els.tagFilter.innerHTML = '<option value="">Filter by tag…</option>' + Array.from(state.tags).sort().map(t => `<option value="${t}">${t}</option>`).join('');
}

function applyFilters() {
  const q = (els.search.value || '').trim().toLowerCase();
  const tag = els.tagFilter.value;
  state.filtered = state.modules.filter(m => {
    const matchesQ = !q || [m.title, m.description, (m.tags||[]).join(' ')].join(' ').toLowerCase().includes(q);
    const matchesTag = !tag || (m.tags||[]).includes(tag);
    return matchesQ && matchesTag;
  });
  render();
}

function render() {
  els.grid.innerHTML = '';
  if (!state.filtered.length) {
    els.grid.innerHTML = '<p style="color:#9ca3af">No modules match your filters.</p>';
    return;
  }
  state.filtered.forEach(m => {
    const card = els.tplCard.content.firstElementChild.cloneNode(true);
    const thumb = card.querySelector('.thumb');
    const play = card.querySelector('.play');
    const title = card.querySelector('.title');
    const desc = card.querySelector('.desc');
    const duration = card.querySelector('.duration');
    const tags = card.querySelector('.tags');
    const sopLink = card.querySelector('.sopLink');
    const docLink = card.querySelector('.docLink');

    thumb.src = `https://i.ytimg.com/vi/${m.youtubeId}/hqdefault.jpg`;
    thumb.alt = `Thumbnail for ${m.title}`;
    play.addEventListener('click', () => openModal(m));
    title.textContent = m.title;
    desc.textContent = m.description || '';
    duration.textContent = m.duration || '';
    tags.innerHTML = (m.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    if (m.sopUrl) { sopLink.href = m.sopUrl; } else { sopLink.remove(); }
    if (m.docUrl) { docLink.href = m.docUrl; } else { docLink.remove(); }

    els.grid.appendChild(card);
  });
}

function openModal(m) {
  els.modalTitle.textContent = m.title;
  els.videoWrap.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${m.youtubeId}" title="${m.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  els.modal.classList.remove('hidden');
}

function closeModal() {
  els.videoWrap.innerHTML = '';
  els.modal.classList.add('hidden');
}

document.getElementById('closeModal').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

els.search.addEventListener('input', applyFilters);
els.tagFilter.addEventListener('change', applyFilters);
els.clearFilters.addEventListener('click', () => {
  els.search.value = '';
  els.tagFilter.value = '';
  applyFilters();
});

loadModules();
