in vec3 vcsNormal;
in vec3 vcsPosition;
in vec2 texCoord;
in vec4 lightSpacePos;

uniform vec3 lightColor;
uniform vec3 ambientColor;

uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;

uniform vec3 cameraPos;
uniform vec3 lightPosition;
uniform vec3 lightDirection;

// Textures are passed in as uniforms
uniform sampler2D colorMap;

void main() {
	//PRE-CALCS
	vec3 N = normalize(vcsNormal);
	vec3 L = normalize(lightDirection - vcsPosition);
	vec3 V = normalize(cameraPos - vcsPosition);
	vec3 H = normalize(V + L);

	//AMBIENT
	vec3 light_AMB = ambientColor * kAmbient;
	// light_AMB = ambientColor;

	//DIFFUSE
	vec3 diffuse = kDiffuse * lightColor;
	vec3 light_DFF = diffuse * max(0.0, dot(N, L));

	//SPECULAR
	vec3 specular = kSpecular * lightColor;
	vec3 light_SPC = specular * pow(max(0.0, dot(H, N)), shininess);

	//TOTAL
	// TODO: Q1a, sample from texture
	vec3 TOTAL = light_AMB + light_DFF + light_SPC;
	// vec3 TOTAL = light_AMB;


	// Sample the texture using the UV coordinates
	vec4 textureColor = texture2D(colorMap, texCoord);

	// Apply lighting to the texture color
	gl_FragColor = vec4(textureColor.rgb * TOTAL, 1.0);
	// gl_FragColor = vec4(diffuse, 1.0);
}