/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Mod4, Assignment2, Lab4
 */

"use strict";

var gl;

var nRows = 50;
var nColumns = 50;

// data for radial hat function: sin(Pi*r)/(Pi*r)

var data = [];

var pointsArray = [];

var fColor;

var near = 0.1;
var far = 10;
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var radius = 6.0;
var theta = 0.0;

var phi = 0.0;       // vertical angle of rotation
var fovy = 37;       // field of view angle for perspective view
var isOrtho = true;  // flag to indicate current projection type

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4(1.0, 0.0, 0.0, 1.0);

const at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = function init() {
    let canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2', {});
    if (!gl) { alert("WEBGL2 not available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);


    for (let i = 0; i < nRows; ++i) {
        data.push([]);
        let x = Math.PI * (4 * i / nRows - 2.0);

        for (let j = 0; j < nColumns; ++j) {
            let y = Math.PI * (4 * j / nRows - 2.0);
            let r = Math.sqrt(x * x + y * y);

            // take care of 0/0 for r = 0
            data[i][j] = (r != 0) ? (Math.sin(r) / r) : 1.0;
        }
    }

    // vertex array of nRows*nColumns quadrilaterals 
    // (two triangles/quad) from data

    for (let i = 0; i < nRows - 1; i++) {
        for (let j = 0; j < nColumns - 1; j++) {
            pointsArray.push(vec4(2 * i / nRows - 1, data[i][j], 2 * j / nColumns - 1, 1.0));
            pointsArray.push(vec4(2 * (i + 1) / nRows - 1, data[i + 1][j], 2 * j / nColumns - 1, 1.0));
            pointsArray.push(vec4(2 * (i + 1) / nRows - 1, data[i + 1][j + 1], 2 * (j + 1) / nColumns - 1, 1.0));
            pointsArray.push(vec4(2 * i / nRows - 1, data[i][j + 1], 2 * (j + 1) / nColumns - 1, 1.0));
        }
    }

    //
    //  Load shaders and initialize attribute buffers
    //
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    let vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    fColor = gl.getUniformLocation(program, "fColor");

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("rotateright").onclick =
        function () {
            theta += 0.1;
        };

    document.getElementById("rotateleft").onclick =
        function () {
            theta -= 0.1;
        };

    document.getElementById("rotateup").onclick =
        function () {
            phi -= 0.1;
        };

    document.getElementById("rotatedown").onclick =
        function () {
            phi += 0.1;
        };

    document.getElementById("perspective").onclick =
        function () {
            isOrtho = false;

            projectionMatrix = perspective(fovy, 1.0, near, far);
            gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))

            document.getElementById("perspective").style.background = '#AAA';
            document.getElementById("ortho").style.background = '#FFF';
        };

    document.getElementById("ortho").onclick =
        function () {
            isOrtho = true;

            projectionMatrix = ortho(left, right, bottom, ytop, near, far);
            gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))
            document.getElementById("perspective").style.background = '#FFF';
            document.getElementById("ortho").style.background = '#AAA';
        };

    render();
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (theta > 2 * Math.PI)
        theta -= 2 * Math.PI;
    if (theta < 0)
        theta += 2 * Math.PI;

    if (phi > 2 * Math.PI)
        phi -= 2 * Math.PI;
    if (phi < 0)
        phi += 2 * Math.PI;

    if (phi >= Math.PI / 2 && phi < 3 * Math.PI / 2) {
        up = vec3(0.0, -1.0, 0.0);
    } else {
        up = vec3(0.0, 1.0, 0.0);
    }


    let eye = vec3(
        radius * Math.cos(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.sin(theta) * Math.cos(phi)
    );

    if (isOrtho) {
        projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    } else {
        projectionMatrix = perspective(fovy, 1.0, near, far);
    }

    modelViewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // draw each quad as two filled red triangles
    // and then as two black line loops

    for (let i = 0; i < pointsArray.length; i += 4) {
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays(gl.LINE_LOOP, i, 4);
    }

    requestAnimFrame(render);
}