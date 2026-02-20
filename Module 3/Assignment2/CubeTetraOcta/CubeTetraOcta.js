/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Mod3, Assignment2, Lab4
 */

"use strict";

var canvas;
var gl;

// Cube
var points = [];
var colors = [];

// Axes: 0 = x; 1 = y; 2 = z
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;

// Array of angles: 0 = x; 1 = y; 2 = z
var theta = [0, 0, 0];
var thetaLoc;

var transMat;
var transMatLoc;

var scaleMat;
var scaleMatLoc;

var transMatCube;
var transMatTetra;
var transMatOcta;

var cubeScale = 1.0;
var tetraScale = 1.0;
var octaScale = 1.0;

var cubeOff = [-0.5, 0.4, 0.0];
var tetraOff = [0.5, 0.4, 0.0];
var octaOff = [0.0, -0.5, 0.0];

var cTheta = [0, 0, 0];
var tTheta = [0, 0, 0];
var oTheta = [0, 0, 0];

var cSpinning = true;
var tSpinning = true;
var oSpinning = true;

var totCubePts = 0;
var totTetraPts = 0;
var totOctaPts = 0;

var cBuffer;
var vBuffer;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2', {});
    if (!gl) { alert("WEBGL2 not available"); }

    // viewport = rectangular area of display window
    gl.viewport(0, 0, canvas.width, canvas.height);
    // clear area of display for rendering at each frame
    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // ---------- Initialize Cube Vertices --------------
    colorCube();
    // ------ Initialize Tetrahedron Vertices -----------
    colorTetra();
    // ------- Initialize Octahedron Vertices -----------
    colorOcta();

    // ------- Create Translation Matrices -----------
    transMatCube = translate(cubeOff[0], cubeOff[1], cubeOff[2]);
    transMatTetra = translate(tetraOff[0], tetraOff[1], tetraOff[2]);
    transMatOcta = translate(octaOff[0], octaOff[1], octaOff[2]);

    // Create a buffer object, initialise it, and associate it 
    // with the associated attribute variable in our vertex shader
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // color array attribute buffer
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    let vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");
    gl.uniform3fv(thetaLoc, theta);

    // ------------------------------------------------------------------
    // Event listeners for buttons

    document.getElementById("xButton").onclick = function () {
        axis = xAxis;
        document.getElementById('xButton').style.background = '#bebfba';
        document.getElementById('yButton').style.background = '#FFF';
        document.getElementById('zButton').style.background = '#FFF';
    };
    document.getElementById("yButton").onclick = function () {
        axis = yAxis;
        document.getElementById('yButton').style.background = '#bebfba';
        document.getElementById('xButton').style.background = '#FFF';
        document.getElementById('zButton').style.background = '#FFF';
    };
    document.getElementById("zButton").onclick = function () {
        axis = zAxis;
        document.getElementById('zButton').style.background = '#bebfba';
        document.getElementById('xButton').style.background = '#FFF';
        document.getElementById('yButton').style.background = '#FFF';
    };

    transMatLoc = gl.getUniformLocation(program, "transMat");
    scaleMatLoc = gl.getUniformLocation(program, "scaleMat");

    cubeScale = Number(document.getElementById("cSlider").value);
    tetraScale = Number(document.getElementById("tSlider").value);
    octaScale = Number(document.getElementById("oSlider").value);

    //CUBE START/STOP
    document.getElementById("cStartStop").onclick = function () {
        cSpinning = !cSpinning;
        document.getElementById("cStartStop").innerText =
            (cSpinning) ? "Stop Cube" : "Start Cube";
    };

    //TETRAHEDRON START/STOP
    document.getElementById("tStartStop").onclick = function () {
        tSpinning = !tSpinning;
        document.getElementById("tStartStop").innerText =
            (tSpinning) ? "Stop Tetrahedron" : "Start Tetrahedron";
    };

    //OCTAHEDRON START/STOP
    document.getElementById("oStartStop").onclick = function () {
        oSpinning = !oSpinning;
        document.getElementById("oStartStop").innerText =
            (oSpinning) ? "Stop Octahedron" : "Start Octahedron";
    };

    //CUBE SLIDER
    document.getElementById("cSlider").oninput =
        function (event) {
            cubeScale = Number(event.target.value);
        };

    //TETRAHEDRON SLIDER
    document.getElementById("tSlider").oninput =
        function (event) {
            tetraScale = Number(event.target.value);
        };

    //OCTAHEDRON SLIDER
    document.getElementById("oSlider").oninput =
        function (event) {
            octaScale = Number(event.target.value);
        };

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
        [0.0, 1.0, 1.0, 1.0],  // cyan
        [0.0, 0.0, 0.0, 1.0],  // black
        [1.0, 0.0, 0.0, 1.0],  // red
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [0.0, 1.0, 0.0, 1.0],  // green
        [1.0, 1.0, 1.0, 1.0],  // white
        [0.0, 0.0, 1.0, 1.0],  // blue
        [1.0, 0.0, 1.0, 1.0]   // magenta
    ];

    // Partion the square into two triangles in order for
    // WebGL to be able to render it.      
    // Vertex color assigned by the index of the vertex

    let indices = [a, b, c, a, c, d];

    for (let i = 0; i < indices.length; ++i) {
        points.push(verticesC[indices[i]]);
        //colors.push( vertexColors[indices[i]] );
        

        //for solid colored faces use 
        colors.push(vertexColors[c]);
        ++totCubePts;
    }
}

