out vec3 vcsPosition;
out vec3 vcsNormal;
out vec2 texCoord;

void main() {
    texCoord = uv;
    vcsPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vcsNormal = normalize(mat3(normalMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}