out vec3 vcsNormal;
out vec3 vcsPosition;
out mat4 matrixWorld;


void main() {
	// viewing coordinate system
	vcsNormal = normalize(mat3(normalMatrix) * normal); 
	vcsPosition = vec3(modelViewMatrix * vec4(position, 1.0));
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}