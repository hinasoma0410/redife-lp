import * as THREE from '../vendor/three-0.185.1.module.min.js';

export function createHeroScene(target) {
  if (!target || target.querySelector('.hero-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  target.prepend(canvas);

  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power'
    });
  } catch {
    canvas.remove();
    target.classList.add('three-unavailable');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
  camera.position.z = 5.4;

  const group = new THREE.Group();
  scene.add(group);

  const shellGeometry = new THREE.IcosahedronGeometry(1.45, 2);
  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(shellGeometry),
    new THREE.LineBasicMaterial({ color: 0x2e6e49, transparent: true, opacity: 0.2 })
  );
  group.add(shell);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.78, 0.018, 6, 90),
    new THREE.MeshBasicMaterial({ color: 0xdda15e, transparent: true, opacity: 0.5 })
  );
  ring.rotation.set(0.68, 0.12, 0.38);
  group.add(ring);

  const pointCount = 38;
  const positions = new Float32Array(pointCount * 3);
  for (let index = 0; index < pointCount; index += 1) {
    const radius = 1.75 + Math.random() * 0.75;
    const angle = index * 2.399963;
    const y = 1 - (index / Math.max(1, pointCount - 1)) * 2;
    const spread = Math.sqrt(Math.max(0, 1 - y * y));
    positions[index * 3] = Math.cos(angle) * spread * radius;
    positions[index * 3 + 1] = y * radius;
    positions[index * 3 + 2] = Math.sin(angle) * spread * radius;
  }

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    pointGeometry,
    new THREE.PointsMaterial({ color: 0x2e6e49, size: 0.035, transparent: true, opacity: 0.55 })
  );
  group.add(points);

  group.position.set(0.38, 0.04, -0.4);
  group.rotation.set(-0.12, -0.18, 0.04);

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    const rect = target.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 0.18;
    pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 0.14;
  };
  target.addEventListener('pointermove', onPointerMove, { passive: true });

  const resize = () => {
    const width = Math.max(1, target.clientWidth);
    const height = Math.max(1, target.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(target);

  let inView = true;
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
  }, { threshold: 0.02 });
  visibilityObserver.observe(target);

  let animationFrame = 0;
  let previousTime = 0;
  const render = (time) => {
    animationFrame = window.requestAnimationFrame(render);
    if (!inView || document.hidden || time - previousTime < 32) return;
    previousTime = time;

    group.rotation.y += 0.0018;
    group.rotation.x += (pointer.y - group.rotation.x) * 0.025;
    group.rotation.z += (pointer.x - group.rotation.z) * 0.025;
    ring.rotation.z -= 0.0012;
    points.rotation.y -= 0.0007;
    renderer.render(scene, camera);
  };

  target.classList.add('has-three');
  animationFrame = window.requestAnimationFrame(render);

  window.addEventListener('pagehide', () => {
    window.cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    target.removeEventListener('pointermove', onPointerMove);
    shellGeometry.dispose();
    shell.geometry.dispose();
    shell.material.dispose();
    ring.geometry.dispose();
    ring.material.dispose();
    pointGeometry.dispose();
    points.material.dispose();
    renderer.dispose();
  }, { once: true });
}
