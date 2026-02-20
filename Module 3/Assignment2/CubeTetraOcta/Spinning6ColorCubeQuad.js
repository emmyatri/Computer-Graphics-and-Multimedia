/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Mod2, Assignment2, Lab4(Homework)
 */

"use strict";

var canvas;
var gl;

var numVertices = 36;

var axis = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var theta = vec3(0, 0, 0);
var thetaLoc;

var firstColors = true;

var vertices = [
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5)
];

var vertexColors = [
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0)   // magenta

];

var vertexColors2 = [

    vec4(0.0413, 0.563, 0.590, 1.0),  // seafoam blue
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(1.0, 0.5, 0.0, 1.0),  // orange
    vec4(0.830, 0.752, 0.307, 1.0),  // dark yellow
    vec4(0.171, 0.550, 0.165, 1.0),  // dark green
    vec4(0.0510, 0.0, 0.0, 1.0),  // dark red
    vec4(0.0956, 0.0893, 0.470, 1.0),  // royal blue
    vec4(0.467, 0.00, 0.560, 1.0),   // grape purple

];

var points = [];
var colors = [];

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

    makeCube();


    // vertex array attribute buffer code goes here
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    // color array attribute buffer code goes here
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);


    // thetaLoc uniform variable code goes here
    thetaLoc = gl.getUniformLocation(program, "theta");
    gl.uniform3fv(thetaLoc, theta);

    // button handlers code goes here
    document.getElementById("xButton").onclick =
        function () {
            axis = xAxis;
        };

    document.getElementById("yButton").onclick =
        function () {
            axis = yAxis;
        };

    document.getElementById("zButton").onclick =
        function () {
            axis = zAxis;
        };

    document.getElementById("colorButton").onclick =
        function () {

            firstColors = !firstColors;

            points = [];
            colors = [];
            makeCube();
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        };

    render();
}

function makeCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(5, 1, 2, 6);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    let indices = [a, b, c, a, c, d];
    for (let i = 0; i < indices.length; ++i) {
        points.push(vertices[indices[i]]);

        // for solid colored faces
        if(firstColors) {
            colors.push(vertexColors[c]);
        } else {
            colors.push(vertexColors2[c]);
        }
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += 2.0;
    gl.uniform3fv(thetaLoc, theta);
    requestAnimationFrame(render);

    gl.drawArrays(gl.TRIANGLES, 0, points.length)
    // render code goes here
}