/* script.js
   - menu toggles
   - 3D scene (Three.js) - rotating torus + particles
   - portfolio injection + video modal
   - view-triggered animations
   - contact form (frontend)
*/

/* -------------------------
   MENU & MOBILE NAV
   ------------------------- */
const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', String(!expanded));
  mobileNav.toggleAttribute('data-open');
  // animate mobile nav
  if (mobileNav.hasAttribute('data-open')) {
    mobileNav.style.transform = 'translateY(0)';
    mobileNav.style.opacity = '1';
    mobileNav.setAttribute('aria-hidden','false');
  } else {
    mobileNav.style.transform = 'translateY(-8px)';
    mobileNav.style.opacity = '0';
    mobileNav.setAttribute('aria-hidden','true');
  }
});

// close mobile nav on link click
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.removeAttribute('data-open');
    menuBtn.setAttribute('aria-expanded','false');
    mobileNav.style.transform = 'translateY(-8px)';
    mobileNav.style.opacity = '0';
  });
});

/* -------------------------
   THREE.JS 3D SCENE
   ------------------------- */
(function initThree(){
  const wrap = document.getElementById('threeWrap');
  if (!wrap) return;

  // scene, camera, renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, wrap.clientWidth / wrap.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 45);

  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  wrap.appendChild(renderer.domElement);

  // subtle ambient
  const amb = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(amb);

  // warm directional
  const dir = new THREE.DirectionalLight(0xffc986, 0.8);
  dir.position.set(10, 10, 10);
  scene.add(dir);

  // torus knot (main)
  const geometry = new THREE.TorusKnotGeometry(8, 2.2, 160, 28);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffb84d,
    metalness: 0.6,
    roughness: 0.28,
    emissive: 0x222200,
    emissiveIntensity: 0.06,
    envMapIntensity: 0.9
  });
  const knot = new THREE.Mesh(geometry, mat);
  knot.rotation.x = 0.4;
  scene.add(knot);

  // secondary orbiting rings
  const ringGeo = new THREE.TorusGeometry(18, 0.03, 16, 120);
  const ringMat = new THREE.MeshBasicMaterial({color:0xffb84d, opacity:0.08, transparent:true});
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI/2;
  scene.add(ring);

  // particles
  const particlesCount = 600;
  const positions = new Float32Array(particlesCount * 3);
  for (let i=0;i<particlesCount;i++){
    const r = THREE.MathUtils.randFloat(12, 45);
    const phi = Math.random() * Math.PI * 2;
    const theta = THREE.MathUtils.randFloatSpread(60) * (Math.PI/180);
    positions[i*3] = Math.cos(phi) * r * Math.cos(theta);
    positions[i*3+1] = Math.sin(theta) * r * 0.6;
    positions[i*3+2] = Math.sin(phi) * r * Math.cos(theta);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({size:0.6, color:0xffe2a0, transparent:true, opacity:0.9});
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // responsive resize
  window.addEventListener('resize', () => {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    renderer.setSize(w,h);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  });

  // subtle camera movement on mouse
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    const w = window.innerWidth;
    mouseX = (e.clientX - w/2) / w * 2;
    mouseY = (e.clientY - window.innerHeight/2) / window.innerHeight * 2;
  });

  // animation loop
  let t = 0;
  function animate(){
    t += 0.008;
    knot.rotation.y += 0.006 + Math.sin(t)*0.0015;
    knot.rotation.x += 0.002;
    ring.rotation.z += 0.002;
    points.rotation.y += 0.0008;

    // camera lerp to mouse
    camera.position.x += (mouseX * 8 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 6 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // small brand mark animation (canvas-based)
  const bm = document.getElementById('brandMark');
  if (bm){
    bm.style.background = 'linear-gradient(135deg,#e2a600,#ff8a00)';
    bm.style.boxShadow = '0 10px 30px rgba(226,166,0,0.12)';
  }
})();

/* -------------------------
   PORTFOLIO (inject cards) + modal
   ------------------------- */
const portfolio = [
  { id:1, title:"Cinematic Short — Raat Ka Safar", thumb:"media/thumb1.jpg", video:"https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id:2, title:"Game Trailer — Moksha Quest", thumb:"media/thumb2.jpg", video:"https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id:3, title:"Ad Spot — Bijli", thumb:"media/thumb3.jpg", video:"https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id:4, title:"VFX Reel — City Fall", thumb:"media/thumb4.jpg", video:"https://www.youtube.com/embed/dQw4w9WgXcQ" }
];

document.addEventListener('DOMContentLoaded', () => {
  // inject work cards
  const grid = document.getElementById('portfolioGrid');
  portfolio.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.style.setProperty('--delay', `${i * 0.06}s`);
    card.innerHTML = `
      <img src="${p.thumb}" alt="${escapeHtml(p.title)}" loading="lazy">
      <div class="wc-body">
        <h4>${p.title}</h4>
        <p>Click to play</p>
      </div>
    `;
    card.addEventListener('click', () => openVideo(p.id));
    grid.appendChild(card);
    // stagger reveal
    setTimeout(()=> card.classList.add('in-view'), 100 + i*120);
  });

  // show modal controls
  const modal = document.getElementById('videoModal');
  const closeBtn = document.getElementById('modalClose');
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // showreel button
  document.getElementById('showreelBtn').addEventListener('click', () => openVideo(1));

  // contact form
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cname').value.trim();
    if (!name) return alert('Please enter your name');
    alert(`Thanks ${name}! We'll reply shortly.`);
    form.reset();
  });

  // footer year
  document.getElementById('year').textContent = (new Date()).getFullYear();

  // services reveal on scroll (intersection)
  const scards = document.querySelectorAll('.service-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) ent.target.classList.add('in-view');
    });
  }, {threshold:0.18});
  scards.forEach(s => io.observe(s));

  // work cards reveal
  const wcards = document.querySelectorAll('.work-card');
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) ent.target.classList.add('in-view');
    });
  }, {threshold:0.12});
  wcards.forEach(w => io2.observe(w));
});

/* open video modal */
function openVideo(id){
  const p = portfolio.find(x => x.id===id);
  if (!p) return;
  const holder = document.getElementById('videoHolder');
  holder.innerHTML = `<iframe src="${p.video}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  const modal = document.getElementById('videoModal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  const holder = document.getElementById('videoHolder');
  holder.innerHTML = '';
  const modal = document.getElementById('videoModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

/* small helper */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
