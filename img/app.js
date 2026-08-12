/* =========================================================
   Taras IT — interactions
   - theme toggle (light/dark, system default)
   - sticky nav shadow + mobile menu
   - scroll reveal
   - FAQ accordion
   ========================================================= */

/* ---------- Theme toggle ---------- */
(function () {
  var toggle = document.querySelector('[data-theme-toggle]');
  var root = document.documentElement;
  var mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', mode);
  setIcon();

  function setIcon() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', 'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' mode');
    toggle.innerHTML =
      mode === 'dark'
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-linecap="round"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      mode = mode === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', mode);
      setIcon();
    });
  }
})();

/* ---------- Sticky nav border on scroll ---------- */
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  var onScroll = function () {
    if (window.scrollY > 8) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ---------- Mobile menu ---------- */
(function () {
  var btn = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function close() {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
  function open() {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }

  btn.addEventListener('click', function () {
    if (menu.classList.contains('open')) close();
    else open();
  });

  // close on link click
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', close);
  });

  // close on escape / resize to desktop
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 900) close();
  });
})();

/* ---------- Scroll reveal ---------- */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !items.length) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  items.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
    io.observe(el);
  });
})();

/* ---------- FAQ accordion ---------- */
(function () {
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close all
      items.forEach(function (it) {
        it.classList.remove('open');
        var b = it.querySelector('.faq-q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      // open this one if it was closed
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
