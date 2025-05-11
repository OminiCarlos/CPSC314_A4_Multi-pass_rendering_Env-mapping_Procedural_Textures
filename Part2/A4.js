/*
 * UBC CPSC 314, Vmar2024
 * Assignment 4 Template
 */

// Setup the renderer and create the scene
// You should look into js/setup.js to see what exactly is done here.
const { renderer, canvas } = setup();
const {
  scene,
  renderTarget,
  camera,
  shadowCam,
  worldFrame,
  renderTarget2,
  renderTarget3
} = createScene(canvas);

// Set up the shadow scene.
const shadowScene = new THREE.Scene();

// Switch between seeing the scene from light's perspective (1), the depth map (2), the final scene (3)
var sceneHandler = 3;

// For ShadowMap visual
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const postScene = new THREE.Scene();

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

// Q1d Replace the light source with the shadow camera, i.e. setup a camera at the light source
// shadowCam.position.set(200.0, 200.0, 200.0);

shadowCam.lookAt(scene.position);
shadowScene.add(shadowCam);

const blobRadius = 2;
const lightBlobGeo = new THREE.SphereGeometry(blobRadius, 100, 100);
const lightBlobMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    color: { value: new THREE.Color(0x75bcc6) }
  },
  vertexShader: `
  uniform float time;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vNormal = normalize(normal);

  vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-viewPos.xyz);

  // Deform for that Fomosphere bumpiness
  vec3 pos = position + normal * 0.2 * sin(time + position.y * 3.0 + position.x * 2.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

`,
  fragmentShader: `
    uniform float time;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDir);

  // View-dependent factor for blending
  float fresnel = pow(1.0 - dot(normal, viewDir), 3.0); // 0 = facing, 1 = rim

  // Iridescent blend based on view and time
  vec3 baseA = vec3(0.8, 0.9, 1.0);   // soft blue
  vec3 baseB = vec3(1.0, 0.85, 0.95); // pink
  vec3 baseC = vec3(1.0, 1.0, 0.85);  // creamy yellow

  float timeShift = 0.5 + 0.5 * sin(time * 0.6);
  vec3 innerColor = mix(baseA, baseB, timeShift);
  vec3 finalColor = mix(innerColor, baseC, fresnel); // camera-facing center = blue/pink, edges = warm


  gl_FragColor = vec4(finalColor, 1.0);
}
`
});
const lightBlob = new THREE.Mesh(lightBlobGeo, lightBlobMaterial);
scene.add(lightBlob);

// const glowMaterial = new THREE.ShaderMaterial({
//   uniforms: {
//     color: { value: new THREE.Color(0x75bcc6) },time:{value:0.0}
//   },
//   transparent: true,
//   blending: THREE.AdditiveBlending,
//   depthWrite: false,
//   side: THREE.BackSide, // render the inner side for nice thickness
//   vertexShader: `
//   uniform float time;
// varying vec3 vNormal;
// varying vec3 vViewDir;

// void main() {
//   vNormal = normalize(normal);

//   vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
//   vViewDir = normalize(-viewPos.xyz);

//   // Slight inflation for glow shell
//   vec3 pos = position + normal * 0.3;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
// }
//   `,
//   fragmentShader: `
//    uniform float time;
// varying vec3 vNormal;
// varying vec3 vViewDir;

// void main() {
//   vec3 normal = normalize(vNormal);
//   float fresnel = pow(1.0 - dot(normal, normalize(vViewDir)), 3.0);

//   float angle = dot(normal, vec3(sin(time), cos(time), sin(time * 0.5)));
//   vec3 baseA = vec3(0.8, 0.9, 1.0);
//   vec3 baseB = vec3(1.0, 0.85, 0.95);

//   vec3 color = mix(baseA, baseB, 0.5 + 0.5 * angle);
//   gl_FragColor = vec4(color * fresnel * 2.0, 0.4); // translucent additive glow
// }
//   `
// });

// const glowMesh = new THREE.Mesh(
//   new THREE.SphereGeometry(blobRadius + 0.3, 100, 100),
//   glowMaterial
// );
// scene.add(glowMesh);

const lightDirection = new THREE.Vector3();
lightDirection.copy(shadowCam.position);
lightDirection.sub(scene.position);

// Load floor textures
const floorColorTexture = new THREE.TextureLoader().load("images/color.jpg");
floorColorTexture.minFilter = THREE.LinearFilter;
floorColorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

