//Q1d implement the whole thing to map the depth texture to a quad
// TODO:

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;

in vec2 vUv;

void main() {
    float depth = texture(tDepth, vUv).r;
    gl_FragColor = vec4(vec3(depth), 1.0);
}