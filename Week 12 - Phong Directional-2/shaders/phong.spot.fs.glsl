precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

uniform vec3 uLightDirection;  // direction the spotlight points
uniform float uInnerLimit;     // in dot space (cos of inner angle)
uniform float uOuterLimit;     // in dot space (cos of outer angle)

const float attConstant  = 1.0;
const float attLinear    = 0.07;
const float attQuadratic = 0.017;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    vec3 surfaceToLight = normalize(uLightPosition - vWorldPosition);
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    vec3 halfVector = normalize(surfaceToLight + viewDir);

    // Spotlight cone check with soft edge
    float dotFromDirection = dot(surfaceToLight, -uLightDirection);
    float inLight = smoothstep(uOuterLimit, uInnerLimit, dotFromDirection);

    // Lighting terms
    float lambertTerm = inLight * max(dot(normal, surfaceToLight), 0.0);
    float phongTerm   = inLight * pow(max(dot(normal, halfVector), 0.0), 64.0);

    // Attenuation
    float d = length(uLightPosition - vWorldPosition);
    float attenuation = 1.0 / (attConstant + attLinear * d + attQuadratic * d * d);

    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;
    vec3 ambient       = albedo * 0.1;
    vec3 diffuseColor  = albedo * lambertTerm;
    vec3 specularColor = vec3(0.3) * phongTerm;

    vec3 finalColor = ambient + (diffuseColor + specularColor) * attenuation;
    gl_FragColor = vec4(finalColor, 1.0);
}