const floorNormalTexture = new THREE.TextureLoader().load("images/normal.png");
floorNormalTexture.minFilter = THREE.LinearFilter;
floorNormalTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Load pixel textures for shayD
const shayDColorTexture = new THREE.TextureLoader().load(
  "images/Pixel_Model_BaseColor.jpg"
);
shayDColorTexture.minFilter = THREE.LinearFilter;
shayDColorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Load Pixel Textures for Cow
const CowColorTexture = new THREE.TextureLoader().load(
  "images/SpotTexture.png"
);
CowColorTexture.minFilter = THREE.LinearFilter;
CowColorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

// Uniforms
const cameraPositionUniform = { type: "v3", value: camera.position };
const lightColorUniform = {
  type: "c",
  value: new THREE.Vector3(1.0, 1.0, 1.0)
};
const ambientColorUniform = {
  type: "c",
  value: new THREE.Vector3(1.0, 1.0, 1.0)
};
const lightDirectionUniform = { type: "v3", value: lightDirection };
const kAmbientUniform = { type: "f", value: 0.1 };
const kDiffuseUniform = { type: "f", value: 0.8 };
const kSpecularUniform = { type: "f", value: 0.4 };
const shininessUniform = { type: "f", value: 50.0 };
const lightPositionUniform = { type: "v3", value: shadowCam.position };
// Q1b TODO: load the skybox textures
const skyboxCubemap = new THREE.CubeTextureLoader()
  .setPath("images/cubemap/")
  .load([
    "cube1.png",
    "cube2.png",
    "cube3.png",
    "cube4.png",
    "cube5.png",
    "cube6.png"
  ]);
const skyboxMaterial = new THREE.ShaderMaterial({
  uniforms: {
    skybox: { type: "t", value: skyboxCubemap },
    cameraPos: cameraPositionUniform
  },
  side: THREE.BackSide
});

// Materials
const postMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightProjMatrix: { type: "m4", value: shadowCam.projectionMatrix },
    lightViewMatrix: { type: "m4", value: shadowCam.matrixWorldInverse },
    tDiffuse: { type: "t", value: null },
    tDepth: { type: "t", value: renderTarget.depthTexture }
  }
});

// Updated to use lighting effects in shader files
const floorMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightProjMatrix: { type: "m4", value: shadowCam.projectionMatrix },
    lightViewMatrix: { type: "m4", value: shadowCam.matrixWorldInverse },
    lightColor: lightColorUniform,
    ambientColor: ambientColorUniform,

    kAmbient: kAmbientUniform,
    kDiffuse: kDiffuseUniform,
    kSpecular: kSpecularUniform,
    shininess: shininessUniform,

    cameraPos: cameraPositionUniform,
    lightPosition: lightPositionUniform,
    lightDirection: lightDirectionUniform,

    colorMap: { type: "t", value: floorColorTexture },
    normalMap: { type: "t", value: floorNormalTexture },
    shadowMap: { type: "t", value: renderTarget.depthTexture },
    textureSize: { type: "float", value: renderTarget.width }
  }
});

// Q1a HINT : Pass the uniforms for blinn-phong shading,
// colorMap, normalMap etc to the shaderMaterial
const shayDMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    kAmbient: kAmbientUniform,
    kDiffuse: kDiffuseUniform,
    kSpecular: kSpecularUniform,
    shininess: shininessUniform,

    ambientColor: ambientColorUniform,
    lightColor: lightColorUniform,

    cameraPos: cameraPositionUniform,
    lightPosition: lightPositionUniform,
    lightDirection: lightDirectionUniform,

    colorMap: { type: "t", value: shayDColorTexture },
    shadowMap: { type: "t", value: null },
    lightViewMatrix: { type: "m4", value: shadowCam.matrixWorldInverse },
    lightProjMatrix: { type: "m4", value: shadowCam.projectionMatrix }
  }
});

// Q2 HINT : Pass the uniforms for blinn-phong shading,
// colorMap, normalMap etc to the shaderMaterial
const cowMaterial = new THREE.ShaderMaterial({
  // side: THREE.DoubleSide,
  uniforms: {
    kAmbient: kAmbientUniform,
    kDiffuse: kDiffuseUniform,
    kSpecular: kSpecularUniform,
    shininess: shininessUniform,

    lightColor: lightColorUniform,
    ambientColor: ambientColorUniform,
    colorMap: { type: "t", value: CowColorTexture },

    cameraPos: cameraPositionUniform,
    lightPosition: lightPositionUniform,
    lightDirection: lightDirectionUniform
  }
});

// Q1d Get Shay depth info for shadow casting
// Needed for Shay depth info.
const shadowMaterial = new THREE.ShaderMaterial({});
// Q4 HINT : Pass the necessary uniforms
const envmapMaterial = new THREE.ShaderMaterial({
  uniforms: {
    lightDirection: lightDirectionUniform,
    cameraPos: cameraPositionUniform
  }
});

