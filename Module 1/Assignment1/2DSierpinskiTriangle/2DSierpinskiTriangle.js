/*
 * Course: CS 4722
 * Section: 01
 * Name: Amelia Ellingson
 * Professor: Alan Shaw
 * Assignment #: Mod_1, Assignment_1, Lab_2
 */


"use strict";

var canvas;
var gl;

var points = [];

var numTimesToSubdivide = 0;

var bufferId;

var color = vec4(1.0, 0.0, 0.0, 1.0)

var colorLoc;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2', {});
    if (!gl) { alert("WEBGL2 not available"); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //    

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 8 * Math.pow(3, 6), gl.STATIC_DRAW);



    // Associate out shader variables with our data buffer

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);




    document.getElementById("sliderval").oninput =
        function (event) {
            numTimesToSubdivide = event.target.value;
            var colorValue = parseInt(event.target.value);

            switch (colorValue) {
                case 0:
                    color = vec4(1.0, 0.0, 0.0, 1.0);
                    break;
                case 1:
                    color = vec4(1.0, 1.0, 0.0, 1.0);
                    break;
                case 2:
                    color = vec4(0.0, 1.0, 0.0, 1.0);
                    break;
                case 3:
                    color = vec4(0.0, 0.0, 1.0, 1.0);
                    break;
                case 4:
                    color = vec4(0.0, 0.0, 0.0, 1.0);
                    break;
                case 5:
                    color = vec4(0.0, 1.0, 1.0, 1.0);
                    break;
            }
            gl.uniform4fv(colorLoc, color);
            render();
        };

    colorLoc = gl.getUniformLocation(program, "color");
    gl.uniform4fv(colorLoc, color);

    render();
};


function triangle(a, b, c) {
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {

    // check for end of recursion

    if (count == 0) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides

        let ab = mix(a, b, 0.5);
        let ac = mix(a, c, 0.5);
        let bc = mix(b, c, 0.5);

        --count;

        // three new triangles
        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
    }
}


function render() {
    let vertices = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)
    ];
    points = [];
    divideTriangle(vertices[0], vertices[1], vertices[2],
        numTimesToSubdivide);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
    points = [];
}