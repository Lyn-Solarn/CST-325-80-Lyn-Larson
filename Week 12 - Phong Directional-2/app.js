'use strict'

let gl;

const appInput = new Input();
const time = new Time();
const camera = new OrbitCamera(appInput);
const assetLoader = new AssetLoader();

let sphereGeometry = null; // this will be created after loading from a file
let groundGeometry = null;
let barrelGeometry = null;
let lightSphereGeometry = null;
let flatColorShaderProgram;

const projectionMatrix = new Matrix4();
const lightPosition = new Vector4(4, 1.5, 0, 1);

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
let phongShaderProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// List of assets to load
const assetList = [
    { name: 'phongTextVS', url: './shaders/phong.vs.glsl', type: 'text' },
    { name: 'phongTextFS', url: './shaders/phong.pointlit.fs.glsl', type: 'text' },
    { name: 'flatColorVS', url: './shaders/flat.color.vs.glsl', type: 'text' },
    { name: 'flatColorFS', url: './shaders/flat.color.fs.glsl', type: 'text' },
    { name: 'spotVS', url: './shaders/phong.vs.glsl', type: 'text' },  // reuse same VS
    { name: 'spotFS', url: './shaders/phong.spot.fs.glsl', type: 'text' },
    { name: 'sphereJSON', url: './data/sphere.json', type: 'json' },
    { name: 'marbleImage', url: './data/marble.jpg', type: 'image' },
    { name: 'crackedMudImage', url: './data/crackedmud.png', type: 'image' },
    { name: 'barrelImage', url: './data/barrel.png', type: 'image' },
    { name: 'barrelJSON', url: './data/barrel.json', type: 'json' }
    
];

let yaw = 0;
let pitch = 0;

// -------------------------------------------------------------------------
async function initializeAndStartRendering() {
    gl = getWebGLContext("webgl-canvas");
    gl.enable(gl.DEPTH_TEST);

    await assetLoader.loadAssets(assetList);

    createShaders();
    createScene();

    updateAndRender();
}

