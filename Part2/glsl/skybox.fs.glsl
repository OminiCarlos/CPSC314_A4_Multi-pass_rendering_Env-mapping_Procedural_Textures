// The cubmap texture is of type SamplerCube

uniform samplerCube skybox;
in vec3 wcsPosition;

void main () {
	// HINT : Sample the texture from the samplerCube object, rememeber that cubeMaps are sampled 
	// using a direction vector that you calculated in the vertex shader 
	// TODO: q1b
	vec3 direction = normalize (wcsPosition);
	gl_FragColor = textureCube (skybox, direction);
}