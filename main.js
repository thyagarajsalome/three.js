import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js"; // Import RGBELoader

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.01, // Near clipping plane
  1000 // Far clipping plane
);

// Add HDRI Lighting
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/zwartkops_pit_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping; // Set mapping to equirectangular for environment map
    scene.environment = texture; // Apply HDRI as environment
  }
);

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// GLTF Model Loader
const gltfLoader = new GLTFLoader(); // Renamed from "loader" to "gltfLoader"
gltfLoader.load("./shoe.glb", function (gltf) {
  const object = gltf.scene;
  scene.add(object);

  // Compute bounding box to get object size and center
  const box = new THREE.Box3().setFromObject(object);
  const boxCenter = box.getCenter(new THREE.Vector3());
  const boxSize = box.getSize(new THREE.Vector3());

  // Center the object at the origin
  object.position.sub(boxCenter);

  // Adjust camera to fit object in view
  const maxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z);
  const cameraDistance =
    maxDimension / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);

  camera.position.set(0, 0, cameraDistance); // Set camera distance based on object size
  camera.lookAt(0, 0, 0); // Ensure camera looks at the center of the object

  controls.target.set(0, 0, 0); // Ensure controls focus on the object's center
  controls.update();
});

// Renderer setup
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Enable tone mapping for HDRI lighting
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.25; // Adjust exposure as needed
renderer.outputEncoding = THREE.sRGBEncoding; // Ensure proper color encoding

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
