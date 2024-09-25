import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"; // Import RGBELoader

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.01, // Near clipping plane adjusted for closer view
  1000 // Far clipping plane
);

// // Skylight settings
// const skyColor = 0xb1e1ff; // Light blue sky color
// const groundColor = 0xb97a20; // Warm brownish color for ground reflection
// const intensity = 1.5; // Moderate intensity

// const skyLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
// skyLight.position.set(0, 10, 5); // Position the skylight above the scene
// scene.add(skyLight); // Add skylight to the scene

// // Sunlight
// const sunLight = new THREE.DirectionalLight(0xffffff, 10);
// sunLight.position.set(10, 20, 10);
// scene.add(sunLight);

// Add HDRI Lighting
// const rgbeLoader = new RGBELoader();
// rgbeLoader.load(
//   "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/zwartkops_pit_1k.hdr",
//   function (texture) {
//     texture.mapping = THREE.EquirectangularReflectionMapping; // Set mapping to equirectangular for environment map

//     scene.environment = texture; // Apply HDRI as environment
//     // scene.background = texture; // Optionally set the HDRI as background
//   }
// );

// Studio Key Light (Main light)
const keyLight = new THREE.SpotLight(0xffffff, 200); // Brightness set to 2
keyLight.position.set(5, 5, 5); // Positioned at an angle
keyLight.castShadow = true; // Enable shadows for dramatic effect
scene.add(keyLight);

// Studio Fill Light (Secondary light to soften shadows)
const fillLight = new THREE.SpotLight(0xffffff, 20); // Softer, less intense
fillLight.position.set(-5, 3, 5); // Positioned on the opposite side of the key light
fillLight.castShadow = false; // No shadows to soften the light
scene.add(fillLight);

// Studio Back Light (Rim light for subject separation)
const backLight = new THREE.SpotLight(0xffffff, 15);
backLight.position.set(0, 5, -5); // Positioned behind the subject
backLight.castShadow = false;
scene.add(backLight);

// Texture Loader
// const textureLoader = new THREE.TextureLoader();
// const color = textureLoader.load("./textures/diffuse.jpg");
// const roughness = textureLoader.load("./textures/roughness.jpg");
// const normal = textureLoader.load("./textures/normal.jpg");

// Create RoundedBoxGeometry
// const geometry = new RoundedBoxGeometry(1, 1, 1, 10, 0.05);
// const material = new THREE.MeshStandardMaterial({
//   map: color,
//   roughnessMap: roughness,
//   normalMap: normal,
//   metalness: 0.5,
//   roughness: 0.5,
// });

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// GLTF Model Loader
const loader = new GLTFLoader();
loader.load("./shoe.glb", function (gltf) {
  scene.add(gltf.scene);
});

// Adjust camera position for better view
camera.position.set(0, 0.1, 1);

// Renderer setup
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Enable tone mapping for HDRI lighting
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1.25; // Adjust exposure as needed
// renderer.outputEncoding = THREE.sRGBEncoding; // Ensure proper color encoding

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.1; // Limit how close the camera can go
controls.maxDistance = 5; // Limit how far the camera can go

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
