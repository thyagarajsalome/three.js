import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

// Skylight settings
const skyColor = 0xb1e1ff; // Light blue sky color
const groundColor = 0xb97a20; // Warm brownish color for ground reflection
const intensity = 1.5; // Moderate intensity

const skyLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
skyLight.position.set(0, 10, 0); // Position the skylight above the scene
scene.add(skyLight); // Add skylight to the scene

// Sunlight
const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(10, 20, 10);
scene.add(sunLight);

// Texture Loader
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

// Mesh
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.set(0, 0, 5);
const canvas = document.querySelector("canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// GUI Controls
const gui = new GUI();

// Material Controls
const materialFolder = gui.addFolder("Material Properties");
materialFolder.addColor(material, "color").name("Color");
materialFolder.add(material, "metalness", 0, 1).name("Metalness");
materialFolder.add(material, "roughness", 0, 1).name("Roughness");

materialFolder
  .add(
    {
      loadTexture: function () {
        textureLoader.load(
          "https://threejsfundamentals.org/threejs/resources/images/wall.jpg",
          (texture) => {
            material.map = texture;
            material.needsUpdate = true;
          },
          undefined,
          (error) => {
            console.error(
              "An error occurred while loading the texture:",
              error
            );
          }
        );
      },
    },
    "loadTexture"
  )
  .name("Load Texture");
materialFolder.close();

// Camera Controls

const cameraFolder = gui.addFolder("Camera Settings");
const cameraSettings = {
  positionX: camera.position.x,
  positionY: camera.position.y,
  positionZ: camera.position.z,
  fov: camera.fov,
};

cameraFolder
  .add(cameraSettings, "positionX", -10, 10)
  .onChange((val) => {
    camera.position.x = val;
    camera.updateProjectionMatrix();
  })
  .name("Position X");

cameraFolder
  .add(cameraSettings, "positionY", -10, 10)
  .onChange((val) => {
    camera.position.y = val;
    camera.updateProjectionMatrix();
  })
  .name("Position Y");

cameraFolder
  .add(cameraSettings, "positionZ", 1, 20)
  .onChange((val) => {
    camera.position.z = val;
    camera.updateProjectionMatrix();
  })
  .name("Position Z");

cameraFolder
  .add(cameraSettings, "fov", 10, 100)
  .onChange((val) => {
    camera.fov = val;
    camera.updateProjectionMatrix();
  })
  .name("Field of View");
cameraFolder.close();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
