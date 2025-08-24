#version 300 es
precision highp float;

in vec4 aPosition;
out vec2 vTexCoord;

void main() {
    gl_Position = aPosition;
    vTexCoord = aPosition.xy * 0.5 + 0.5; // map from [-1,1] to [0,1]
}
