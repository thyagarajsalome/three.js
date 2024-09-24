import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

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

// Lights
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

// UV Mapping Controls
const uvFolder = materialFolder.addFolder("UVW Mapping");
const uvSettings = {
  offsetX: 0,
  offsetY: 0,
  scaleX: 1,
  scaleY: 1,
};

uvFolder.add(uvSettings, "offsetX", -1, 1).onChange(updateUV).name("Offset X");
uvFolder.add(uvSettings, "offsetY", -1, 1).onChange(updateUV).name("Offset Y");
uvFolder.add(uvSettings, "scaleX", 0.1, 5).onChange(updateUV).name("Scale X");
uvFolder.add(uvSettings, "scaleY", 0.1, 5).onChange(updateUV).name("Scale Y");
uvFolder.open();

// Function to update UV mapping based on GUI inputs
function updateUV() {
  if (material.map) {
    material.map.offset.set(uvSettings.offsetX, uvSettings.offsetY);
    material.map.repeat.set(uvSettings.scaleX, uvSettings.scaleY);
    material.map.needsUpdate = true;
  }
}

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

// Lighting Control Panel
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
    intensity: 0.4,
  },
  rimLight: {
    enabled: true,
    color: rimLight.color.getHex(),
    intensity: rimLight.intensity,
  },
};

// Primary Light Controls
const primaryLightFolder = lightingFolder.addFolder("Primary Light");
primaryLightFolder
  .add(lightSettings.primaryLight, "enabled")
  .onChange((val) => (primaryLight.visible = val))
  .name("Enabled");
primaryLightFolder
  .addColor(lightSettings.primaryLight, "color")
  .onChange(() => primaryLight.color.setHex(lightSettings.primaryLight.color))
  .name("Color");
primaryLightFolder
  .add(lightSettings.primaryLight, "intensity", 0, 2)
  .onChange((val) => (primaryLight.intensity = val))
  .name("Intensity");

// Secondary Light Controls
const secondaryLightFolder = lightingFolder.addFolder("Secondary Light");
secondaryLightFolder
  .add(lightSettings.secondaryLight, "enabled")
  .onChange((val) => (secondaryLight.visible = val))
  .name("Enabled");
secondaryLightFolder
  .addColor(lightSettings.secondaryLight, "color")
  .onChange(() =>
    secondaryLight.color.setHex(lightSettings.secondaryLight.color)
  )
  .name("Color");
secondaryLightFolder
  .add(lightSettings.secondaryLight, "intensity", 0, 2)
  .onChange((val) => (secondaryLight.intensity = val))
  .name("Intensity");

// Ambient Light Controls
const ambientLightFolder = lightingFolder.addFolder("Ambient Light");
ambientLightFolder
  .add(lightSettings.ambientLight, "enabled")
  .onChange((val) => (ambientLight.visible = val))
  .name("Enabled");
ambientLightFolder
  .addColor(lightSettings.ambientLight, "color")
  .onChange(() => ambientLight.color.setHex(lightSettings.ambientLight.color))
  .name("Color");
ambientLightFolder
  .add(lightSettings.ambientLight, "intensity", 0, 2)
  .onChange((val) => (ambientLight.intensity = val))
  .name("Intensity");

// Rim Light Controls
const rimLightFolder = lightingFolder.addFolder("Rim Light");
rimLightFolder
  .add(lightSettings.rimLight, "enabled")
  .onChange((val) => (rimLight.visible = val))
  .name("Enabled");
rimLightFolder
  .addColor(lightSettings.rimLight, "color")
  .onChange(() => rimLight.color.setHex(lightSettings.rimLight.color))
  .name("Color");
rimLightFolder
  .add(lightSettings.rimLight, "intensity", 0, 2)
  .onChange((val) => (rimLight.intensity = val))
  .name("Intensity");
lightingFolder.close();

// Studio Lighting Settings Preset
const studioSettings = {
  setStudioLighting: function () {
    primaryLight.color.set(0xffffff);
    primaryLight.intensity = 1.5;
    secondaryLight.color.set(0xffaa00);
    secondaryLight.intensity = 0.8;
    ambientLight.intensity = 0.4;
    rimLight.intensity = 1;
  },
};
gui.add(studioSettings, "setStudioLighting").name("Apply Studio Preset");

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