// Load shaders
const shaderFiles = [
  "glsl/envmap.vs.glsl",
  "glsl/envmap.fs.glsl",
  "glsl/cow.vs.glsl",
  "glsl/cow.fs.glsl",
  "glsl/skybox.vs.glsl",
  "glsl/skybox.fs.glsl",
  "glsl/shay.vs.glsl",
  "glsl/shay.fs.glsl",
  "glsl/shadow.vs.glsl",
  "glsl/shadow.fs.glsl",
  "glsl/floor.vs.glsl",
  "glsl/floor.fs.glsl",
  "glsl/render.vs.glsl",
  "glsl/render.fs.glsl"
];

new THREE.SourceLoader().load(shaderFiles, function (shaders) {
  shayDMaterial.vertexShader = shaders["glsl/shay.vs.glsl"];
  shayDMaterial.fragmentShader = shaders["glsl/shay.fs.glsl"];

  cowMaterial.vertexShader = shaders["glsl/cow.vs.glsl"];
  cowMaterial.fragmentShader = shaders["glsl/cow.fs.glsl"];

  envmapMaterial.vertexShader = shaders["glsl/envmap.vs.glsl"];
  envmapMaterial.fragmentShader = shaders["glsl/envmap.fs.glsl"];

  shadowMaterial.vertexShader = shaders["glsl/shadow.vs.glsl"];
  shadowMaterial.fragmentShader = shaders["glsl/shadow.fs.glsl"];

  floorMaterial.vertexShader = shaders["glsl/floor.vs.glsl"];
  floorMaterial.fragmentShader = shaders["glsl/floor.fs.glsl"];

  postMaterial.vertexShader = shaders["glsl/render.vs.glsl"];
  postMaterial.fragmentShader = shaders["glsl/render.fs.glsl"];

  // TODO: uncomment the line below for Q1b
  skyboxMaterial.vertexShader = shaders["glsl/skybox.vs.glsl"];
  skyboxMaterial.fragmentShader = shaders["glsl/skybox.fs.glsl"];
});

// Loaders for object geometry
// Load the pixel gltf
// Q1d One for shadow pass, one for render pass
const gltfFileName1 = "gltf/pixel_v4.glb";

let object1;
{
  const gltfLoader1 = new THREE.GLTFLoader();
  gltfLoader1.load(
    // resource URL
    gltfFileName1,
    // called when the resource is loaded
    function (gltf) {
      object1 = gltf.scene;
      object1.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = shadowMaterial;
        }
      });
      object1.scale.set(10.0, 10.0, 10.0);
      object1.position.set(0.0, 0.0, -8.0);
      shadowScene.add(object1);
    }
  );
}

const gltfFileName = "gltf/pixel_v4.glb";
let object;
{
  const gltfLoader = new THREE.GLTFLoader();
  gltfLoader.load(gltfFileName, (gltf) => {
    object = gltf.scene;
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = shayDMaterial;
      }
    });
    object.scale.set(10.0, 10.0, 10.0);
    object.position.set(0.0, 0.0, -8.0);
    scene.add(object);
  });
}

const terrainGeometry = new THREE.BoxGeometry(50, 50, 5);
const terrain = new THREE.Mesh(terrainGeometry, floorMaterial);
terrain.position.y = -2.4;
terrain.rotation.set(-Math.PI / 2, 0, 0);
scene.add(terrain);

const cowDummy = new THREE.SphereGeometry(15, 32, 16);

// TODO: Try to apply the reflective shader to a sphere or a box to verify the accuracy of reflection

// Look at the definition of loadOBJ to familiarize yourself with
// how each parameter affects the loaded object.
loadAndPlaceOBJ("gltf/spot_triangulated.obj", cowMaterial, function (cow) {
  cow.name = "cow";
  cow.position.set(1.0, 5.0, 3.0);
  cow.scale.set(7.0, 7.0, 7.0);
  cow.parent = worldFrame;
  cow.rotation.set(0, (3.0 * Math.PI) / 2.0, 0);
  scene.add(cow);
});

loadAndPlaceOBJ(
  "gltf/spot_triangulated.obj",
  shadowMaterial,
  function (cowShadow) {
    cowShadow.position.set(1.0, 5.0, 3.0);
    cowShadow.scale.set(7.0, 7.0, 7.0);
    cowShadow.parent = worldFrame;
    cowShadow.rotation.set(0, (3.0 * Math.PI) / 2.0, 0);
    shadowScene.add(cowShadow);
  }
);

