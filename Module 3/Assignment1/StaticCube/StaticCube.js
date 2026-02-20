/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Mod2, Assignment1, Lab1
 */


"use strict";

var canvas;
var gl;

var theta = vec3(45, 45, 45);
var thetaLoc;

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

var points = [
    vertices[1], vertices[0], vertices[3],
    vertices[3], vertices[2], vertices[1],
    vertices[2], vertices[3], vertices[7],
    vertices[7], vertices[6], vertices[2],
    vertices[3], vertices[0], vertices[4],
    vertices[4], vertices[7], vertices[3],
    vertices[6], vertices[2], vertices[1],
    vertices[1], vertices[5], vertices[6],
    vertices[4], vertices[5], vertices[6],
    vertices[6], vertices[7], vertices[4],
    vertices[5], vertices[4], vertices[0],
    vertices[0], vertices[1], vertices[5],
    ]


var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

var colors = [
    vertexColors[1], vertexColors[0], vertexColors[3],
    vertexColors[3], vertexColors[2], vertexColors[1],
    vertexColors[2], vertexColors[3], vertexColors[7],
    vertexColors[7], vertexColors[6], vertexColors[2],
    vertexColors[3], vertexColors[0], vertexColors[4],
    vertexColors[4], vertexColors[7], vertexColors[3],
    vertexColors[6], vertexColors[2], vertexColors[1],
    vertexColors[1], vertexColors[5], vertexColors[6],
    vertexColors[4], vertexColors[5], vertexColors[6],
    vertexColors[6], vertexColors[7], vertexColors[4],
    vertexColors[5], vertexColors[4], vertexColors[0],
    vertexColors[0], vertexColors[1], vertexColors[5],
    ]

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
    var thetaLoc = gl.getUniformLocation(program, "theta");
    gl.uniform3fv(thetaLoc, theta);

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
    // render code goes here
}