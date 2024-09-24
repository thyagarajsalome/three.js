import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// Scene and Camera Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

// Renderer Setup
const canvas = document.createElement("canvas"); // Ensure canvas is created if not present in HTML
document.body.appendChild(canvas); // Attach it to the DOM
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Texture Loader for Mesh
const textureLoader = new THREE.TextureLoader();
const color = textureLoader.load("./textures/diffuse.jpg");
const roughness = textureLoader.load("./textures/roughness.jpg");
const normal = textureLoader.load("./textures/normal.jpg");

// Create RoundedBoxGeometry
const geometry = new RoundedBoxGeometry(1, 1, 1, 10, 0.05);
const material = new THREE.MeshStandardMaterial({
  map: color,
  roughnessMap: roughness,
  normalMap: normal,
  metalness: 0.5,
  roughness: 0.5,
});

// Add cube to the scene
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Load the HDRI environment (corrected file loading)
new RGBELoader().load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/brown_photostudio_02_1k.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture; // Optional, for background display
  },
  undefined,
  (error) => console.error("Error loading HDRI:", error)
);

// Lights Setup
const primaryLight = new THREE.DirectionalLight(0xffffff, 1);
primaryLight.position.set(5, 5, 5);
scene.add(primaryLight);

const secondaryLight = new THREE.PointLight(0xff0000, 1, 50);
secondaryLight.position.set(-5, 3, 5);
scene.add(secondaryLight);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
rimLight.position.set(0, 5, -5);
scene.add(rimLight);

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position = 0;
});

// GUI Controls
const gui = new GUI();

// Material Controls
const materialFolder = gui.addFolder("Material Properties");
materialFolder.addColor(material, "color").name("Color");
materialFolder.add(material, "metalness", 0, 1).name("Metalness");
materialFolder.add(material, "roughness", 0, 1).name("Roughness");

// UV Mapping Controls
const uvSettings = { offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 };
const uvFolder = materialFolder.addFolder("UVW Mapping");
uvFolder.add(uvSettings, "offsetX", -1, 1).onChange(updateUV).name("Offset X");
uvFolder.add(uvSettings, "offsetY", -1, 1).onChange(updateUV).name("Offset Y");
uvFolder.add(uvSettings, "scaleX", 0.1, 5).onChange(updateUV).name("Scale X");
uvFolder.add(uvSettings, "scaleY", 0.1, 5).onChange(updateUV).name("Scale Y");
uvFolder.open();

function updateUV() {
  if (material.map) {
    material.map.offset.set(uvSettings.offsetX, uvSettings.offsetY);
    material.map.repeat.set(uvSettings.scaleX, uvSettings.scaleY);
    material.needsUpdate = true;
  }
}

// Lighting Controls in GUI
const lightingFolder = gui.addFolder("Lighting");
const lightSettings = {
  primaryLight: {
    enabled: true,
    color: primaryLight.color.getHex(),
    intensity: primaryLight.intensity,
  },
  secondaryLight: {
    enabled: true,
    color: secondaryLight.color.getHex(),
    intensity: secondaryLight.intensity,
  },
  ambientLight: {
    enabled: true,
    color: ambientLight.color.getHex(),
    intensity: ambientLight.intensity,
  },
  rimLight: {
    enabled: true,
    color: rimLight.color.getHex(),
    intensity: rimLight.intensity,
  },
};

// Primary Light Controls
lightingFolder.add(lightSettings.primaryLight, "enabled").onChange((val) => {
  primaryLight.visible = val;
});
lightingFolder
  .addColor(lightSettings.primaryLight, "color")
  .onChange(() => primaryLight.color.setHex(lightSettings.primaryLight.color));
lightingFolder
  .add(lightSettings.primaryLight, "intensity", 0, 2)
  .onChange((val) => (primaryLight.intensity = val));

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
