var vertexShaderText = ["precision mediump float;", "", "attribute vec2 vertPosition;"].join("\n");

// about 20 minutes in

var initDemo = function(){
    console.log("This is working");
    
    var canvas = document.getElementById("testCanvas")
    // get opengl context
    var gl = canvas.getContext("webgl")
    if (!gl){
        console.log("WebGL not supported, falling back on experimental-webgl")
        gl = canvas.getContext("experimental-webgl")
    }
    if (!gl){
        alert("Your browser does not support WebGL")
    }

    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}