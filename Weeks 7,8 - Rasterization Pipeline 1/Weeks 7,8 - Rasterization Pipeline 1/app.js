'use strict';

let gl;

let appInput = new Input();
let time = new Time();
let camera = new Camera(appInput);
const assetLoader = new AssetLoader();

let lineGrid = null;
let triangleGeometry = null;

let projectionMatrix = new Matrix4();

// The shader that will be used by each piece of geometry
let colorProgram;

// Auto-start the app when the HTML page is ready
window.onload = window['initializeAndStartRendering'];

// List of assets to load
const assetList = [
    { name: 'unlitColorVS', url: './shaders/color.unlit.vs.glsl', type: 'text' },
    { name: 'unlitColorFS', url: './shaders/color.unlit.fs.glsl', type: 'text' }
];

// -------------------------------------------------------------------------
// Initializes WebGL, loads assets, and starts the render loop
async function initializeAndStartRendering() {
    // Get access to the WebGL API (i.e. gl) via the canvas
    gl = getWebGLContext();
    if (!gl) return;

    // load the assets in the list and waits for the process to complete
    await assetLoader.loadAssets(assetList);
    if (!assetLoader.assets.unlitColorVS || !assetLoader.assets.unlitColorFS) {
        console.error("Critical shaders not loaded. Aborting app startup.");
        return;
    }

    createShaders();
    createScene();

    // Kick off the render loop
    updateAndRender();
}

// -------------------------------------------------------------------------
// Creates shader programs using the loaded shader source code
function createShaders() {
    // Get access to the raw shader code text for each shader
    const unlitColorVS = assetLoader.assets.unlitColorVS;
    const unlitColorFS = assetLoader.assets.unlitColorFS;

    // Compile and link the shader pair into a complete "program"
    colorProgram = createCompiledAndLinkedShaderProgram(gl, unlitColorVS, unlitColorFS);
    if (!colorProgram) return;

    // Get and store references to vertex data attributes (i.e. named identifiers) in the shader
    colorProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(colorProgram, "aVertexPosition"),
        /* Todo #11 vertexColorsAttribute: ? */
        vertexColorsAttribute: gl.getAttribLocation(colorProgram, "aVertexColor")
    };

    // Verify we found the attribute. 
    if (colorProgram.attributes.vertexPositionAttribute === -1) 
        console.warn("Attribute 'aVertexPosition' not found or unused in the shader.");

    // Todo #11 verify you found the color attribute
    if (colorProgram.attributes.vertexColorsAttribute === -1)
        console.warn("Attribute 'aVertexColor' not found or unused in the shader.");
    
    // Get and store references to uniforms (i.e.constant, global data that doesn't change while an object renders)
    colorProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(colorProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(colorProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(colorProgram, "uProjectionMatrix"),
        timeUniform: gl.getUniformLocation(colorProgram, "uTime"), // add this
    };

    

    gl.useProgram(colorProgram);
}

// -------------------------------------------------------------------------
// Creates the scene geometry and sets up world matrices
function createScene() {
    lineGrid = new WebGLGeometryGrid(gl);
    lineGrid.create(10);

    triangleGeometry = new WebGLGeometryTriangle(gl);
    triangleGeometry.create();

    // Until camera.js is fully implemented, we have to manually set the camera's world matrix
    camera.cameraWorldMatrix.makeTranslation(0, 0, 10);

    // After camera.js is implemented, the correct way to do the above is
    // camera.cameraPosition = new Vector3(0, 0, 10);
}

// -------------------------------------------------------------------------
// The main render loop; updates and renders the scene
// function updateAndRender() {
//     gl.enable(gl.DEPTH_TEST);
//     requestAnimationFrame(updateAndRender);

//     // Update our clock measurements to account for time
//     time.update();

//     // Update our camera based on input and the amount of time that has passed
//     camera.update(time.deltaTime);
    
//     // Todo - update the triangle's rotation by setting its worldMatrix

//     // In app.js:updateAndRender(), animate the triangle by updating its world matrix every frame.
//     // Calculate the angle: We want our angle of rotation to be constantly increasing based on how much time has elapsed.
//     let rotationSpeed = 30; // degrees per second
//     // Use the provided time utility: time.secondsElapsedSinceStart which gives you the number of seconds since your application started as part of your calculation.
//     let angle = time.secondsElapsedSinceStart * rotationSpeed; // 30 degrees per second
//     // Create the Rotation: Use the makeRotationY() method available on your Matrix4 class with the angle you just calculated.
//     triangleGeometry.worldMatrix.makeRotationY(angle);

//     // Todo #2 - Clear the canvas for the new frame
//     gl.clearColor(0.0, 0.0, 0.0, 1.0);
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//     checkGLError(gl, "After gl.clear");
    
//     // Todo #3 - specify what portion of the canvas we want to draw to (all of it)
//     gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);
//     checkGLError(gl, "After gl.viewport");

//     // Todo #3 specify the projection parameters
//     let aspectRatio = gl.canvasWidth / gl.canvasHeight;
//     projectionMatrix.makePerspective(60, aspectRatio, 0.1, 1000);

//     if (lineGrid) {
//         lineGrid.render(camera, projectionMatrix, colorProgram);
//     }
//     checkGLError(gl, "After rendering the line grid");

//     if (triangleGeometry) {
//         triangleGeometry.render(camera, projectionMatrix, colorProgram);
//     }
//     checkGLError(gl, "After rendering the triangle");
// }

// Needed to clean out all comments about what todo to realize my some lines up above was redundant and or actively breaking the scene.
//below is the cleaned up code minus the comments for easier viewing

function updateAndRender() {
    gl.enable(gl.DEPTH_TEST);
    requestAnimationFrame(updateAndRender);

    time.update();
    camera.update(time.deltaTime);

    let angle = time.secondsElapsedSinceStart * 30;
    triangleGeometry.worldMatrix.makeRotationY(angle);

    //gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearColor(0.1, 0.2, 0.4, 1.0); // dark blue
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    projectionMatrix.makePerspective(60, aspectRatio, 0.1, 1000);

    if (lineGrid) {
        lineGrid.render(camera, projectionMatrix, colorProgram);
    }

    gl.uniform1f(colorProgram.uniforms.timeUniform, time.secondsElapsedSinceStart);

    triangleGeometry.render(camera, projectionMatrix, colorProgram);
}
