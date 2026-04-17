/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Extra-Credit-1, GlowShader
 */

"use strict";

var canvas;
var gl;
var program;

var latitudeBands = 30;
var longitudeBands = 30;
var radius = 2;

var pointsArray = [];
var normalsArray = [];
var colorsArray = [];
var indexArray = [];

var vBuffer;
var nBuffer;
var cBuffer;
var iBuffer;

var vPosition;
var vNormal;
var vColor;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var matColor = [0.0, 0.0, 0.0];    // black
var glowColor = [0.8, 0.4, 0.1];   // chocolate

var up = vec3(0.0, 1.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var eye = vec3(0.0, 0.0, 1.0);

var near = -10;
var far = 10;
var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2', {});
    if (!gl) { alert("WEBGL2 not available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    createSphereMap();

    // Create vertex buffer and vPosition attribute
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Create texture buffer and vNormal attribute
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Creating the color buffer and attribute values
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.uniform3fv(gl.getUniformLocation(program, "glowColor"), glowColor);

    // Create index buffer
    iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    // Get buffer locations for the following shader variables
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    render();
}

// Create SphereMap by filling pointsArray, normalsArray, and indexArray
function createSphereMap() {
    pointsArray = [];
    normalsArray = [];
    indexArray = [];

    // For each latitudinal band determine theta's value
    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        let theta = latNumber * Math.PI / latitudeBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        // For each longitudinal band determine phi's value and other calculations
        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            let phi = longNumber * 2 * Math.PI / longitudeBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;
            let u = 1 - (longNumber / longitudeBands);
            let v = 1 - (latNumber / latitudeBands);

            pointsArray.push(radius * x);
            pointsArray.push(radius * y);
            pointsArray.push(radius * z);
            pointsArray.push(1.0);

            normalsArray.push(x);
            normalsArray.push(y);
            normalsArray.push(z);

            colorsArray.push(matColor);
        }
    }

    // Set indices made up of rectangles rendered with 2 triangles (6 indices)
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            let first = (latNumber * (longitudeBands + 1)) + longNumber;
            let second = first + longitudeBands + 1;

            // First triangle
            indexArray.push(first);
            indexArray.push(second);
            indexArray.push(first + 1);

            // Second triangle
            indexArray.push(second);
            indexArray.push(second + 1);
            indexArray.push(first + 1);
        }
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.drawElements(gl.TRIANGLES, indexArray.length, gl.UNSIGNED_SHORT, 0);

    requestAnimFrame(render);
}