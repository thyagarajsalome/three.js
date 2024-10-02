// Imports
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Function to set background color
function setBackgroundColor(r, g, b) {
  scene.background = new THREE.Color(r / 255, g / 255, b / 255);
}

// Initial background color (you can change this to any default color you prefer)
setBackgroundColor(44, 44, 44); // Light gray background (RGB for #a9a9a9)

// Lighting Setup
function addHDRILighting() {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load(
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/zwartkops_pit_1k.hdr",
    function (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
    }
  );
}

function addStudioLighting() {
  const keyLight = new THREE.DirectionalLight(0xffffff, 15);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 10);
  fillLight.position.set(-5, 5, 5);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 5);
  backLight.position.set(0, 5, -5);
  scene.add(backLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
}

addHDRILighting();
addStudioLighting();

// Texture Loading
const textureLoader = new THREE.TextureLoader();
const loadTexture = (name) => textureLoader.load(`/textures/${name}.jpeg`);

const textures = {
  diffuse: loadTexture("diffuse"),
  bump: loadTexture("bump"),
  height: loadTexture("height"),
  internal: loadTexture("internal"),
  normal: loadTexture("normal"),
  specular: loadTexture("specular"),
  occlusion: loadTexture("occlusion"),
};

// Model Loading and Setup
function loadModel() {
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("./shoe.glb", function (gltf) {
    const object = gltf.scene;

    object.traverse((child) => {
      if (child.isMesh) {
        applyTextures(child);
      }
    });

    scene.add(object);
    centerAndFitObject(object);
  });
}

function applyTextures(mesh) {
  const newMaterial = new THREE.MeshStandardMaterial({
    map: textures.diffuse,
    bumpMap: textures.bump,
    bumpScale: 0.1,
    displacementScale: 0.5,
    normalMap: textures.normal,
    aoMap: textures.internal,
    aoMapIntensity: 0.1,
    roughnessMap: textures.specular,
    roughness: 0.95,
    metalness: 0.01,
    envMapIntensity: 0.5,
  });

  mesh.material = newMaterial;

  if (!mesh.geometry.attributes.uv2) {
    mesh.geometry.setAttribute("uv2", mesh.geometry.attributes.uv);
  }
}

function centerAndFitObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const boxCenter = box.getCenter(new THREE.Vector3());
  const boxSize = box.getSize(new THREE.Vector3());

  object.position.sub(boxCenter);

  const maxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z);
  const cameraDistance =
    maxDimension / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 1.5);

  camera.position.set(0, 0, cameraDistance);
  camera.lookAt(0, 0, 0);

  controls.target.set(0, 0, 0);
  controls.update();
}

loadModel();

// Controls Setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.1;
controls.maxDistance = 5;

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Event Listeners
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Example usage of setBackgroundColor function
// You can call this function with different RGB color values to change the background
// setBackgroundColor(255, 0, 0);  // Red background
// setBackgroundColor(0, 255, 0);  // Green background
// setBackgroundColor(0, 0, 255);  // Blue background
