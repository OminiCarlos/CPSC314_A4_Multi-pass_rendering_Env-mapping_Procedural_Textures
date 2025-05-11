out vec3 vcsPosition;
out vec3 vcsNormal;
out vec2 texCoord;

void main () {
    texCoord = vec2 (uv.x, 1.0 - uv.y);
    vcsPosition = (modelMatrix * vec4 (position, 1.0)).xyz;
    vcsNormal = mat3(modelMatrix) * normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4 (position, 1.0);
}