// -------------------------------------------------------------------------
function createShaders() {
    const phongTextVS = assetLoader.assets.phongTextVS;
    const phongTextFS = assetLoader.assets.phongTextFS;

    phongShaderProgram = createCompiledAndLinkedShaderProgram(gl, phongTextVS, phongTextFS);

    phongShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(phongShaderProgram, "aVertexPosition"),
        vertexNormalsAttribute: gl.getAttribLocation(phongShaderProgram, "aNormal"),
        vertexTexcoordsAttribute: gl.getAttribLocation(phongShaderProgram, "aTexcoords")
    };

    phongShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(phongShaderProgram, "uProjectionMatrix"),
        lightPositionUniform: gl.getUniformLocation(phongShaderProgram, "uLightPosition"),
        cameraPositionUniform: gl.getUniformLocation(phongShaderProgram, "uCameraPosition"),
        textureUniform: gl.getUniformLocation(phongShaderProgram, "uTexture"),
        spotLightPositionUniform:  gl.getUniformLocation(phongShaderProgram, "uSpotLightPosition"),
        spotLightDirectionUniform: gl.getUniformLocation(phongShaderProgram, "uSpotLightDirection"),
        innerLimitUniform:         gl.getUniformLocation(phongShaderProgram, "uInnerLimit"),
        outerLimitUniform:         gl.getUniformLocation(phongShaderProgram, "uOuterLimit"),

    };

    // Flat color shader
    const flatColorVS = assetLoader.assets.flatColorVS;
    const flatColorFS = assetLoader.assets.flatColorFS;

    flatColorShaderProgram = createCompiledAndLinkedShaderProgram(gl, flatColorVS, flatColorFS);

    flatColorShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(flatColorShaderProgram, "aVertexPosition"),
    };

    flatColorShaderProgram.uniforms = {
        worldMatrixUniform:      gl.getUniformLocation(flatColorShaderProgram, "uWorldMatrix"),
        viewMatrixUniform:       gl.getUniformLocation(flatColorShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(flatColorShaderProgram, "uProjectionMatrix"),
        colorUniform:            gl.getUniformLocation(flatColorShaderProgram, "uColor"),
    };

    // let spotShaderProgram = createCompiledAndLinkedShaderProgram(
    // gl, assetLoader.assets.spotVS, assetLoader.assets.spotFS
    // );

    // spotShaderProgram.attributes = {
    //     vertexPositionAttribute: gl.getAttribLocation(spotShaderProgram, "aVertexPosition"),
    //     vertexNormalsAttribute:  gl.getAttribLocation(spotShaderProgram, "aNormal"),
    //     vertexTexcoordsAttribute: gl.getAttribLocation(spotShaderProgram, "aTexcoords")
    // };

    // spotShaderProgram.uniforms = {
    //     worldMatrixUniform:      gl.getUniformLocation(spotShaderProgram, "uWorldMatrix"),
    //     viewMatrixUniform:       gl.getUniformLocation(spotShaderProgram, "uViewMatrix"),
    //     projectionMatrixUniform: gl.getUniformLocation(spotShaderProgram, "uProjectionMatrix"),
    //     lightPositionUniform:    gl.getUniformLocation(spotShaderProgram, "uLightPosition"),
    //     cameraPositionUniform:   gl.getUniformLocation(spotShaderProgram, "uCameraPosition"),
    //     textureUniform:          gl.getUniformLocation(spotShaderProgram, "uTexture"),
    //     lightDirectionUniform:   gl.getUniformLocation(spotShaderProgram, "uLightDirection"),
    //     innerLimitUniform:       gl.getUniformLocation(spotShaderProgram, "uInnerLimit"),
    //     outerLimitUniform:       gl.getUniformLocation(spotShaderProgram, "uOuterLimit"),
    // };
}

