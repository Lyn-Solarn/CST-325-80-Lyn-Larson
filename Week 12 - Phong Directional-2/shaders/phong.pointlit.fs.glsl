precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

// Spotlight uniforms
uniform vec3 uSpotLightPosition;
uniform vec3 uSpotLightDirection;
uniform float uInnerLimit;
uniform float uOuterLimit;

const float attConstant  = 1.0;
const float attLinear    = 0.07;
const float attQuadratic = 0.017;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    vec3 normal  = normalize(vWorldNormal);
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    vec3 albedo  = texture2D(uTexture, vTexcoords).rgb;

    // --- Point Light ---
    vec3 pointLightDir = normalize(uLightPosition - vWorldPosition);
    float pointDiff    = max(dot(normal, pointLightDir), 0.0);
    vec3 pointReflect  = reflect(-pointLightDir, normal);
    float pointSpec    = pow(max(dot(pointReflect, viewDir), 0.0), 64.0);
    float pointDist    = length(uLightPosition - vWorldPosition);
    float pointAtt     = 1.0 / (attConstant + attLinear * pointDist + attQuadratic * pointDist * pointDist);

    vec3 pointContrib = (albedo * pointDiff + vec3(0.3) * pointSpec) * pointAtt;

    // --- Spot Light ---
    vec3 spotSurfaceToLight = normalize(uSpotLightPosition - vWorldPosition);
    float dotFromDirection  = dot(spotSurfaceToLight, -uSpotLightDirection);
    float inLight           = smoothstep(uOuterLimit, uInnerLimit, dotFromDirection);
    float spotDiff          = inLight * max(dot(normal, spotSurfaceToLight), 0.0);
    vec3 spotHalf           = normalize(spotSurfaceToLight + viewDir);
    float spotSpec          = inLight * pow(max(dot(normal, spotHalf), 0.0), 64.0);
    float spotDist          = length(uSpotLightPosition - vWorldPosition);
    float spotAtt           = 1.0 / (attConstant + attLinear * spotDist + attQuadratic * spotDist * spotDist);

    vec3 spotContrib = (albedo * spotDiff + vec3(0.3) * spotSpec) * spotAtt;

    // --- Combine ---
    vec3 ambient    = albedo * 0.1;
    vec3 finalColor = ambient + pointContrib + spotContrib;

    gl_FragColor = vec4(finalColor, 1.0);
}