// Nardos Bizuneh portfolio, simple version: the same cards as the eye portal, on a plain scrolling page.
// Sections: 1 data · 1b name effect · 2 header + modes · 3 Funk Fusion covers · 4 lightbox · 5 case-study slides · 6 password gate

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
   1b. THE NAME: hovering it (or tapping on a phone) swaps it to a random font, sized to the same
   width so nothing moves; the letters lift and warm toward a nearby cursor.
---------------------------------------------------------------- */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const homeName = (() => {
  const FONTS = [
    { f: '"Playfair Display", Georgia, serif', w: 500, ls: '-0.01em' },
    { f: '"Comic Neue", "Comic Sans MS", cursive', w: 700, ls: '0' },
    { f: '"UnifrakturCook", "Old English Text MT", serif', w: 700, ls: '0', sz: 0.78 },
    { f: '"Courier Prime", "Courier New", monospace', w: 700, ls: '-0.04em' },
    { f: '"Bungee", "Arial Black", sans-serif', w: 400, ls: '0' },
    { f: '"Great Vibes", cursive', w: 400, ls: '0', lh: '1', sz: 0.9, joined: true },
    { f: '"Rye", serif', w: 400, ls: '0' },
    { f: '"Orbitron", sans-serif', w: 600, ls: '0' },
    { f: '"Cormorant Garamond", Georgia, serif', w: 400, i: 'italic', ls: '0' },
  ];
  const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400&family=Bungee&family=Courier+Prime:wght@700&family=Playfair+Display:wght@500&family=Comic+Neue:wght@700&family=UnifrakturCook:wght@700&family=Great+Vibes&family=Rye&family=Orbitron:wght@600&display=swap';
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const coarse = matchMedia('(hover: none)').matches;
  const spec = (f) => (f.i ? 'italic ' : '') + f.w + ' 48px ' + f.f;
  let title = null, lines = [[], []], letters = [], bag = [], last = null, current = null, timer = 0;
  let fontsAsked = false;
  function loadFonts() {     // the hover fonts load quietly after the page settles, never at startup
    if (fontsAsked) return; fontsAsked = true;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONT_CSS;
    l.onload = () => FONTS.forEach((f) => document.fonts?.load(spec(f)).catch(() => {}));
    document.head.appendChild(l);
  }
  addEventListener('load', () => setTimeout(loadFonts, 3000));

  function next() {
    if (!bag.length) {
      bag = FONTS.slice().sort(() => Math.random() - 0.5);
      if (bag[bag.length - 1] === last && bag.length > 1) bag.reverse();
    }
    return (last = bag.pop());
  }
  const lineW = (l) => l[l.length - 1].getBoundingClientRect().right - l[0].getBoundingClientRect().left;
  // Each font is scaled so its widest line matches the Outfit name's width (measured before the first swap).
  let room = 0;
  function fit(f) {
    if (current !== f) return;
    title.style.setProperty('--fscale', '1');
    const nat = Math.max(lineW(lines[0]), lineW(lines[1]));
    if (nat > 0 && room > 0) title.style.setProperty('--fscale', Math.min(1.1, Math.max(0.25, room * (f.sz || 1) / nat)).toFixed(3));
  }
  function apply(f) {
    if (current !== f) return;
    Object.assign(title.style, { fontFamily: f.f, fontWeight: f.w, fontStyle: f.i || 'normal', letterSpacing: f.ls, lineHeight: f.lh || '0.92' });
    title.classList.add('swapped');
    title.classList.toggle('joined', !!f.joined);
    fit(f);
    if (!reduceMotion) { title.classList.remove('pop'); void title.offsetWidth; title.classList.add('pop'); }
  }
  function swap() {
    loadFonts();
    if (!title.classList.contains('swapped')) room = Math.max(lineW(lines[0]), lineW(lines[1]));
    const f = (current = next());
    if (document.fonts?.check?.(spec(f), 'Nardosbiz') !== false) { apply(f); return; }
    let done = false;
    const go = () => { if (!done) { done = true; apply(f); } };
    document.fonts.load(spec(f), 'Nardosbiz').then(go, go);
    setTimeout(go, 1200);
  }
  function reset() {
    current = null;
    if (!title) return;
    ['fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight'].forEach((p) => { title.style[p] = ''; });
    title.style.removeProperty('--fscale');
    title.classList.remove('pop', 'swapped', 'joined');
  }
  function build(el) {
    if (title === el && el.classList.contains('name')) return;
    title = el; reset();
    el.classList.add('name');
    el.setAttribute('aria-label', 'Nardos Bizuneh');
    el.innerHTML = '';
    lines = [[], []];
    const add = (text, li) => [...text].forEach((ch) => {
      const s = document.createElement('span');
      s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = ch;
      el.appendChild(s); lines[li].push(s);
    });
    add('Nardos', 0); el.appendChild(document.createTextNode(' ')); add('Bizuneh', 1);
    letters = lines[0].concat(lines[1]);
    if (!el.dataset.wired) {
      el.dataset.wired = '1';
      el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch' && el.classList.contains('name')) swap(); });
      el.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') reset(); });
      el.addEventListener('click', () => {
        if (!el.classList.contains('name')) return;
        swap();
        if (coarse) { clearTimeout(timer); timer = setTimeout(reset, 3500); }
      });
    }
  }
  function clear(el) {
    reset();
    el.classList.remove('name');
    el.removeAttribute('aria-label');
    letters = [];
  }
  // Letters lift and warm toward the cursor.
  if (fine && !reduceMotion) {
    let px = -9999, py = -9999, raf = 0;
    const R = 120, LIFT = 10;
    const update = () => {
      raf = 0;
      letters.forEach((n) => {
        const b = n.getBoundingClientRect();
        const lift = parseFloat(n.dataset.l || '0');
        const p = Math.max(0, 1 - Math.hypot(px - (b.left + b.width / 2), py - (b.top + b.height / 2 - lift)) / R);
        n.dataset.l = String(p * LIFT);
        n.style.transform = `translateY(${(-p * LIFT).toFixed(1)}px)`;
        n.style.setProperty('--p', p.toFixed(2));
      });
    };
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || !letters.length) return;
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(update);
    });
    document.documentElement.addEventListener('mouseleave', () => { px = py = -9999; if (!raf) raf = requestAnimationFrame(update); });
  }
  return { build, clear };
})();

homeName.build($('sName'));

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
