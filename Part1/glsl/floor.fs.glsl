in vec3 vcsNormal;
in vec3 vcsPosition;
in vec2 texCoord;
in vec4 lightSpaceCoords;

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
uniform sampler2D normalMap;

// Added ShadowMap
uniform sampler2D shadowMap;
uniform float textureSize;

//Q1d do the shadow mapping
//Q1d iii do PCF
// Returns 1 if point is occluded (saved depth value is smaller than fragment's depth value)
float inShadow(vec3 fragCoords, vec2 offset) {
	vec2 uv = fragCoords.xy;
	float closestDepth = texture(shadowMap, uv + offset).r;
	float currentDepth = fragCoords.z;
	return currentDepth > closestDepth + 0.0005 ? 1.0 : 0.0;
}

// TODO: Returns a value in [0, 1], 1 indicating all sample points are occluded
float calculateShadow() {
	vec3 fragCoords = lightSpaceCoords.xyz / lightSpaceCoords.w;
	fragCoords = fragCoords * 0.5 + 0.5;

	// Skip if outside light frustum
	if(fragCoords.z > 1.0)
		return 1.0;

	float shadow = 0.0;
	float texelOffset = 1.0 / textureSize;
	int smoothFactor = 2;
	for(int x = -smoothFactor; x <= smoothFactor; ++x) {
		for(int y = -smoothFactor; y <= smoothFactor; ++y) {
			vec2 offset = vec2(x, y) * texelOffset;
			shadow += inShadow(fragCoords, offset);
		}
	}

	shadow /= pow(float(smoothFactor * 2 + 1), 2.0);
	return shadow;
}

void main() {
	//PRE-CALCS
	vec3 N = normalize (vcsNormal);
	vec3 Nt = normalize (texture (normalMap, texCoord).xyz * 2.0 - 1.0);
	vec3 L = normalize (vec3 (viewMatrix * vec4 (lightDirection, 0.0)));
	vec3 V = normalize (-vcsPosition);
	vec3 H = normalize (V + L);

	//AMBIENT
	vec3 light_AMB = ambientColor * kAmbient;

	//DIFFUSE
	vec3 diffuse = kDiffuse * lightColor;
	vec3 light_DFF = diffuse * max (0.0, dot (N, L));

	//SPECULAR
	vec3 specular = kSpecular * lightColor;
	vec3 light_SPC = specular * pow (max (0.0, dot (H, N)), shininess);

	//SHADOW
	vec3 projCoords = lightSpaceCoords.xyz / lightSpaceCoords.w; // step 1
	projCoords = projCoords * 0.5 + 0.5;

	float shadow = calculateShadow ();

	//TOTAL
	light_DFF *= texture (colorMap, texCoord).xyz;
	vec3 TOTAL = light_AMB + (1.0- shadow) * (light_DFF + light_SPC);

	gl_FragColor = vec4 (TOTAL, 1.0);

}
