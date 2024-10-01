import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

// Add HDRI Lighting
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/zwartkops_pit_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Texture Loader
const textureLoader = new THREE.TextureLoader();
const diffuseTexture = textureLoader.load("/textures/diffuse.jpeg");

// GLTF Model Loader
const gltfLoader = new GLTFLoader();
gltfLoader.load("./shoe.glb", function (gltf) {
  const object = gltf.scene;

  // Apply texture to all mesh materials in the model
  object.traverse((child) => {
    if (child.isMesh) {
      // Create a new material with the texture
      const newMaterial = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        // You might need to adjust these properties based on your specific needs
        roughness: 0.5,
        metalness: 0.5,
      });
      child.material = newMaterial;
    }
  });

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

  camera.position.set(0, 0, cameraDistance);
  camera.lookAt(0, 0, 0);

  controls.target.set(0, 0, 0);
  controls.update();
});

// Renderer setup
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Enable tone mapping for HDRI lighting
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.25;
renderer.outputEncoding = THREE.sRGBEncoding;

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.1;
controls.maxDistance = 5;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
