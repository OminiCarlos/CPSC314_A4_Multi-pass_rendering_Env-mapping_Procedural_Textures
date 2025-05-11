out vec3 vcsNormal;
out vec3 vcsPosition;


void main() {
	// viewing coordinate system
	vcsNormal = normalize(mat3(modelMatrix) * normal); 
	vcsPosition = vec3(modelMatrix * vec4(position, 1.0));
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}