/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Mod4, Assignment2, Lab3
 */

"use strict";

var canvas;
var gl;

var points = [];
var colors = [];

var modelViewMatrix;
var modelViewMatrixLoc;

var projectionMatrix;
var projectionMatrixLoc;

var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var near = 0.1; //usually + .1 from the camera for perspective
var far = 4.0; //arbitrary
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var fovy = 120.0;
var isPerspective = true;

var xAngle = 0.7;
var yValue = 1.0;

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

    projectionMatrix = perspective(fovy, 1.0, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    document.getElementById("perspective").onclick =
        function () {
            isPerspective = true;

            projectionMatrix = perspective(fovy, 1.0, near, far);
            gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))

            document.getElementById("perspective").style.background = '#AAA';
            document.getElementById("ortho").style.background = '#FFF';
        };

    document.getElementById("ortho").onclick =
        function () {
            isPerspective = false;

            projectionMatrix = ortho(left, right, bottom, ytop, near, far);
            gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
            document.getElementById("perspective").style.background = '#FFF';
            document.getElementById("ortho").style.background = '#AAA';
        };

    document.getElementById("slider_fovy").oninput =
        function () {
            fovy = event.target.value;

            if (isPerspective) {
                projectionMatrix = perspective(fovy, 1.0, near, far);
                gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
            }
        };

    document.getElementById("leftxcamval").onclick =
        function () {
            xAngle += 0.1
        };

    document.getElementById("rightxcamval").onclick =
        function () {
            xAngle -= 0.1
        };

    document.getElementById("slider_ycam").oninput =
        function () {
            yValue = event.target.value;
        }


    render();
}

// -------------------------------------------------------------------


// DEFINE CUBE

function colorCube() {
    square(1, 0, 3, 2);
    square(2, 3, 7, 6);
    square(3, 0, 4, 7);
    square(5, 1, 2, 6);
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
        [1.0, 0.0, 1.0, 1.0],  // magenta
        [0.0, 0.0, 0.0, 1.0],  // black
        [0.0, 0.0, 1.0, 1.0],  // blue
        [0.0, 1.0, 1.0, 1.0],  // cyan
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [1.0, 1.0, 1.0, 1.0],  // white
        [0.0, 1.0, 0.0, 1.0],  // green
        [1.0, 0.0, 0.0, 1.0]   // red
    ];

    // Partion the square into two triangles in order for
    // WebGL to be able to render it.      
    // Vertex color assigned by the index of the vertex

    let indices = [a, b, c, a, c, d];

    for (let i = 0; i < indices.length; ++i) {
        points.push(verticesC[indices[i]]);
        //colorsC.push( vertexColors[indices[i]] );

        //for solid colored faces use 
        colors.push(vertexColors[c]);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let eye = vec3(Math.sin(xAngle), yValue, Math.cos(xAngle));

    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Render cube
    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    requestAnimationFrame(render);
}
