precision mediump float;

uniform vec3 uLightDirection;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    // diffuse contribution
    // todo #1 normalize the light direction and store in a separate variable
    vec3 lightDir = normalize(uLightDirection);

    // todo #2 normalize the world normal and store in a separate variable
    vec3 normal = normalize(vWorldNormal);
    // todo #3 calculate the lambert term
    float lambertTerm = max(dot(normal, lightDir), 0.0);

    // specular contribution
    // todo #4 in world space, calculate the direction from the surface point to the eye (normalized)
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    // todo #5 in world space, calculate the reflection vector (normalized)
    vec3 reflectDir = reflect(lightDir, normal);
    //gl_FragColor = vec4(reflectDir, 1.0);
    // todo #6 calculate the phong term
    float phongTerm = pow(max(dot(reflectDir, viewDir), 0.0), 64.0);
    
    // combine
    // todo #7 apply light and material interaction for diffuse value by using the texture color as the material
    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;
    vec3 diffuseColor = albedo * lambertTerm;
    
    // todo #8 apply light and material interaction for phong, assume phong material color is (0.3, 0.3, 0.3)
    vec3 specularColor = vec3(0.3) * phongTerm;

    //gl_FragColor = vec4(diffuseColor + specularColor, 1.0);

    //vec3 albedo = texture2D(uTexture, vTexcoords).rgb;

    vec3 ambient = albedo * 0.1;
    //vec3 diffuseColor = albedo * lambertTerm;
    //vec3 specularColor = vec3(0.3) * phongTerm;

    // todo #9
    // add "diffuseColor" and "specularColor" when ready
    vec3 finalColor = ambient + diffuseColor + specularColor;

    gl_FragColor = vec4(finalColor, 1.0);
}

