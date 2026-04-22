export default class UltrasoundVisionFilter extends foundry.canvas.rendering.filters.AbstractBaseFilter {
    static override defaultUniforms = {
        luminanceThreshold: 0.5,
        alphaThreshold: 0.1,
    };

    static override fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float luminanceThreshold;
uniform float alphaThreshold;

void main(void) {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    float luminance = dot(vec3(0.30, 0.59, 0.11), texColor.rgb);
    if ( texColor.a > alphaThreshold ) {
        float pulse = 0.6 + 0.4 * sin((vTextureCoord.x + vTextureCoord.y) * 80.0);
        vec3 wire = mix(vec3(0.15, 0.2, 0.25), vec3(0.75, 0.85, 0.9), luminance);
        gl_FragColor = vec4(wire * pulse, texColor.a);
    } else {
        gl_FragColor = vec4(0.0);
    }
}`;
}