// const testMaterial = new THREE.MeshStandardMaterial({
//   envMap: skyboxCubemap,
//   metalness: 1.0,
//   roughness: 0.0
// });
// const shinySphere= new THREE.Mesh(cowDummy, testMaterial);
// shinySphere.position.set(1.0, 5.0, 3.0);
// shinySphere.scale.set(1.0, 1.0, 1.0); // it's already large, so 1.0 scale is fine
// shinySphere.name = "cow"; // so the shader toggle logic still works
// shinySphere.parent = worldFrame;
// scene.add(shinySphere);

// // Q1d Cow Shadow
// loadAndPlaceOBJ("gltf/spot_triangulated.obj", shadowMaterial, function (cow) {
//   cow.position.set(1.0, 5.0, 3.0);
//   cow.scale.set(7.0, 7.0, 7.0);
//   cow.parent = worldFrame;
//   cow.rotation.set(0, (3.0 * Math.PI) / 2.0, 0);
//   shadowScene.add(cow);
// });

// Depth Test scene
const postPlane = new THREE.PlaneGeometry(2, 2);
const postQuad = new THREE.Mesh(postPlane, postMaterial);
postScene.add(postQuad);

// Create and add the skybox
const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

// Listen to keyboard events.
const keyboard = new THREEx.KeyboardState();
function checkKeyboard() {
  if (keyboard.pressed("A")) shadowCam.position.x -= 0.2;
  if (keyboard.pressed("D")) shadowCam.position.x += 0.2;
  if (keyboard.pressed("W")) shadowCam.position.z -= 0.2;
  if (keyboard.pressed("S")) shadowCam.position.z += 0.2;
  if (keyboard.pressed("Q")) shadowCam.position.y += 0.2;
  if (keyboard.pressed("E")) shadowCam.position.y -= 0.2;

  if (keyboard.pressed("1")) sceneHandler = 1;
  if (keyboard.pressed("2")) sceneHandler = 2;
  if (keyboard.pressed("3")) sceneHandler = 3;
  if (keyboard.pressed("4")) sceneHandler = 4;

  shadowCam.lookAt(scene.position);
  lightDirection.copy(shadowCam.position);
  lightDirection.sub(scene.position);
}

function updateMaterials() {
  envmapMaterial.needsUpdate = true;
  shayDMaterial.needsUpdate = true;
  cowMaterial.needsUpdate = true;
  shadowMaterial.needsUpdate = true;
  floorMaterial.needsUpdate = true;
  postMaterial.needsUpdate = true;
  // TODO: uncomment the line below for Q1b
  skyboxMaterial.needsUpdate = true;
}

// Setup update callback
function update() {
  checkKeyboard();
  updateMaterials();

  // console.log("ambientColor:", ambientColorUniform.value); // should be THREE.Color(1, 1, 1)
  // console.log("kAmbient:", kAmbientUniform.value); // should be 0.1 (or something > 0)

  cameraPositionUniform.value = camera.position;

  requestAnimationFrame(update);
  renderer.getSize(screenSize);
  renderer.setRenderTarget(null);
  renderer.clear();
  lightBlob.position.copy(shadowCam.position);
  // glowMesh.position.copy(lightBlob.position);
  const t = performance.now() / 100;
  lightBlobMaterial.uniforms.time.value = t;
  // glowMaterial.uniforms.time.value = t;
  lightBlob.lookAt(camera.position);


  if (sceneHandler == 1) {
    // Debug, see the scene from the light's perspective
    renderer.render(shadowScene, shadowCam);
  } else if (sceneHandler == 2) {
    // Q1d Visualise the shadow map
    // TODO: First pass to get the depth value

    // TODO: Second Pass, visualise shadow map to quad
    renderer.setRenderTarget(renderTarget);
    renderer.render(shadowScene, shadowCam);

    // TODO: True second pass, change below
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
  } else {
    if (sceneHandler == 3) {
      const cow = scene.getObjectByName("cow");
      if (cow instanceof THREE.Mesh) {
        cow.material = envmapMaterial;
      } else if (cow.children && cow.children.length > 0) {
        cow.children[0].material = envmapMaterial;
      }
    } else if (sceneHandler == 4) {
      const cow = scene.getObjectByName("cow");
      if (cow) {
        cow.children[0].material = cowMaterial;
      }
    }

    // Q1d Do the multipass shadowing
    // TODO: First pass
    renderer.setRenderTarget(renderTarget);
    renderer.render(shadowScene, shadowCam);
    // TODO: True second pass, change below
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }
}

var screenSize = new THREE.Vector2();
renderer.getSize(screenSize);

// Start the animation loop.
update();
