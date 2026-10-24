// Nardos Bizuneh portfolio, simple version: the same cards as the eye portal, on a plain scrolling page.
// Sections: 1 data · 2 header + modes · 3 Funk Fusion covers · 4 lightbox · 5 case-study slides · 6 password gate

/* ---------------------------------------------------------------
   1. DATA
---------------------------------------------------------------- */
const MODES = {
  engineer: { label: 'Design Engineering', kicker: '3 case studies',
    projects: [
      { title: 'Trace', kicker: 'UX research · UI design', id: 'trace' },
      { title: 'KinetikIQ', kicker: 'Product UI · Brand · Commercial · Social', id: 'kinetikiq' },
      { title: 'Accessify', kicker: 'UX research', id: 'accessify' },
    ] },
  art: { label: 'Art Direction', kicker: '4 projects',
    projects: [
      { title: 'Photography', kicker: 'Portraits · Street · Documentary', id: 'photography' },
      { title: 'Funk Fusion', kicker: 'Concept · Editorial design · Art direction', id: 'funkfusion' },
      { title: 'Tarot Deck', kicker: 'Concept · Collage · Card system', id: 'tarot' },
      { title: 'Digital Art', kicker: 'Collage · Glitch · Op-art', id: 'digitalart' },
    ] },
};
// Leave href empty to hide a link; `only` limits a link to one mode.
const CONTACT = [
  { label: 'Email', href: 'mailto:nardosbizu@gmail.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nardos-bizuneh-975381278/' },
  { label: 'Résumé', href: '' },          // a PDF link
  { label: '@narmbiz', href: 'https://www.instagram.com/narmbiz/', only: 'art' },
  { label: '@afrode1ty', href: 'https://www.instagram.com/afrode1ty/', only: 'art' },
];
function contactLinks(forMode) {
  return CONTACT.filter((c) => c.href && (!forMode || !c.only || c.only === forMode)).map((c) => {
    const a = document.createElement('a');
    a.href = c.href; a.textContent = c.label;
    if (!c.href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  });
}
// The font stylesheet loads without blocking the first paint; make sure it applies.
const fontCss = document.querySelector('link[rel="stylesheet"][media="print"]');
if (fontCss) fontCss.media = 'all';
const $ = (id) => document.getElementById(id);

/* ---------------------------------------------------------------
   2. HEADER + MODES: two tabs; each shows its own projects. The choice rides in the URL (#art).
---------------------------------------------------------------- */
let mode = location.hash === '#art' ? 'art' : 'engineer';
function setMode(to, scroll) {
  mode = to;
  document.documentElement.dataset.mode = mode;
  document.querySelectorAll('[data-to]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.to === mode)));
  document.querySelectorAll('.s-group').forEach((g) => { g.hidden = g.dataset.group !== mode; });
  const m = MODES[mode];
  $('sKicker').textContent = m.kicker;
  $('sLinks').replaceChildren(...contactLinks(mode));
  $('sFootLinks').replaceChildren(...contactLinks(mode));
  $('sProjects').replaceChildren(...m.projects.map((p, i) => {
    const a = document.createElement('a');
    a.href = '#p-' + p.id;
    a.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span>${p.title}`;
    return a;
  }));
  m.projects.forEach((p, i) => {
    const lab = document.querySelector(`#p-${p.id} .s-label`);
    if (lab) lab.textContent = `${String(i + 1).padStart(2, '0')} · ${p.kicker}`;
  });
  history.replaceState(null, '', mode === 'art' ? '#art' : location.pathname + location.search);
  if (scroll) scrollTo({ top: 0 });
}
document.querySelectorAll('[data-to]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.to, true)));
setMode(mode);

/* ---------------------------------------------------------------
   3. FUNK FUSION COVERS: clicking one brings it to the front of the fan.
---------------------------------------------------------------- */
const mags = [...document.querySelectorAll('#mags .mag')];
mags.forEach((m) => m.addEventListener('click', () => {
  const from = +m.dataset.pos;
  mags.forEach((x) => { x.dataset.pos = (+x.dataset.pos - from + 3) % 3; });
}));

/* ---------------------------------------------------------------
   4. LIGHTBOX: click (or tap) any image on a case-study card to see it full screen.
---------------------------------------------------------------- */
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.hidden = true;
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-label', 'Enlarged image');
lightbox.innerHTML = '<img alt=""><button class="lb-close" type="button" aria-label="Close">&times;</button>';
document.body.appendChild(lightbox);
const lightboxOpen = () => !lightbox.hidden;
const closeLightbox = () => { lightbox.hidden = true; lightbox.querySelector('img').removeAttribute('src'); };
document.addEventListener('click', (e) => {
  const img = e.target.closest('.overview[class*="tint-"] .ov-card img');
  if (!img || img.closest('a') || !(img.currentSrc || img.src)) return;
  const big = lightbox.querySelector('img');
  big.src = img.currentSrc || img.src; big.alt = img.alt;
  lightbox.hidden = false;
  lightbox.scrollTo(0, 0);
  lightbox.querySelector('.lb-close').focus({ preventScroll: true });
});
lightbox.addEventListener('click', closeLightbox);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightboxOpen()) { e.stopImmediatePropagation(); closeLightbox(); } }, true);

/* ---------------------------------------------------------------
   5. CASE-STUDY SLIDES: each deck opens on its intro; "Read case study" opens the pages, turned with
   the arrows, dots or page menu. Back returns to the intro. The page itself always scrolls normally.
---------------------------------------------------------------- */
document.querySelectorAll('.overview.has-slides').forEach((ov) => {
  const slides = [...ov.querySelectorAll('.slide')];
  const last = slides.length - 1;
  const dots = ov.querySelector('.slide-dots');
  let at = 0;
  const show = (i, user) => {
    at = Math.max(0, Math.min(last, i));
    const reading = at > 0;
    ov.classList.toggle('is-reading', reading);
    slides.forEach((sl, k) => sl.classList.toggle('is-active', k === at));
    ov.classList.toggle('is-expanded', slides[at].hasAttribute('data-expanded'));
    const card = slides[at].querySelector('.ov-card');
    if (reading) {
      const nav = ov.querySelector('.slide-nav');
      nav.classList.add('on-card');
      card.appendChild(nav);
      card.prepend(head);   // back button and page menu ride at the top of the card
    }
    [...dots.children].forEach((d, k) => d.setAttribute('aria-current', String(k + 1 === at)));
    if (toc) [...toc.querySelectorAll('button')].forEach((b, k) => b.setAttribute('aria-current', String(k + 1 === at)));
    ov.querySelector('.slide-count').textContent = `${Math.max(at, 1)} / ${last}`;
    ov.querySelector('.slide-prev').disabled = at <= 1;
    ov.querySelector('.slide-next').disabled = at >= last;
    // A new page can be shorter or taller, so bring its top back into view when it starts off screen.
    if (user) { const top = card.getBoundingClientRect().top; if (top < 70 || top > innerHeight * 0.5) scrollBy({ top: top - 80 }); }
  };
  ov._step = (d) => { if (at > 0) show(Math.max(1, at + d), true); };
  const head = document.createElement('div');
  head.className = 'card-head';
  const back = document.createElement('button');
  back.className = 'card-back';
  back.type = 'button';
  back.innerHTML = '<span aria-hidden="true">&larr;</span> Back';
  back.setAttribute('aria-label', 'Back to the project intro');
  back.addEventListener('click', () => show(0, true));
  head.appendChild(back);
  const toc = ov.hasAttribute('data-toc') ? document.createElement('ol') : null;
  if (toc) {
    toc.className = 'slide-toc on-card';
    toc.setAttribute('aria-label', 'Pages');
    slides.forEach((sl, k) => {
      if (k === 0) return;
      const li = document.createElement('li'), b = document.createElement('button');
      b.textContent = sl.dataset.label;
      b.addEventListener('click', () => show(k, true));
      li.appendChild(b); toc.appendChild(li);
    });
    head.appendChild(toc);
  }
  slides.forEach((sl, k) => {
    if (k === 0) return;
    const d = document.createElement('button');
    d.setAttribute('aria-label', `Page ${k}: ${sl.dataset.label}`);
    d.addEventListener('click', () => show(k, true));
    dots.appendChild(d);
  });
  ov.querySelectorAll('.read-case').forEach((b) => b.addEventListener('click', () => show(1, true)));
  ov.querySelector('.slide-prev').addEventListener('click', () => ov._step(-1));
  ov.querySelector('.slide-next').addEventListener('click', () => ov._step(1));
  show(0);
});

/* ---------------------------------------------------------------
   6. PASSWORD GATE (KinetikIQ). It only keeps casual visitors out; the page source is still public.
---------------------------------------------------------------- */
const PASS_HASH = '7346fffa';
const fnv = (t) => { let h = 0x811c9dc5; for (const c of new TextEncoder().encode(t)) h = Math.imul(h ^ c, 0x01000193) >>> 0; return h.toString(16).padStart(8, '0'); };
document.querySelectorAll('.overview.is-locked').forEach((ov) => {
  const key = 'unlocked-' + ov.dataset.project;
  try { if (sessionStorage.getItem(key) === '1') ov.classList.remove('is-locked'); } catch (e) {}
  const form = ov.querySelector('.lock-card'), err = ov.querySelector('.lock-err');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (fnv(form.pw.value.trim()) === PASS_HASH) {
      ov.classList.remove('is-locked');
      try { sessionStorage.setItem(key, '1'); } catch (e) {}
    } else { err.hidden = false; form.pw.select(); }
  });
});
