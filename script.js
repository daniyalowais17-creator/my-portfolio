document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- nav scroll state + progress bar ---------- */
  const nav = document.getElementById('nav');
  const scrollBar = document.getElementById('scrollBar');

  function onScroll(){
    nav.classList.toggle('scrolled', window.scrollY > 10);
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    scrollBar.style.width = scrolled + '%';
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
  }));

  /* ---------- active nav link tracking ---------- */
  const sections = document.querySelectorAll('main .section');
  const navLinkEls = document.querySelectorAll('[data-nav]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => navObserver.observe(s));

  /* ---------- scroll reveal ---------- */
  const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        if (entry.target.classList.contains('skills-grid') || entry.target.classList.contains('projects-grid')){
          [...entry.target.children].forEach((child, i) => child.style.setProperty('--i', i));
        }
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- skill bar fill on view ---------- */
  const skillCards = document.querySelectorAll('.skill-card');
  const skillObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  skillCards.forEach(c => skillObserver.observe(c));

  /* ---------- stat counters ---------- */
  const counters = document.querySelectorAll('.stat__num');
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCount(el){
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion){ el.textContent = target; return; }
    const duration = 1200;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  /* ---------- console typing animation ---------- */
  const consoleBody = document.getElementById('consoleBody');
  const consoleEl = document.getElementById('console');

  const script = [
    { type: 'line', text: 'SELECT * FROM raw_data;' },
    { type: 'result', text: '→ 4,213 rows of noise' },
    { type: 'line', text: "SELECT insight FROM raw_data\nWHERE clarity = true;" },
    { type: 'result', text: '→ 1 decision, made with confidence' }
  ];

  function typeLine(text, el, speed, cb){
    let i = 0;
    (function step(){
      if (i <= text.length){
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else if (cb) cb();
    })();
  }

  function runConsole(){
    consoleBody.innerHTML = '';
    let idx = 0;

    function nextLine(){
      if (idx >= script.length){
        setTimeout(() => { if (!reduceMotion) { idx = 0; runConsole(); } }, 3200);
        return;
      }
      const item = script[idx];
      const p = document.createElement('div');
      if (item.type === 'result') p.className = 'line-result';
      consoleBody.appendChild(p);

      if (reduceMotion){
        p.textContent = item.text;
        idx++;
        nextLine();
        return;
      }

      typeLine(item.text, p, item.type === 'result' ? 26 : 34, () => {
        idx++;
        setTimeout(nextLine, item.type === 'result' ? 700 : 350);
      });
    }
    nextLine();
  }

  const consoleObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        runConsole();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  consoleObserver.observe(consoleEl);

  /* ---------- tilt on hover (photo + cards) ---------- */
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches){
    const tiltTargets = document.querySelectorAll('#tiltCard .photo-cutout__img, #tiltCard .photo-placeholder, [data-tilt]');
    tiltTargets.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-2px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- copy email ---------- */
  const emailBtn = document.getElementById('emailCopy');
  const emailHint = document.getElementById('emailHint');
  emailBtn.addEventListener('click', async () => {
    const email = emailBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      emailHint.textContent = 'copied!';
    } catch {
      emailHint.textContent = email;
    }
    setTimeout(() => { emailHint.textContent = 'click to copy'; }, 1800);
  });

  /* ---------- smooth anchor scroll (offset for fixed nav) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 78;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

});