(function () {
  /* San Frío — main.js (IIFE clásico, sin módulos) */
  'use strict';

  function safe(fn, name) { try { fn(); } catch (e) { if (window.console) console.warn('[init] ' + name, e); } }
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Red de seguridad del hero */
  function initHeroSafety() {
    setTimeout(function () { var h = $('.hero'); if (h) h.classList.add('hero-done'); }, 2500);
  }

  /* Termostato: 16–30 °C → --t de 0 (frío) a 1 (calor) */
  function initThermo() {
    var hero = $('#hero'), input = $('#thermo-input'), val = $('#thermo-val'), mode = $('#thermo-mode'), note = $('#thermo-note'), arc = $('.arc-fg');
    if (!hero || !input) return;
    function apply(v) {
      var t = (v - 16) / 14;
      hero.style.setProperty('--t', t.toFixed(3));
      hero.style.setProperty('--heat', Math.min(Math.max((v - 22) / 4, 0), 1).toFixed(3));
      if (arc) arc.style.strokeDasharray = (8 + t * 67).toFixed(1) + ' 100';
      val.textContent = Math.round(v);
      if (v <= 22) { mode.textContent = 'Frío'; note.textContent = 'Aire acondicionado'; }
      else if (v <= 24) { mode.textContent = 'Confort'; note.textContent = 'Bomba de calor'; }
      else { mode.textContent = 'Calor'; note.textContent = 'Calefacción y aerotermia'; }
    }
    input.addEventListener('input', function () { stopDemo(); apply(+input.value); });
    apply(+input.value);

    /* Pequeña demostración al cargar: barrido frío → calor → 21° */
    var demo = true, start = null, raf;
    function stopDemo() { demo = false; if (raf) cancelAnimationFrame(raf); }
    function step(ts) {
      if (!demo) return;
      if (!start) start = ts;
      var p = Math.min((ts - start) / 3200, 1);
      var v = p < .5 ? 21 + (29 - 21) * ease(p * 2) : 29 - (29 - 21) * ease((p - .5) * 2);
      input.value = Math.round(v); apply(v);
      if (p < 1) raf = requestAnimationFrame(step); else { input.value = 21; apply(21); }
    }
    function ease(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
    setTimeout(function () { if (demo) raf = requestAnimationFrame(step); }, 900);
  }

  /* Nav */
  function initNav() {
    var nav = $('#nav');
    if (!nav) return;
    var always = document.body.classList.contains('page-solid');
    function onScroll() { nav.classList.toggle('solid', always || window.scrollY > 40); }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    var links = $$('.nav-links a');
    if (!('IntersectionObserver' in window) || !links.length) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (l) { l.classList.remove('active'); });
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* Menú móvil */
  function initMenu() {
    var btn = $('#burger'), drawer = $('#drawer');
    if (!btn || !drawer) return;
    function set(open) {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    }
    btn.addEventListener('click', function () { set(!document.body.classList.contains('menu-open')); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* Reveal + red de seguridad 6s */
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, sib = $$('.reveal', el.parentNode), i = Math.max(0, sib.indexOf(el));
        el.style.transitionDelay = Math.min(i * 0.07, 0.35) + 's';
        el.classList.add('in'); io.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      els.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * 1.2) el.classList.add('in'); });
    }, 6000);
  }

  /* Contador "20+" */
  function initCounter() {
    var el = $('[data-count]');
    if (!el || !('IntersectionObserver' in window)) return;
    var target = +el.getAttribute('data-count');
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      var t0 = null;
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1400, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      }
      el.textContent = '0'; requestAnimationFrame(tick);
      setTimeout(function () { el.textContent = target; }, 2500);
    }, { threshold: 0.05 });
    io.observe(el);
  }

  /* Catálogo: filtros + búsqueda */
  var setFilter = function () {};
  function initCatalog() {
    var grid = $('#grid'), chips = $$('.chip'), search = $('#search'), count = $('#count'), empty = $('#empty');
    if (!grid) return;
    var items = $$('.p', grid), group = 'all';
    function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    items.forEach(function (it) { it._txt = norm(it.getAttribute('data-name') + ' ' + it.textContent); });
    function run() {
      var q = norm(search && search.value).trim(), n = 0;
      items.forEach(function (it) {
        var ok = (group === 'all' || it.getAttribute('data-g') === group) && (!q || q.split(/\s+/).every(function (w) { return it._txt.indexOf(w) > -1; }));
        it.hidden = !ok; if (ok) n++;
      });
      count.textContent = n + (n === 1 ? ' producto' : ' productos');
      empty.hidden = n > 0;
    }
    setFilter = function (g) {
      group = g;
      chips.forEach(function (c) { var on = c.getAttribute('data-g') === g; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      run();
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { setFilter(c.getAttribute('data-g')); }); });
    if (search) search.addEventListener('input', run);
    run();
  }

  /* Tarjetas de soluciones → filtran el catálogo */
  function initTiles() {
    $$('[data-filter]').forEach(function (t) {
      t.addEventListener('click', function () { setFilter(t.getAttribute('data-filter')); var s = $('#search'); if (s) s.value = ''; });
    });
  }

  /* Botón "Consultar" → rellena el formulario */
  function initAsk() {
    var asunto = $('#asunto'), msg = $('#mensaje'), contact = $('#contacto');
    $$('.p-ask').forEach(function (b) {
      b.addEventListener('click', function () {
        var name = b.getAttribute('data-product');
        if (asunto) asunto.value = 'Consulta: ' + name;
        if (msg && !msg.value.trim()) msg.value = 'Hola, me interesa el producto «' + name + '». ¿Podrían indicarme precio, disponibilidad e instalación?';
        if (contact) contact.scrollIntoView({ behavior: 'smooth' });
        setTimeout(function () { var f = $('#form input[name="nombre"]'); if (f) f.focus({ preventScroll: true }); }, 700);
      });
    });
  }

  /* Formulario → correo preparado */
  function initForm() {
    var form = $('#form'), note = $('#form-note');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('[required]', form).forEach(function (f) {
        var bad = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        f.classList.toggle('invalid', bad); if (bad) ok = false;
      });
      if (!ok) { note.textContent = 'Revise los campos marcados, por favor.'; note.classList.remove('ok'); return; }
      var d = form.elements;
      var subject = d.asunto.value.trim() || 'Consulta desde la web';
      var body = 'Nombre: ' + d.nombre.value + '\nTeléfono: ' + d.telefono.value + '\nCorreo: ' + d.email.value + '\n\n' + d.mensaje.value;
      window.location.href = 'mailto:infosanfrio@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      note.textContent = 'Gracias. Se ha abierto su correo con la consulta lista para enviar.'; note.classList.add('ok');
    });
  }

  /* Parallax suave de las imágenes del bento (GSAP opcional) */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    $$('.tile img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  function initYear() { var y = $('#year'); if (y) y.textContent = new Date().getFullYear(); }

  function boot() {
    safe(initHeroSafety, 'hero');
    safe(initThermo, 'thermo');
    safe(initNav, 'nav');
    safe(initMenu, 'menu');
    safe(initReveal, 'reveal');
    safe(initCounter, 'counter');
    safe(initCatalog, 'catalog');
    safe(initTiles, 'tiles');
    safe(initAsk, 'ask');
    safe(initForm, 'form');
    safe(initParallax, 'parallax');
    safe(initYear, 'year');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