// DEFINE TETRAHEDRON

function colorTetra() {

    let verticesT = [
        vec3(0.0000, 0.0000, -0.3500),
        vec3(0.0000, 0.3500, 0.1500),
        vec3(-0.3500, -0.1500, 0.1500),
        vec3(0.3500, -0.1500, 0.1500)
    ];

    tetra(verticesT[0], verticesT[1], verticesT[2], verticesT[3]);
}

function makeTetra(a, b, c, color) {
    // add colors and vertices for one triangle

    let baseColors = [
        vec4(0.7, 0.7, 0.9, 1.0),
        vec4(0.6, 0.8, 0.9, 1.0),
        vec4(0.5, 0.6, 0.9, 1.0),
        vec4(1.0, 1.0, 0.2, 1.0)
    ];

    colors.push(baseColors[color]);
    points.push(a);
    colors.push(baseColors[color]);
    points.push(b);
    colors.push(baseColors[color]);
    points.push(c);
    totTetraPts += 3;
}

function tetra(p, q, r, s) {
    // tetrahedron with each side using
    // a different color

    makeTetra(p, r, q, 0);
    makeTetra(p, r, s, 1);
    makeTetra(p, q, s, 2);
    makeTetra(q, r, s, 3);
}


// DEFINE OCTAHEDRON

function colorOcta() {

    let verticesO = [
        vec3(0.2000, 0.0000, -0.2000),
        vec3(-0.2000, 0.0000, -0.2000),
        vec3(-0.2000, 0.0000, 0.2000),
        vec3(0.2000, 0.0000, 0.2000),
        vec3(0.0000, 0.3000, 0.0000),
        vec3(0.0000, -0.3000, 0.0000)
    ];

    octa(verticesO[0], verticesO[1], verticesO[2], verticesO[3], verticesO[4], verticesO[5]);
}

function makeOcta(a, b, c, color) {
    // add colors and vertices for one triangle

    let baseColors = [
        vec4(0.6, 0.6, 0.6, 1.0),
        vec4(0.3, 0.4, 0.9, 1.0),
        vec4(0.9, 0.9, 0.9, 1.0),
    ];

    colors.push(baseColors[color]);
    points.push(a);
    colors.push(baseColors[color]);
    points.push(b);
    colors.push(baseColors[color]);
    points.push(c);
    totOctaPts += 3;
}

function octa(a, b, c, d, e, f) {
    // tetrahedron with each side using
    // a different color

    makeOcta(a, d, e, 0);
    makeOcta(a, b, e, 1);
    makeOcta(b, c, e, 0);
    makeOcta(c, d, e, 1);
    makeOcta(a, d, f, 1);
    makeOcta(a, b, f, 2);
    makeOcta(b, c, f, 1);
    makeOcta(c, d, f, 2);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //CUBE

    scaleMat = scalem(cubeScale / 4, cubeScale / 4, cubeScale / 4);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scaleMat));
    if (cSpinning) cTheta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, cTheta);
    transMat = transMatCube;
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMat));
    gl.drawArrays(gl.TRIANGLES, 0, totCubePts);

    //TETRAHEDRON

    scaleMat = scalem(tetraScale / 4, tetraScale / 4, tetraScale / 4);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scaleMat));
    if (tSpinning) tTheta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, tTheta);
    transMat = transMatTetra;
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMat));
    gl.drawArrays(gl.TRIANGLES, totCubePts, totTetraPts);

    //OCTAHEDRON


    scaleMat = scalem(octaScale / 4, octaScale / 4, octaScale / 4);
    gl.uniformMatrix4fv(scaleMatLoc, false, flatten(scaleMat));
    if (oSpinning) oTheta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, oTheta);
    transMat = transMatOcta;
    gl.uniformMatrix4fv(transMatLoc, false, flatten(transMat));
    gl.drawArrays(gl.TRIANGLES, totCubePts + totTetraPts, totOctaPts);

    requestAnimationFrame(render);
}