import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  metalness: 0.5,
  roughness: 0.5,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Primary light (Directional Light)
const primaryLight = new THREE.DirectionalLight(0xffffff, 1);
primaryLight.position.set(5, 5, 5).normalize();
scene.add(primaryLight);

// Secondary light (Point Light)
const secondaryLight = new THREE.PointLight(0xff0000, 1, 50);
secondaryLight.position.set(-5, 3, 5);
scene.add(secondaryLight);

// Other light (Ambient Light)
const ambientLight = new THREE.AmbientLight(0x404040); // Soft light for overall illumination
scene.add(ambientLight);

camera.position.z = 5;

const canvas = document.querySelector("canvas"); // Ensure there's a <canvas> in HTML
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Orbit controls with auto-rotation and damping enabled
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;
controls.enableZoom = true;

// GUI Controls for MeshStandardMaterial
const gui = new GUI();
const materialFolder = gui.addFolder("Material Properties");
materialFolder.addColor(material, "color").name("Color");
materialFolder.add(material, "metalness", 0, 1).name("Metalness");
materialFolder.add(material, "roughness", 0, 1).name("Roughness");
materialFolder.open();

// Lighting Control Panel

// Primary Light Controls
const primaryLightFolder = gui.addFolder("Primary Light");
primaryLightFolder.addColor(primaryLight, "color").name("Color");
primaryLightFolder.add(primaryLight, "intensity", 0, 2).name("Intensity");
primaryLightFolder.add(primaryLight.position, "x", -10, 10).name("X Position");
primaryLightFolder.add(primaryLight.position, "y", -10, 10).name("Y Position");
primaryLightFolder.add(primaryLight.position, "z", -10, 10).name("Z Position");
primaryLightFolder.open();

// Secondary Light Controls (PointLight)
const secondaryLightFolder = gui.addFolder("Secondary Light");
secondaryLightFolder.addColor(secondaryLight, "color").name("Color");
secondaryLightFolder.add(secondaryLight, "intensity", 0, 2).name("Intensity");
secondaryLightFolder
  .add(secondaryLight.position, "x", -10, 10)
  .name("X Position");
secondaryLightFolder
  .add(secondaryLight.position, "y", -10, 10)
  .name("Y Position");
secondaryLightFolder
  .add(secondaryLight.position, "z", -10, 10)
  .name("Z Position");
secondaryLightFolder.open();

// Ambient Light Controls
const ambientLightFolder = gui.addFolder("Ambient Light");
ambientLightFolder.addColor(ambientLight, "color").name("Color");
ambientLightFolder.add(ambientLight, "intensity", 0, 2).name("Intensity");
ambientLightFolder.open();

function animate() {
  window.requestAnimationFrame(animate);

  // Rotate the cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Update the controls to apply damping and auto-rotation
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

animate();
