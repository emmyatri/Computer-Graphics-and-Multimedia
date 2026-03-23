/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Mod5, Assignment2, Lab3
 */

"use strict";

var canvas;
var gl;

var index = 0;
var pointsArray = [];

var near = -10;
var far = 10;
var radius = 6.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

const at = vec3(0.0, 0.0, 0.0);

var up = vec3(0.0, 1.0, 0.0);
var eye;

var theta = 0.0;
var phi = 0.0;

var useBlackLoc;

var numTimesToSubdivide = 0;


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2', {});
    if (!gl) { alert("WEBGL2 not available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    let va = vec4(0.0, 0.0, -1.0, 1);
    let vb = vec4(0.0, 0.942809, 0.333333, 1);
    let vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    let vd = vec4(0.816497, -0.471405, 0.333333, 1);

    tetrahedron(va, vb, vc, vd, 0);

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");


    document.getElementById("thetaIncrease").onclick =
        function () {
            theta += 0.1;
        };

    document.getElementById("thetaDecrease").onclick =
        function () {
            theta -= 0.1;
        };

    document.getElementById("phiIncrease").onclick =
        function () {
            phi += 0.1;
        };

    document.getElementById("phiDecrease").onclick =
        function () {
            phi -= 0.1;
        };

    document.getElementById("subIncrease").onclick =
        function () {
            if (numTimesToSubdivide < 6) {

                ++numTimesToSubdivide;

                index = 0;
                pointsArray = [];

                tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
            }
        };

    document.getElementById("subDecrease").onclick =
        function () {
            if (numTimesToSubdivide > 0) {

                --numTimesToSubdivide;

                index = 0;
                pointsArray = [];

                tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

                gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
            }
        };

    document.addEventListener("keydown",
        function (event) {

            if (event.keyCode == 37) {   // Left Arrow
                theta += 0.1;
            }

            if (event.keyCode == 39) {   // Right Arrow
                theta -= 0.1;
            }

            if (event.keyCode == 38) {   // Up Arrow
                phi += 0.1;
            }

            if (event.keyCode == 40) {   // Down Arrow
                phi -= 0.1;
            }


        }, false);

    useBlackLoc = gl.getUniformLocation(program, "useBlack");

    render();
}

function triangle(a, b, c) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);
    index += 3;
}


function divideTriangle(a, b, c, count) {
    if (count > 0) {

        let ab = normalize(mix(a, b, 0.5), true);
        let ac = normalize(mix(a, c, 0.5), true);
        let bc = normalize(mix(b, c, 0.5), true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else { // draw tetrahedron at end of recursion
        triangle(a, b, c);
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
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

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.cos(theta) * Math.cos(phi));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.uniform1i(useBlackLoc, false);
    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);
    gl.uniform1i(useBlackLoc, true);

    for (let i = 0; i < index; i += 3)
        gl.drawArrays(gl.LINE_LOOP, i, 3);

    window.requestAnimFrame(render);
}