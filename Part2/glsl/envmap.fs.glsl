in vec3 vcsNormal;
in vec3 vcsPosition;

uniform vec3 lightDirection;

uniform samplerCube skybox;

uniform vec3 cameraPos;

void main( void ) {

  // Q1c : Calculate the vector that can be used to sample from the cubemap
  vec3 I = normalize(vcsPosition - cameraPos);
  vec3 N = normalize(vcsNormal);

  vec3 reflectDir = reflect(I,N);

  vec4 reflectedColor = texture(skybox, reflectDir);

  gl_FragColor = reflectedColor;
  // gl_FragColor = vec4(normalize(vcsNormal) * 0.5 + 0.5, 1.0);

}