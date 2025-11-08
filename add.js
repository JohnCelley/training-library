function $(id){ return document.getElementById(id); }
const YT = ['youtube.com','www.youtube.com','youtu.be','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'];
const LOOM = ['loom.com','www.loom.com'];
const slugify = s => (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'');
const parseUrl = raw => { try { return new URL(raw.trim()); } catch { return null; } };
const isYoutube = u => u && YT.includes(u.hostname.toLowerCase());
const isLoom    = u => u && LOOM.includes(u.hostname.toLowerCase());
function extractYoutubeId(u){
  if (!u) return null;
  if (u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0] || null;
  if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || u.pathname.split('/')[1] || null;
  const v = u.searchParams.get('v'); if (v) return v;
  const m = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/); if (m) return m[1];
  return null;
}
function extractLoomShare(u){
  if (!u) return null;
  if (u.pathname.startsWith('/embed/')) return u.toString().replace('/embed/','/share/');
  if (u.pathname.startsWith('/share/')) return u.toString();
  return u.toString();
}
function guessTitle(u){
  if (!u) return '';
  if (isYoutube(u)) { const id = extractYoutubeId(u); return id ? `YouTube ${id}` : 'YouTube Video'; }
  if (isLoom(u)) { const last = u.pathname.split('/').filter(Boolean).pop(); return last ? `Loom ${last}` : 'Loom Video'; }
  return u.hostname;
}
function buildModule(){
  const raw = $('url').value.trim();
  const u = parseUrl(raw);
  const title = $('title').value.trim() || guessTitle(u);
  const id = slugify(title);
  const description = $('desc').value.trim();
  const duration = $('duration').value.trim();
  const tags = ($('tags').value.trim() || '').split(',').map(s=>s.trim()).filter(Boolean);
  const sopUrl = $('sopUrl').value.trim();
  const docUrl = $('docUrl').value.trim();
  const thumbUrl = $('thumbUrl').value.trim();

  const mod = { id, title, description, tags };
  if (duration) mod.duration = duration;
  if (sopUrl) mod.sopUrl = sopUrl;
  if (docUrl) mod.docUrl = docUrl;
  if (thumbUrl) mod.thumbUrl = thumbUrl;

  if (u){
    if (isYoutube(u)){ const vid = extractYoutubeId(u); if (vid) mod.youtubeId = vid; }
    else if (isLoom(u)){ mod.loomShareUrl = extractLoomShare(u); }
    else { mod.embedUrl = u.toString(); }
  }
  return mod;
}
function showJson(o){ $('out').textContent = JSON.stringify(o, null, 2); }

$('make').addEventListener('click', () => showJson(buildModule()));
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('out').textContent || ''); alert('Copied JSON to clipboard.'); }
  catch { alert('Copy failed. Select the text and press Ctrl/Cmd+C.'); }
});
$('reset').addEventListener('click', () => {
  ['url','title','desc','tags','duration','sopUrl','docUrl','thumbUrl'].forEach(id => $(id).value='');
  $('out').textContent=''; $('file').value=''; $('mergeStatus').textContent='';
});
$('merge').addEventListener('click', async () => {
  const f = $('file').files[0];
  if (!f){ $('mergeStatus').textContent='Choose your current modules.json first.'; return; }
  let arr;
  try {
    const txt = await f.text();
    const existing = JSON.parse(txt);
    arr = Array.isArray(existing) ? existing : (existing.modules || []);
    if (!Array.isArray(arr)) throw new Error('Unexpected format');
  } catch { $('mergeStatus').textContent='Could not parse uploaded JSON.'; return; }
  let mod; try { mod = JSON.parse($('out').textContent||'{}'); } catch {}
  if (!mod || !mod.id){ $('mergeStatus').textContent='Create the module JSON (Step 1) before merging.'; return; }
  const idx = arr.findIndex(m => m && m.id === mod.id);
  if (idx>=0) arr[idx] = mod; else arr.push(mod);
  const blob = new Blob([JSON.stringify(arr, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'modules.json';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href), 0);
  $('mergeStatus').textContent='Merged. Upload the downloaded modules.json to your repo in /modules/.';
});
