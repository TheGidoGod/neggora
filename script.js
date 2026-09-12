console.log('script.js loaded');
document.addEventListener('DOMContentLoaded', ()=>{
  console.log('DOMContentLoaded fired');
  try{
    const root = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    // Keep track of nav original parent so we can temporarily move it to body
    const navOriginalParent = nav ? nav.parentNode : null;
    const navOriginalNext = nav ? nav.nextSibling : null;
    // Diagnostic: report presence/counts of key elements
    console.log('DOM elements:', {
      themeToggle: !!themeToggle,
      menuToggle: !!menuToggle,
      nav: !!nav,
      filterButtons: document.querySelectorAll('.filter-btn').length,
      projects: document.querySelectorAll('.project').length,
      testimonials: document.querySelectorAll('.testi').length,
      contactForm: !!document.getElementById('contactForm')
    });

  // Theme
  function updateThemeIcon(){ if(themeToggle) themeToggle.textContent = document.documentElement.classList.contains('light') ? '🌞' : '🌙' }
  const saved = localStorage.getItem('nx_theme');
  if(saved === 'light') document.documentElement.classList.add('light');
  updateThemeIcon();
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      console.log('themeToggle clicked');
      document.documentElement.classList.toggle('light');
      localStorage.setItem('nx_theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
      updateThemeIcon();
      console.log('theme set to', document.documentElement.classList.contains('light') ? 'light' : 'dark');
    });
  }

  // Mobile nav (keep the nav in its original position and toggle the overlay state without moving the DOM node)
  function openNav(){
    if(!nav) return;
    nav.classList.add('open');
    try{ document.body.classList.add('nav-open') }catch(e){}
    try{ const b = document.querySelector('.nav-backdrop'); if(b) b.classList.add('active') }catch(e){}
    if(menuToggle) menuToggle.setAttribute('aria-expanded','true');
  }
  function closeNav(){
    if(!nav) return;
    nav.classList.remove('open');
    try{ document.body.classList.remove('nav-open') }catch(e){}
    try{ const b = document.querySelector('.nav-backdrop'); if(b) b.classList.remove('active') }catch(e){}
    if(menuToggle) menuToggle.setAttribute('aria-expanded','false');
  }
  document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click', ()=>{ closeNav(); }));

  // Project filtering
  const filters = document.querySelectorAll('.filter-btn');
  const projectsGrid = document.getElementById('projectsGrid');
  filters.forEach(btn=>btn.addEventListener('click', ()=>{
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    console.log('filter clicked:', f);
    document.querySelectorAll('.project').forEach(p=>{
      const cats = p.dataset.cat.split(' ');
      if(f==='all' || cats.includes(f)){
        p.classList.remove('hide');
      } else { p.classList.add('hide') }
    });
  }));

  // Testimonials auto-rotate (only if items present)
  const testiItems = Array.from(document.querySelectorAll('.testi'));
  // Inject avatars into each testimonial (placeholder service)
  try{
    testiItems.forEach((item, idx)=>{
      if(item.querySelector('.testi-avatar')) return;
      const img = document.createElement('img');
      img.className = 'testi-avatar';
      img.src = 'https://i.pravatar.cc/96?img=' + ((idx % 70) + 1);
      const cite = item.querySelector('cite');
      const altName = cite ? cite.textContent.replace('—','').trim() : 'testimonial';
      img.alt = 'Photo of ' + altName;
      // Wrap existing p and cite into a body container
      const body = document.createElement('div'); body.className = 'testi-body';
      const p = item.querySelector('p');
      if(p) body.appendChild(p);
      if(cite) body.appendChild(cite);
      item.insertBefore(img, item.firstChild);
      item.appendChild(body);
    });

    // Also inject avatars into the homepage testimonial cards (.testi-card)
    const homeCards = Array.from(document.querySelectorAll('.testi-card'));
    homeCards.forEach((card, idx)=>{
      if(card.querySelector('.testi-avatar')) return;
      const img = document.createElement('img');
      img.className = 'testi-avatar';
      // use a slightly larger avatar for homepage
      img.src = 'https://i.pravatar.cc/128?img=' + (((idx+10) % 70) + 1);
      const cite = card.querySelector('cite');
      const altName = cite ? cite.textContent.replace('—','').trim() : 'testimonial';
      img.alt = 'Photo of ' + altName;
      const body = document.createElement('div'); body.className = 'testi-body';
      const p = card.querySelector('p');
      if(p) body.appendChild(p);
      if(cite) body.appendChild(cite);
      card.insertBefore(img, card.firstChild);
      card.appendChild(body);
      card.classList.add('has-avatar');
    });
  } catch(e){ console.warn('Could not inject testimonial avatars', e) }
  if(testiItems.length>0){
    let ti = 0;
    const updateActiveTestimonial = () => {
      testiItems.forEach((item, index) => {
        item.classList.toggle('active', index === ti);
      });
      ti = (ti + 1) % testiItems.length;
    };

    updateActiveTestimonial();
    setInterval(updateActiveTestimonial, 4000);
  }

  // Create backdrop and close button for mobile nav overlay
  try{
    let backdrop = document.querySelector('.nav-backdrop');
    if(!backdrop){ backdrop = document.createElement('div'); backdrop.className = 'nav-backdrop'; document.body.appendChild(backdrop) }
    backdrop.addEventListener('click', ()=>{ closeNav(); });

    // add a visible close button inside nav for mobile
    if(nav && !nav.querySelector('.close-btn')){
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn'; closeBtn.type='button'; closeBtn.setAttribute('aria-label','Close menu'); closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', ()=>{ closeNav(); });
      nav.appendChild(closeBtn);
    }
  } catch(e){ console.warn('nav backdrop init failed', e) }

  // Testimonials view toggle (grid / list) on the testimonials page
  try{
    const testContainer = document.querySelector('.testimonials');
    const toggleBtns = Array.from(document.querySelectorAll('.toggle-view-btn'));
    function applyTestView(view){
      if(!testContainer) return;
      testContainer.classList.remove('grid','list');
      testContainer.classList.add(view);
      toggleBtns.forEach(b=>{
        const is = b.dataset.view === view;
        b.classList.toggle('active', is);
        b.setAttribute('aria-pressed', String(is));
      });
      localStorage.setItem('nx_testimonials_view', view);
    }
    if(toggleBtns.length && testContainer){
      const saved = localStorage.getItem('nx_testimonials_view') || 'list';
      applyTestView(saved);
      toggleBtns.forEach(b=>b.addEventListener('click', ()=>applyTestView(b.dataset.view)));
    }
  } catch(e){ /* ignore */ }

  // Contact validation
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  if(form){
    // helper to show inline field errors
    function setFieldError(el, msg){
      let existing = el.parentElement.querySelector('.field-error');
      if(msg){
        if(!existing){ existing = document.createElement('div'); existing.className='field-error'; el.parentElement.appendChild(existing) }
        existing.textContent = msg;
      } else if(existing){ existing.remove() }
    }

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      formMsg.textContent = '';
      console.log('contact form submit');
      const data = new FormData(form);
      const name = data.get('name').trim();
      const email = data.get('email').trim();
      const message = data.get('message').trim();
      let invalid = false;
      // clear previous
      setFieldError(form.querySelector('[name="name"]'), '');
      setFieldError(form.querySelector('[name="email"]'), '');
      setFieldError(form.querySelector('[name="message"]'), '');

      if(name.length<2){ setFieldError(form.querySelector('[name="name"]'), 'Please provide your full name.'); invalid = true }
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ setFieldError(form.querySelector('[name="email"]'), 'Please enter a valid email address.'); invalid = true }
      if(message.length<10){ setFieldError(form.querySelector('[name="message"]'), 'Message must be at least 10 characters.'); invalid = true }
      if(invalid){ formMsg.textContent = 'Please fix the errors above.'; formMsg.style.color = '#ffb4b4'; console.log('form validation failed'); return }

      // Simulate send
      const submitBtn = form.querySelector('button[type="submit"]');
      const prevText = submitBtn.textContent;
      submitBtn.disabled = true; submitBtn.textContent = 'Sending...';
      setTimeout(()=>{
        submitBtn.disabled = false; submitBtn.textContent = prevText;
        form.reset();
        console.log('form submitted (simulated)');
        showToast('Thanks — we received your message.');
      },900);
    });
  }

    // Toast helper
    function showToast(text){
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<div>${text}</div><button aria-label="close">✕</button>`;
    document.body.appendChild(t);
    t.querySelector('button').addEventListener('click', ()=>t.remove());
    setTimeout(()=>t.remove(),4000);
  }

  // Scroll reveal for cards
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('reveal') });
  },{threshold:0.12});

  // Interactive 3D hero model
  const heroModel = document.querySelector('.hero-model');
  if (heroModel && window.THREE) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 1000);
    camera.position.set(0, 0.4, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    heroModel.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x7dd3fc, 1.6);
    dirLight.position.set(3, 4, 4);
    scene.add(dirLight);

    const accentLight = new THREE.PointLight(0x8b5cf6, 1.8, 10);
    accentLight.position.set(-3, -2, 2);
    scene.add(accentLight);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.IcosahedronGeometry(1.2, 1);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x7c3aed,
      emissive: 0x1d4ed8,
      roughness: 0.2,
      metalness: 0.7,
      transmission: 0.15,
      transparent: true,
      opacity: 0.93,
      clearcoat: 1,
      clearcoatRoughness: 0.2
    });
    const core = new THREE.Mesh(geometry, material);
    group.add(core);

    const wire = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.7, 0.18, 160, 28),
      new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        emissive: 0x0ea5e9,
        roughness: 0.25,
        metalness: 0.9,
        transparent: true,
        opacity: 0.75
      })
    );
    wire.rotation.x = Math.PI / 2.5;
    wire.rotation.y = Math.PI / 4;
    group.add(wire);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.04, 20, 120),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38 })
    );
    ring.rotation.x = Math.PI / 2.3;
    ring.rotation.y = Math.PI / 7;
    group.add(ring);

    const orbitDots = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 18, 18),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x67e8f9 : 0xa78bfa, emissive: i % 2 === 0 ? 0x0ea5e9 : 0x7c3aed })
      );
      const angle = (i / 10) * Math.PI * 2;
      dot.position.set(Math.cos(angle) * 2.15, Math.sin(angle * 1.6) * 0.9, Math.sin(angle) * 1.5);
      orbitDots.add(dot);
    }
    group.add(orbitDots);

    group.rotation.x = 0.45;
    group.rotation.y = -0.7;

    const resizeRenderer = () => {
      const size = heroModel.clientWidth || 420;
      const height = heroModel.clientHeight || 420;
      renderer.setSize(size, height, false);
      camera.aspect = size / height;
      camera.updateProjectionMatrix();
    };

    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    let frame = 0;
    function animate() {
      frame += 0.016;
      core.rotation.x += 0.006;
      core.rotation.y += 0.008;
      wire.rotation.z += 0.01;
      ring.rotation.z -= 0.008;
      orbitDots.rotation.y += 0.01;
      orbitDots.rotation.x = Math.sin(frame * 1.2) * 0.6;
      group.position.y = Math.sin(frame * 1.4) * 0.18;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  }
  document.querySelectorAll('.card, .hero-copy').forEach(el=>io.observe(el));

  // Close nav on outside click / ESC and manage aria-expanded
  document.addEventListener('click', (ev)=>{
    // only close nav when clicking outside the nav and outside header controls
    const clickedInsideNav = !!ev.target.closest('.nav');
    const clickedHeader = !!ev.target.closest('.header-inner');
    if(nav && !clickedInsideNav && !clickedHeader){
      closeNav();
    }
  });
  document.addEventListener('keydown', (ev)=>{ if(ev.key==='Escape' && nav) closeNav() });
  // manage aria for menu toggle
    if(menuToggle){
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.addEventListener('click', ()=>{
        const isOpen = nav && nav.classList.contains('open');
        if(isOpen) closeNav(); else openNav();
        console.log('menuToggle clicked, nav open=', !isOpen);
      });
    }
  } catch(err){
    console.error('Runtime error in script.js:', err);
    alert('An error occurred: ' + (err && err.message ? err.message : err));
  }
});

// Global error handler to surface unexpected issues during testing
window.addEventListener('error', (ev)=>{
  console.error('Unhandled error', ev.error || ev.message);
  try{ alert('Unhandled error: ' + (ev.error?.message || ev.message)); }catch(e){}
});
