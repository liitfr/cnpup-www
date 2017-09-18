/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
/* eslint no-param-reassign: ["error", { "props": false }] */

import OBJLoader from 'OBJLoader'; // eslint-disable-line
import TweenLite from 'TweenLite'; // eslint-disable-line
import AttrPlugin from 'AttrPlugin'; // eslint-disable-line

// -------------------------------------------------------------------------- //
// 3d                                                                         //
// -------------------------------------------------------------------------- //

let container;
let camera;
let scene;
let renderer;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
const logo = document.getElementsByTagName('svg')[0];
const polylogo = document.getElementsByClassName('polylogo')[0];
let logoIsDisplayed = false;
let opacity = 0;

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 2;
  mouseY = (event.clientY - windowHalfY) / 2;
}

function init() {
  container = document.createElement('div');
  document.getElementsByTagName('main')[0].appendChild(container);
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  // make camera position responsive
  if (window.innerWidth <= 488) {
    camera.position.z = 40;
  } else if (window.innerWidth <= 570) {
    camera.position.z = 35;
  } else if (window.innerWidth <= 668) {
    camera.position.z = 30;
  } else if (window.innerWidth <= 845) {
    camera.position.z = 25;
  } else {
    camera.position.z = 20;
  }
  const listener = new THREE.AudioListener();
  camera.add(listener);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe6d6c6);
  const ambient = new THREE.AmbientLight(0x101030);
  scene.add(ambient);
  const directionalLight = new THREE.DirectionalLight(0xffeedd);
  directionalLight.position.set(0, 0, 1);
  scene.add(directionalLight);
  const manager = new THREE.LoadingManager();
  manager.onProgress = (item, loaded, total) => {
    console.log(item, loaded, total);
  };
  const texture = new THREE.Texture();
  const onProgress = (xhr) => {
    if (xhr.lengthComputable) {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log(`${Math.round(percentComplete, 2)}% downloaded`);
    }
  };
  const onError = () => {};
  const imgLoader = new THREE.ImageLoader(manager);
  imgLoader.load('/img/UV_Grid_Sm.jpg', (image) => {
    texture.image = image;
    texture.needsUpdate = true;
  });
  const objLoader = new THREE.OBJLoader(manager);
  objLoader.load('/obj/smokingpipe.obj', (object) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.map = texture;
      }
    });
    object.position.y = -2; // eslint-disable-line
    scene.add(object);
    const audioLoader = new THREE.AudioLoader();
    const sound = new THREE.PositionalAudio(listener);
    audioLoader.load('/sounds/satie.ogg', (buffer) => {
      sound.setBuffer(buffer);
      sound.setRefDistance(15);
      sound.setRolloffFactor(6);
      sound.setDistanceModel('exponential');
      sound.play();
    });
    object.add(sound);
  }, onProgress, onError);
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

function render() {
  // calculate ratio between distance camera / center (which is (0, 0, 0))
  // and max distance (sqrt(800))
  // substract 0.25 to start displaying logo not immediately
  opacity = Math.max((Math.sqrt((camera.position.x ** 2) +
    (camera.position.y ** 2)) / 28.284271247) - 0.25, 0);
  if (opacity > 0 && !logoIsDisplayed) {
    logo.style.display = 'block';
    logoIsDisplayed = true;
  } else if (opacity === 0 && logoIsDisplayed) {
    logo.style.display = 'none';
    logoIsDisplayed = false;
  }
  polylogo.style.opacity = opacity;
  camera.position.x += (Math.max(Math.min(mouseX, 20), -20) - camera.position.x) * 0.008;
  camera.position.y += (-Math.max(Math.min(mouseY, 20), -20) - camera.position.y) * 0.008;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

init();
animate();

// -------------------------------------------------------------------------- //
// Logo                                                                       //
// -------------------------------------------------------------------------- //

const updateInterval = 1.351;
const logoSize = 200;
const radius = 100;

// because of SVGO when it minifies ...
document.querySelectorAll('.a-inside-svg').forEach((a) => {
  a.href = a.getAttribute('data-href'); // eslint-disable-line
});

function generatePoint(index, logoSides) {
  const logoRadius = radius;
  const minRadius = radius * 0.9;
  const x = 0;
  const y = Math.ceil(minRadius + (Math.random() * (logoRadius - minRadius)));
  const angle = ((Math.PI * 2) / logoSides) * index;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const tx = Math.floor(((x * cos) - (y * sin)) + (logoSize / 2));
  const ty = Math.floor((x * sin) + (y * cos) + (logoSize / 2));
  return { x: tx, y: ty };
}

function generate(mask, logoSides) {
  const path = (`M ${Array(...{ length: logoSides }).map((obj, index) => {
    const point = generatePoint(logoSides - index, logoSides);
    return `${point.x} ${point.y}`;
  }).join(' L ')} Z`);
  return path;
}

function flickLogo() {
  TweenLite.to('.polylogo', updateInterval, { attr: { d: generate(false, 40) }, onComplete: flickLogo });
}

if (document.getElementsByClassName('polylogo').length > 0) {
  document.querySelector('.polylogo').setAttribute('d', generate(false, 40));
  flickLogo();
}
