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

vec2 hash (vec2 p) {
	p = vec2 (dot (p, vec2 (127.1, 311.7)), dot (p, vec2 (269.5, 183.3)));
	return -1.0 + 2.0 * fract (sin (p) * 43758.5453123);
}

float perlin (vec2 p) {
	vec2 i = floor (p);
	vec2 f = fract (p);

    // 4 corner gradients
	vec2 a = hash (i);
	vec2 b = hash (i + vec2 (1.0, 0.0));
	vec2 c = hash (i + vec2 (0.0, 1.0));
	vec2 d = hash (i + vec2 (1.0, 1.0));

    // Dot products
	float va = dot (a, f - vec2 (0.0, 0.0));
	float vb = dot (b, f - vec2 (1.0, 0.0));
	float vc = dot (c, f - vec2 (0.0, 1.0));
	float vd = dot (d, f - vec2 (1.0, 1.0));

    // Smooth interpolation weights
	vec2 u = f * f * (3.0 - 2.0 * f);

    // Bilinear interpolation
	return mix (mix (va, vb, u.x), mix (vc, vd, u.x), u.y);
}

void main () {
	//PRE-CALCS
	vec3 N = normalize (vcsNormal);
	vec3 L = normalize(vec3(viewMatrix * vec4(lightDirection, 0.0)));
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

	vec3 baseColor = texture (colorMap, texCoord).rgb;

	float noise = perlin (texCoord * 10.0); // 10.0 controls frequency
	float spots = step (0.1, noise); // hard threshold to make splotches
	vec3 finalColor = vec3(0.0);
	if (texCoord.x < 0.5 && texCoord.y < 0.5) {
		finalColor = baseColor;
	} else {
		finalColor = mix (baseColor, vec3 (0.05, 0.05, 0.05), spots); // darken where spotted
	}

	// TODO: Use the UV coordinates to create perlin noise

	// TODO: Put the noise through a stepping function to get cow-like patches

	//TOTAL
	vec3 TOTAL = light_AMB + light_DFF + light_SPC;

	// TODO: Take a look at the colormap and apply the noise to the cow on the portion that does not contain the face

	gl_FragColor = vec4 (finalColor * TOTAL, 1.0);
	// gl_FragColor = vec4(texCoord, 0.0, 1.0);
}