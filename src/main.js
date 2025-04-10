import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { cameraPosition } from 'three/tsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('active');
          i.querySelector('.accordion-content').style.maxHeight = null;
      });
      
     
      if (!isActive) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
      }
  });
});


document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
          window.scrollTo({
              top: targetElement.offsetTop - 80,
              behavior: 'smooth'
          });
      }
  });
});


const animateOnScroll = () => {
  const elements = document.querySelectorAll('.fade-in');
  
  elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      
      if (elementPosition < screenPosition) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
      }
  });
};


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  });
  
  
  animateOnScroll();
});

window.addEventListener('scroll', animateOnScroll);

window.addEventListener("DOMContentLoaded", () => {
  const text = "Python";
  const el = document.getElementById("typewriter");
  el.textContent = "";

  gsap.to({}, {
    duration: 1,
    repeat: 0,
    onUpdate: function () {
      const length = Math.round(this.progress() * text.length);
      el.textContent = text.substring(0, length);
    },
    ease: "power1.inOut"
  });

});

gsap.from("#divertida", {
  y: 30,
  opacity: 0,
  filter: "blur(6px)",
  duration: 1,
  ease: "power3.out",
  delay: 2 // justo después del typewriter
});

// Animar "gamificada" - entrada lateral + escala
gsap.from("#gamificada", {
  x: 50,
  opacity: 0,
  scale: 0.95,
  duration: 1,
  ease: "back.out(1.7)",
  delay: 3
});


const container = document.getElementById('three-network');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 100);
camera.position.z = 7.8;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(container.offsetWidth, container.offsetHeight);
container.appendChild(renderer.domElement);

// Keywords for nodes
const keywords = [
'if', 'for', 'while', 'def', 'return', 'import',
'class', 'try', 'except', 'lambda', 'print()', 'list', 'int', 'bool', 'str', 'break', 'float', 'len()', 'append()', 'in'
];

const nodeFont = 'bold 40px JetBrains Mono';
const nodeColor = '#0039cb';

function createTextNode(text) {
const canvas = document.createElement('canvas');
const size = 128;
canvas.width = canvas.height = size;
const ctx = canvas.getContext('2d');

ctx.clearRect(0, 0, size, size);
ctx.font = nodeFont;
ctx.fillStyle = nodeColor;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.shadowColor = nodeColor;
ctx.shadowBlur = 12;
ctx.fillText(text, size / 2, size / 2);


const texture = new THREE.CanvasTexture(canvas);
texture.minFilter = THREE.LinearFilter;
const material = new THREE.SpriteMaterial({ map: texture, transparent: true , depthWrite: false});
const sprite = new THREE.Sprite(material);
sprite.scale.set(1, 1, 1);
sprite.material.blending = THREE.AdditiveBlending;
return sprite;
}

// Create dodecahedron
const radius = 4.6;
const dodecahedron = new THREE.DodecahedronGeometry(radius);
const nodes = [];

// Extract unique vertex positions
const vertexPositions = [];
const seen = new Set();
const posAttr = dodecahedron.getAttribute('position');

for (let i = 0; i < posAttr.count; i++) {
const x = posAttr.getX(i);
const y = posAttr.getY(i);
const z = posAttr.getZ(i);
const key = `${x.toFixed(3)}|${y.toFixed(3)}|${z.toFixed(3)}`;
if (!seen.has(key)) {
  seen.add(key);
  vertexPositions.push(new THREE.Vector3(x, y, z));
}
}

// Place keywords at those vertex positions
for (let i = 0; i < keywords.length && i < vertexPositions.length; i++) {
const sprite = createTextNode(keywords[i]);
sprite.position.copy(vertexPositions[i]);
scene.add(sprite);
nodes.push(sprite);
}

// Draw connecting lines
const edges = new THREE.EdgesGeometry(dodecahedron);
const lineMaterial = new THREE.LineBasicMaterial({
color: 0x0039cb,
transparent: true,
opacity: 0.4,
});
const lines = new THREE.LineSegments(edges, lineMaterial);
scene.add(lines);

// Hover logic
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let INTERSECTED = null;

window.addEventListener('mousemove', (event) => {
const rect = renderer.domElement.getBoundingClientRect();
mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
});

// Animate
function animate() {
requestAnimationFrame(animate);

// Rotate scene
scene.rotation.y += 0.003;
scene.rotation.x += 0.0015;

// Hover effect
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(nodes);

if (intersects.length > 0) {
  const hovered = intersects[0].object;
  if (INTERSECTED !== hovered) {
    if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);
    INTERSECTED = hovered;
    INTERSECTED.scale.set(1.5, 1.5, 1.5);
  }
} else {
  if (INTERSECTED) INTERSECTED.scale.set(1, 1, 1);
  INTERSECTED = null;
}

renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
const width = container.offsetWidth;
const height = container.offsetHeight;
renderer.setSize(width, height);
camera.aspect = width / height;
camera.updateProjectionMatrix();
});

const loadModel = (targetId, path, options = {}) => {
  const loader = new GLTFLoader();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const container = document.getElementById(targetId);

  renderer.setSize(80, 80);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Posición de cámara con fallback
  const cam = options.cameraPos || { x: 0, y: 4, z: 18 };
  camera.position.set(cam.x, cam.y, cam.z);

  // Luces
  const light = new THREE.DirectionalLight(0xffffff, 1.9);
  light.position.set(2, 3, 4);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // Sombra en el piso
  const shadowPlane = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.15, transparent: true })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.6;
  scene.add(shadowPlane);

  loader.load(path, (gltf) => {
    const model = gltf.scene;

    const scale = options.scale || 0.8;
    model.scale.set(scale, scale, scale);

    model.position.y = 0;
    model.rotation.y = options.rotationY || Math.PI / 6;

    scene.add(model);

    const floatSpeed = options.floatSpeed || 3;
    const floatHeight = options.floatHeight || 0.18;
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      model.position.y = Math.sin(t * floatSpeed) * floatHeight;
      model.rotation.y += 0.0002;
      renderer.render(scene, camera);
    }
    animate();
  });
};



loadModel("icon-1", "src/models/Videogame.glb");
loadModel("icon-2", "src/models/Briefcase.glb", {scale: 2});
loadModel("icon-3", "src/models/Bookstack.glb", {cameraPos: {x:0,y:0,z:14}, scale:8});
loadModel("icon-4", "src/models/Campfire.glb", {cameraPos: {x:0,y:0,z:25}, scale: 6});
loadModel("icon-5", "src/models/Trophy.glb", {cameraPos: {x:0,y:3,z:10}, scale: 20});
loadModel("icon-6", "src/models/R2-D2.glb", {cameraPos: {x:0,y:0,z:20}, scale: 10, rotationY: -Math.PI/5,});