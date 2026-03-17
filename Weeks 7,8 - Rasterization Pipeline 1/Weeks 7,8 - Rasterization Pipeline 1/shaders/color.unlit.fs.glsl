precision mediump float;

// Todo #10 - declare vVertexColor varying
varying vec3 vVertexColor;
uniform float uTime;


void main(void) {
    vec3 scrolled = vec3(
        sin(vVertexColor.r + uTime) * 0.5 + 0.5,
        sin(vVertexColor.g + uTime + 2.094) * 0.5 + 0.5,
        sin(vVertexColor.b + uTime + 4.188) * 0.5 + 0.5
    );
    // Use this line below instead once you've hooked up color
    gl_FragColor = vec4(scrolled, 1.0);

    // Temp, remove this later after uncommenting the above
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}

