/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Mod5, Assignment1, Lab1
 */


"use strict";

var canvas;
var gl;

var points = [];
var colors = [];

var xAngle = 0.0;
var yPos = 0.0;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var near = 0.1;
var far = 4.0;
var fovy = 140;
var ratio = 1.0;

var left = -2.0;
var right = 2.0;
var bottom = -2.0;
var yTop = 2.0;

var modelViewMatrix;
var modelViewMatrixLoc;

var projectionMatrix;
var projectionMatrixLoc;

// Array of angles: 0 = x; 1 = y; 2 = z
var theta = [0, 0, 0];

var isPerspective = false;
var precis = 1000;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2', {});
    if (!gl) { alert("WEBGL2 not available"); }

    // viewport = rectangular area of display window
    gl.viewport(0, 0, canvas.width, canvas.height);
    // clear area of display for rendering at each frame
    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    gl.enable(gl.DEPTH_TEST);

    colorCube();

    // --------------- Load shaders and initialize attribute buffers

    // Create a buffer object, initialise it, and associate it 
    // with the associated attribute variable in our vertex shader

    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Buffer    
    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Cube colour; set attributes 
    let vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Cube create points buffer
    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Cube create position
    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
    document.getElementById("yPosTxt").innerText = "(" + yPos + ")";
    document.getElementById("fovyTxt").innerText = "(" + Math.round(fovy*100) / 100 + ")";
    document.getElementById("nearTxt").innerText = "(" + near + ")";
    document.getElementById("farTxt").innerText = "(" + far + ")";
    document.getElementById("LRTxt").innerText = "(" + Math.round(right*100) / 100 + ")";
    document.getElementById("TBTxt").innerText = "(" + Math.round(yTop*100) / 100 + ")";
    document.getElementById("ratioTxt").innerText = "(" + ratio + ")";

    render();

    // ------------------------------------------------------------------
    // Event listeners for buttons

    document.getElementById("perspective").onclick =
        function (event) {
            isPerspective = true;
            document.getElementById('perspective').style.background = '#bebfba';
            document.getElementById('orthographic').style.background = '#FFF';
        };

    document.getElementById("orthographic").onclick =
        function (event) {
            isPerspective = false;
            document.getElementById('perspective').style.background = '#FFF';
            document.getElementById('orthographic').style.background = '#bebfba';
        };

    document.getElementById("xLeft").onclick = function () {
        xAngle += 0.1;
        document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
    };

    document.getElementById("xRight").onclick = function () {
        xAngle -= 0.1;
        document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
    };

    document.getElementById("yPos").oninput =
        function (event) {
            yPos = Number(event.target.value);
            document.getElementById("yPosTxt").innerText = "(" + yPos + ")";
        };

    document.getElementById("fovy").oninput =
        function (event) {
            fovy = Number(event.target.value);
            document.getElementById("fovyTxt").innerText = "(" + Math.round(fovy*100) /100 + ")";
        };

    document.getElementById("near").oninput =
        function (event) {
            near = Number(event.target.value);
            document.getElementById("nearTxt").innerText = "(" + near + ")";
        };

    document.getElementById("far").oninput =
        function (event) {
            far = Number(event.target.value);
            document.getElementById("farTxt").innerText = "(" + far + ")";
        };

    document.getElementById("leftright").oninput =
        function (event) {
            right = Number(event.target.value);
            left = -right;
            document.getElementById("LRTxt").innerText = "(" + Math.round(right * 100) / 100 + ")";
        };

    document.getElementById("topbottom").oninput =
        function (event) {
            yTop = Number(event.target.value);
            bottom = -yTop;
            document.getElementById("TBTxt").innerText = "(" + Math.round(yTop * 100) / 100 + ")";
        };

    document.getElementById("ratio").oninput =
        function (event) {
            ratio = Number(event.target.value);
            document.getElementById("ratioTxt").innerText = "(" + ratio + ")";
        };

    document.addEventListener("keydown",
        function (event) {
            if (event.keyCode == 37) { //LeftArrow
                xAngle += 0.1;
                document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
            }

            if (event.keyCode == 39) { //Right Arrow
                xAngle -= 0.1;
                document.getElementById("xAngTxt").innerText = "(" + Math.round(xAngle * 100) / 100 + ")";
            }

            if (event.keyCode == 38) { //Up Arrow
                fovy *= 0.9;
                document.getElementById("fovyTxt").innerText = "(" + Math.round(fovy * 100) / 100 + ")";

                right *= 0.9;
                left *= 0.9;
                document.getElementById("LRTxt").innerText = "(" + Math.round(right * 100) / 100 + ")";

                yTop *= 0.9;
                bottom *= 0.9;
                document.getElementById("TBTxt").innerText = "(" + Math.round(yTop * 100) / 100 + ")";
            }

            if (event.keyCode == 40) { //DOwn Arrow
                fovy *= 1.1;
                document.getElementById("fovyTxt").innerText = "(" + Math.round(fovy * 100) / 100 + ")";

                right *= 1.1;
                left *= 1.1;
                document.getElementById("LRTxt").innerText = "(" + Math.round(right * 100) / 100 + ")";

                yTop *= 1.1;
                bottom *= 1.1;
                document.getElementById("TBTxt").innerText = "(" + Math.round(yTop * 100) / 100 + ")";
            }
        }, false);


    render();
}

// DEFINE CUBE

function colorCube() {
    square(1, 0, 3, 2);
    square(2, 3, 7, 6);
    square(3, 0, 4, 7);
    square(6, 5, 1, 2);
    square(4, 5, 6, 7);
    square(5, 4, 0, 1);
}

function square(a, b, c, d) {
    let verticesC = [
        vec3(-0.25, -0.25, 0.25),
        vec3(-0.25, 0.25, 0.25),
        vec3(0.25, 0.25, 0.25),
        vec3(0.25, -0.25, 0.25),
        vec3(-0.25, -0.25, -0.25),
        vec3(-0.25, 0.25, -0.25),
        vec3(0.25, 0.25, -0.25),
        vec3(0.25, -0.25, -0.25)
    ];

    let vertexColors = [
        [0.9, 0.9, 0.2, 1.0],  // orange
        [0.0, 1.0, 1.0, 1.0],  // cyan
        [1.0, 0.0, 0.0, 1.0],  // red
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [0.0, 1.0, 0.0, 1.0],  // green
        [1.0, 0.0, 1.0, 1.0],  // magenta
        [0.0, 0.0, 1.0, 1.0],  // blue
        [1.0, 1.0, 1.0, 1.0]   // white

    ];

    // Partion the square into two triangles in order for
    // WebGL to be able to render it.      
    // Vertex color assigned by the index of the vertex

    let indices = [a, b, c, a, c, d];

    for (let i = 0; i < indices.length; ++i) {
        points.push(verticesC[indices[i]]);
        //colorsC.push( vertexColors[indices[i]] );

        //for solid colored faces use 
        colors.push(vertexColors[a]);
    }
}

// -------------------------------------------------------------------

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let eye = vec3(Math.sin(xAngle), yPos, Math.cos(xAngle));

    modelViewMatrix = lookAt(eye, at, up);

    if (isPerspective)
        projectionMatrix = perspective(fovy, ratio, near, far);
    else
        projectionMatrix = ortho(left, right, bottom, yTop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Render cube
    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    requestAnimationFrame(render);
}
