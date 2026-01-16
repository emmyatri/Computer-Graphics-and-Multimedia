/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Mod_1, Assignment_1, Lab_1
 */

"use strict";

var gl;
var points;
var length = 0.5;
var height = 0.5;

// Four Vertices
var vertices = [
    vec2(-length, -height),
    vec2(-length, height),
    vec2(length, height),
    vec2(length, -height)
];

window.onload = function init() {
    let canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2', {});
    if (!gl) { alert("WEBGL2 not available"); }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 0.0, 0.0, 1.0);

    //  Load shaders and initialize attribute buffers

    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    let bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("lengthval").oninput =

        function (event) {
            length = event.target.value;
            vertices = [
                vec2(-length, -height),
                vec2(-length, height),
                vec2(length, height),
                vec2(length, -height)
            ];
            render();
        };

    document.getElementById("heightval").oninput =

        function (event) {
            height = event.target.value;
            vertices = [
                vec2(-length, -height),
                vec2(-length, height),
                vec2(length, height),
                vec2(length, -height)
            ];
            render();
        };

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}