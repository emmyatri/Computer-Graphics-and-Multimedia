/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Extra-Credit-1, ToonLikeShader
 */

"use strict";

var canvas;
var gl;
var program;

var latitudeBands = 200;
var longitudeBands = 200;
var radius = 2;

var pointsArray = [];
var normalsArray = [];
var indexArray = [];

var vBuffer;
var nBuffer;
var iBuffer;

var vPosition;
var vNormal;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;


var up = vec3(0.0, 1.0, 0.4);
var at = vec3(-1.9, -0.1, -0.6);
var eye = vec3(-0.4, 0.6, -0.1);

var near = -10;
var far = 10;
var left = -3.2;
var right = 2.8;
var ytop = 2.3;
var bottom = -3.7;

// Setting up the ambient, diffuse, specular, shininess and position values
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var ambientProduct, ambientProductLoc;
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;

var shininess = 200.0;
var shininessLoc;

var lightPosition = [36.0, 82.0, 100.0, 0.0];
var lightPositionLoc;

// Setting the amount of bands
var bandAmt = 10.0;
var bandAmtLoc;

var lightTheta = 0.35;
var lightRad = 106;

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

    // Create index buffer
    iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    // Setting Uniform Lighting values
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, lightPosition);

    shininessLoc = gl.getUniformLocation(program, "shininess");
    gl.uniform1f(shininessLoc, shininess);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));

    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));

    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));

    bandAmtLoc = gl.getUniformLocation(program, "bandAmt");
    gl.uniform1f(bandAmtLoc, bandAmt);

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

    lightTheta -= 0.01;
    lightPosition[0] = lightRad * Math.sin(lightTheta);
    lightPosition[2] = lightRad * Math.cos(lightTheta);
    gl.uniform4fv(lightPositionLoc, lightPosition);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.drawElements(gl.TRIANGLES, indexArray.length, gl.UNSIGNED_SHORT, 0);

    requestAnimFrame(render);
}