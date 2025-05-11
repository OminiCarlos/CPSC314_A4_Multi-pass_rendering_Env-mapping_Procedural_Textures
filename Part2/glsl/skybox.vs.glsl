uniform vec3 cameraPos;
out vec3 wcsPosition;

void main () {
	// Position the skybox relative to camera
	wcsPosition = position;

	gl_Position = projectionMatrix * modelViewMatrix * vec4 (position, 1.0);
	gl_Position.z = gl_Position.w; // Force maximum depth
}