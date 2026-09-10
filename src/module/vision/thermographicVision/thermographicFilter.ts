export default class ThermographicVisionFilter extends foundry.canvas.rendering.filters.AbstractBaseFilter {
    static override defaultUniforms = {
        luminanceThreshold: 0.5,
        alphaThreshold: 0.1,
        heatLevel: 2,
    };

  /**
   * fragment shader based on the following snippets:
   * @link https://gitlab.com/peginc/swade/-/blob/develop/src/module/vision/InfravisionFilter.ts?ref_type=heads
   */
  static override fragmentShader = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float luminanceThreshold;
uniform float alphaThreshold;
uniform float heatLevel;

#define RED vec4(1.0, 0.0, 0.0, 1.0)
#define YELLOW vec4(1.0, 1.0, 0.0, 1.0)
#define BLUE vec4(0.0, 0.0, 1.0, 1.0)
#define GREEN vec4(0.0, 1.0, 0.0, 1.0)

void main(void) {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    float luminance = dot(vec3(0.30, 0.59, 0.11), texColor.rgb);
    if ( texColor.a > alphaThreshold ) {
        if ( heatLevel < 1.5 ) {
            gl_FragColor = mix(BLUE, GREEN, luminance);
        } else if ( heatLevel < 2.5 ) {
            gl_FragColor = (luminance < luminanceThreshold) ? mix(BLUE, mix(YELLOW, GREEN, luminance / 0.5), luminance * 2.0 ) : mix(YELLOW, RED, (luminance - 0.5) * 2.0);
        } else {
            gl_FragColor = (luminance < luminanceThreshold) ? mix(YELLOW, RED, luminance * 2.0) : mix(RED, vec4(1.0), (luminance - 0.5) * 2.0);
        }
        gl_FragColor.rgb *= 0.1 + 0.25 + 0.75 * pow( 16.0 * vTextureCoord.x * vTextureCoord.y * (1.0 - vTextureCoord.x) * (1.0 - vTextureCoord.y), 0.15 );
        gl_FragColor.a = texColor.a;
    } else {
        gl_FragColor = vec4(0.0);
    }
}`;
}
