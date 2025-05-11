in vec3 vcsNormal;
in vec3 vcsPosition;

uniform mat4 matrixWorld;

uniform vec3 lightDirection;

uniform samplerCube skybox;

uniform vec3 cameraPos;

void main( void ) {

  // Q1c : Calculate the vector that can be used to sample from the cubemap
  vec3 I = normalize(vcsPosition);
  vec3 N = normalize(vcsNormal);

  vec3 vReflectDir = reflect(I,N);
  vec3 wReflectDir = vec3(matrixWorld * vec4(vReflectDir,0.0));
  vec4 reflectedColor = texture(skybox, wReflectDir);

  gl_FragColor = reflectedColor;

}