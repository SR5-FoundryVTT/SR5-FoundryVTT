/**
 * A token seen through low-light vision: light amplification lifts the shadows but washes out color, and leaves a
 * fine sensor grain. The grain is a fixed pattern, so it reads without color and never moves.
 */
export default class LowLightVisionFilter extends foundry.canvas.rendering.filters.AbstractBaseFilter {
    static override get defaultUniforms() {
        return {
            tint: [0.85, 0.92, 1.0],
            saturation: 0.2,
            lift: 0.18,
            grain: 0.12,
        };
    }

    static override _createFragmentShader() {
        return `
    precision ${PIXI.Program.defaultFragmentPrecision} float;
    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;
    uniform vec4 inputSize;
    uniform vec3 tint;
    uniform float saturation;
    uniform float lift;
    uniform float grain;

    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.PRNG}

    void main(void) {
      vec4 tex = texture2D(uSampler, vTextureCoord);
      if (tex.a <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
      }
      vec3 rgb = tex.rgb / tex.a;
      float lum = perceivedBrightness(rgb);
      rgb = mix(vec3(lum), rgb, saturation) * tint;
      rgb = lift + rgb * (1.0 - lift);
      // Grain in screen pixels, so it stays fine at any zoom.
      float noise = random(floor(vTextureCoord * inputSize.xy)) - 0.5;
      rgb = clamp(rgb + noise * grain, 0.0, 1.0);
      gl_FragColor = vec4(rgb * tex.a, tex.a);
    }`;
    }
}