// -------------------------------------------------------------------------
function createScene() {
    groundGeometry = new WebGLGeometryQuad(gl, phongShaderProgram);
    groundGeometry.create(assetLoader.assets.crackedMudImage);

    let scale = new Matrix4().makeScale(10.0, 10.0, 10.0);

    // compensate for the model being flipped on its side
    let rotation = new Matrix4().makeRotationX(-90);

    groundGeometry.worldMatrix.makeIdentity();
    groundGeometry.worldMatrix.multiply(rotation).multiply(scale);

    sphereGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    sphereGeometry.create(assetLoader.assets.sphereJSON, assetLoader.assets.marbleImage);

    // Scaled it down so that the diameter is 3
    scale = new Matrix4().makeScale(0.03, 0.03, 0.03);

    // raise it by the radius to make it sit on the ground
    let translation = new Matrix4().makeTranslation(0, 1.5, 0);

    sphereGeometry.worldMatrix.makeIdentity();
    sphereGeometry.worldMatrix.multiply(translation).multiply(scale);

    barrelGeometry = new WebGLGeometryJSON(gl, phongShaderProgram);
    barrelGeometry.create(assetLoader.assets.barrelJSON, assetLoader.assets.barrelImage);

    // Scaled it down so that the diameter is 3
    scale = new Matrix4().makeScale(0.3, 0.3, 0.3);

    // raise it by the radius to make it sit on the ground
    translation = new Matrix4().makeTranslation(-5, 2, -5);

    barrelGeometry.worldMatrix.makeIdentity();
    barrelGeometry.worldMatrix.multiply(translation).multiply(scale);

    lightSphereGeometry = new WebGLGeometryJSON(gl, flatColorShaderProgram);
    lightSphereGeometry.create(assetLoader.assets.sphereJSON, null); // no texture needed

    const lightScale = new Matrix4().makeScale(0.005, 0.005, 0.005); // small sphere
    lightSphereGeometry.worldMatrix.makeIdentity();
    lightSphereGeometry.worldMatrix.multiply(lightScale);

}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    const aspectRatio = gl.canvasWidth / gl.canvasHeight;

    // todo #10
    // add keyboard controls for changing light direction here
    // - Increment/decrement 'yaw' and 'pitch' variables based on input. These values 
    //   should represent absolute angles rather than incremental transformations, ensuring 
    //   statelessness across frames.
    // - Clamp pitch angle to [-89, 89] degrees to prevent extreme rotations (e.g., gimbal lock).
    // - Create rotation matrices for yaw and pitch based on current angles.
    // - Combine yaw and pitch into a single matrix (does the order matter?)
    //   Since the transformations are not accumulated over frames, each frame recalculates
    //   the rotation from scratch, ensuring stateless behavior.
    // - Use the matrix to transform the original/unchanged lightPosition

    time.update();
    yaw -= 50 * time.deltaTime;

    const lightRotationMatrix = new Matrix4().makeRotationY(yaw);
    const rotatedLightPosition = lightRotationMatrix.multiplyVector(lightPosition);
    camera.update(time.deltaTime);

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0.707, 0.707, 1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update light sphere position to match the rotated light
    const lightSphereTranslation = new Matrix4().makeTranslation(
        rotatedLightPosition.x,
        rotatedLightPosition.y,
        rotatedLightPosition.z
    );
    const lightSphereScale = new Matrix4().makeScale(0.005, 0.005, 0.005);
    lightSphereGeometry.worldMatrix.makeIdentity();
    lightSphereGeometry.worldMatrix.multiply(lightSphereTranslation).multiply(lightSphereScale);

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);

    // Render with flat color shader
    gl.useProgram(flatColorShaderProgram);
    gl.uniform4f(flatColorShaderProgram.uniforms.colorUniform, 1.0, 1.0, 1.0, 1.0); // white
    lightSphereGeometry.render(camera, projectionMatrix, flatColorShaderProgram);

    
    gl.useProgram(phongShaderProgram);
    const uniforms = phongShaderProgram.uniforms;
    const cameraPosition = camera.getPosition();

    // Existing point light
    gl.uniform3f(uniforms.lightPositionUniform, rotatedLightPosition.x, rotatedLightPosition.y, rotatedLightPosition.z);
    gl.uniform3f(uniforms.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);

    // Spotlight - fixed position above the scene pointing down
    gl.uniform3f(uniforms.spotLightPositionUniform,  0.0, 8.0, 0.0);
    gl.uniform3f(uniforms.spotLightDirectionUniform, 0.0, -1.0, 0.0);
    gl.uniform1f(uniforms.innerLimitUniform, Math.cos(15 * Math.PI / 180));
    gl.uniform1f(uniforms.outerLimitUniform, Math.cos(25 * Math.PI / 180));

    // Spotlight points downward from its position toward the origin
    // const spotDir = new Vector3(0, -1, 0); // adjust to taste

    // gl.useProgram(spotShaderProgram);
    // const su = spotShaderProgram.uniforms;
    // gl.uniform3f(su.lightPositionUniform,  rotatedLightPosition.x, rotatedLightPosition.y, rotatedLightPosition.z);
    // gl.uniform3f(su.cameraPositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);
    // gl.uniform3f(su.lightDirectionUniform, spotDir.x, spotDir.y, spotDir.z);
    // gl.uniform1f(su.innerLimitUniform, Math.cos(15 * Math.PI / 180)); // 15 degree inner cone
    // gl.uniform1f(su.outerLimitUniform, Math.cos(25 * Math.PI / 180)); // 25 degree outer cone

    groundGeometry.render(camera, projectionMatrix, phongShaderProgram);
    sphereGeometry.render(camera, projectionMatrix, phongShaderProgram);
    barrelGeometry.render(camera, projectionMatrix, phongShaderProgram);

}
