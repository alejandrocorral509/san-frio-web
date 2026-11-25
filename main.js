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

  /* Catálogo: variantes, filtros, búsqueda, guía de potencia y ficha */
  var setFilter = function () {};
  var openCard = function () {};
  var askFor = function () {};
  function variantsOf(card) { try { return JSON.parse(card.getAttribute('data-variants')) || []; } catch (e) { return []; } }
  function mediaHTML(v) {
    return v.img ? '<img src="assets/img/' + v.img + '.webp?v=2" alt="' + v.model.replace(/"/g, '&quot;') + '" width="640" height="640">'
                 : '<span class="p-ph"><span>Foto próximamente</span></span>';
  }
  function selectVariant(card, i) {
    var vs = variantsOf(card), v = vs[i]; if (!v) return;
    card._v = i;
    var m = $('.p-media', card), img = $('img', m);
    if (v.img && img) { img.src = 'assets/img/' + v.img + '.webp?v=2'; img.alt = v.model; }
    $('.p-fact', card).textContent = v.fact;
    var m2 = $('.p-m2', card); m2.hidden = !v.m2; m2.textContent = v.m2 ? 'Orientativo: ' + v.m2 : '';
    $('.p-ask', card).setAttribute('data-product', v.model);
    $$('.p-var button', card).forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
  }

  function initCatalog() {
    var grid = $('#grid'), chips = $$('.chip'), search = $('#search'), count = $('#count'), empty = $('#empty');
    if (!grid) return;
    var items = $$('.p', grid), seps = $$('[data-sep]', grid), group = 'all', need = null;
    function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    items.forEach(function (it) {
      it._txt = norm(it.getAttribute('data-name') + ' ' + it.textContent); it._v = 0;
      $$('.p-var button', it).forEach(function (b) { b.addEventListener('click', function () { selectVariant(it, +b.getAttribute('data-i')); }); });
    });
    function fits(it) {
      if (!need) return true;
      var vs = variantsOf(it), best = -1;
      vs.forEach(function (v, k) { if (best < 0 && v.frig && v.frig >= need[0] && v.frig <= need[1] * 1.35) best = k; });
      if (best > -1 && it._v !== best) selectVariant(it, best);
      return best > -1;
    }
    function run() {
      var q = norm(search && search.value).trim(), n = 0;
      items.forEach(function (it) {
        var ok = (group === 'all' || it.getAttribute('data-g') === group) && (!q || q.split(/\s+/).every(function (w) { return it._txt.indexOf(w) > -1; })) && fits(it);
        it.hidden = !ok; if (ok) n++;
      });
      seps.forEach(function (s) { s.hidden = !(group === 'all' && !q && !need); });
      count.textContent = n + (n === 1 ? ' producto' : ' productos') + (need ? ' adecuados para ' + need[2] + ' m²' : '');
      empty.hidden = n > 0;
    }
    setFilter = function (g) {
      group = g;
      chips.forEach(function (c) { var on = c.getAttribute('data-g') === g; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      run();
    };
    var form = $('#sizer-form'), inp = $('#sizer-m2'), out = $('#sizer-out');
    function clearNeed() { need = null; if (out) out.hidden = true; }
    chips.forEach(function (c) { c.addEventListener('click', function () { clearNeed(); setFilter(c.getAttribute('data-g')); }); });
    if (search) search.addEventListener('input', run);

    /* Guía de potencia: 100–125 frigorías por m² (orientativo, clima cálido) */
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = Math.round(+inp.value);
      if (!a || a < 5 || a > 200) { out.hidden = false; out.innerHTML = 'Indique una superficie entre 5 y 200 m².'; return; }
      var lo = a * 100, hi = a * 125, f = function (x) { return x.toLocaleString('es-ES'); };
      need = [lo, hi, a];
      if (search) search.value = '';
      setFilter('clima');
      var n = items.filter(function (it) { return !it.hidden; }).length;
      out.hidden = false;
      out.innerHTML = 'Para <b>' + a + ' m²</b> necesita aproximadamente <b>' + f(lo) + '–' + f(hi) + ' frigorías</b>. ' +
        (n ? 'Le mostramos debajo los equipos adecuados.' : 'Para esa superficie le recomendamos un estudio a medida: <a href="#contacto">pídanos presupuesto</a>.') +
        ' <button type="button" class="sizer-reset">Quitar filtro</button>' +
        '<span class="sizer-small">Es un cálculo orientativo: el aislamiento, la orientación y el uso cambian la potencia necesaria. Le asesoramos sin compromiso.</span>';
      $('.sizer-reset', out).addEventListener('click', function () { clearNeed(); inp.value = ''; setFilter('all'); });
    });
    run();

    /* Ficha ampliada */
    var dlg = $('#pd'), cur = null;
    function fill() {
      var vs = variantsOf(cur), v = vs[cur._v || 0];
      $('#pd-media').innerHTML = mediaHTML(v);
      $('#pd-cat').textContent = $('.p-cat', cur).textContent;
      $('#pd-name').textContent = $('.p-name', cur).textContent;
      $('#pd-model').textContent = 'Modelo: ' + v.model;
      $('#pd-fact').textContent = v.fact;
      var m = $('#pd-m2'); m.hidden = !v.m2; m.textContent = v.m2 ? 'Superficie orientativa: ' + v.m2 : '';
      var box = $('#pd-var'); box.innerHTML = ''; box.hidden = vs.length < 2;
      vs.forEach(function (x, k) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = x.label; b.setAttribute('aria-pressed', String(k === (cur._v || 0)));
        b.addEventListener('click', function () { selectVariant(cur, k); fill(); }); box.appendChild(b);
      });
    }
    openCard = function (card) {
      if (!dlg || typeof dlg.showModal !== 'function') { askFor($('.p-ask', card).getAttribute('data-product')); return; }
      cur = card; fill(); dlg.showModal();
    };
    items.forEach(function (it) {
      $('.p-media', it).addEventListener('click', function () { openCard(it); });
      $('.p-more', it).addEventListener('click', function () { openCard(it); });
    });
    if (dlg) {
      $('.pd-close', dlg).addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      $('#pd-ask').addEventListener('click', function () { var v = variantsOf(cur)[cur._v || 0]; dlg.close(); askFor(v.model); });
    }
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
    askFor = function (name) {
      if (asunto) asunto.value = 'Consulta: ' + name;
      if (msg && (!msg.value.trim() || msg._auto)) { msg.value = 'Hola, me interesa el producto «' + name + '». ¿Podrían indicarme precio, disponibilidad e instalación?'; msg._auto = true; }
      if (contact) contact.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { var f = $('#form input[name="nombre"]'); if (f) f.focus({ preventScroll: true }); }, 700);
    };
    if (msg) msg.addEventListener('input', function () { msg._auto = false; });
    $$('.p-ask').forEach(function (b) { b.addEventListener('click', function () { askFor(b.getAttribute('data-product')); }); });
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

  /* Mapa de Google solo cuando el visitante lo pide */
  function initMap() {
    var btn = $('#map-load'), box = $('#map');
    if (!btn || !box) return;
    btn.addEventListener('click', function () {
      box.innerHTML = '<iframe title="Mapa: San Frío, Polígono Bertola 28, Jerez" src="https://www.google.com/maps?q=Pol%C3%ADgono+Bertola+28,+11408+Jerez+de+la+Frontera&output=embed" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
    });
  }

  /* Enlaces desde la web antigua: ?p=producto o ?cat=categoria */
  var CAT = {
    'climatizacion': 'clima', 'split-multisplit': 'clima', 'conductos': 'clima', 'cassetes': 'clima', 'suelo-techo': 'clima',
    'purificadores': 'aire', 'covid-19': 'aire', 'calefactores': 'calor', 'hosteleria': 'calor',
    'aerotermia': 'energia', 'placas-solares': 'energia',
    'electrodomesticos': 'hogar', 'hornos-de-mesa': 'hogar', 'hornos-de-mesa-electrodomesticos': 'hogar', 'microondas': 'hogar', 'microondas-electrodomesticos': 'hogar',
    'placas-de-induccion': 'hogar', 'placas-de-induccion-electrodomesticos': 'hogar', 'televisores': 'hogar', 'televisores-electrodomesticos': 'hogar',
    'vitroceramica': 'hogar', 'vitroceramica-electrodomesticos': 'hogar',
    'electricidad': 'electricidad', 'material-electrico': 'electricidad', 'luces-led': 'electricidad',
    'herramientas': 'herramientas', 'black-diamond': 'herramientas', 'material-de-instalacion': 'herramientas'
  };
  function initDeepLink() {
    var q = new URLSearchParams(location.search), p = q.get('p'), c = q.get('cat');
    if (c && CAT[c]) setFilter(CAT[c]);
    if (p) {
      p = p.replace(/[^a-z0-9-]/gi, '');
      var card = $$('.p').filter(function (el) { return (' ' + el.getAttribute('data-slugs') + ' ').indexOf(' ' + p + ' ') > -1; })[0];
      if (!card) return;
      variantsOf(card).forEach(function (v, k) { if (v.slugs.indexOf(p) > -1) selectVariant(card, k); });
      card.classList.add('is-target');
      setTimeout(function () { card.scrollIntoView({ block: 'center' }); }, 300);
    }
  }

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
    safe(initDeepLink, 'deeplink');
    safe(initMap, 'map');
    safe(initParallax, 'parallax');
    safe(initYear, 'year');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
