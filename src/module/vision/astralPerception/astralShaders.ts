const { BackgroundVisionShader } = foundry.canvas.rendering.shaders;

/** Cool, pale blue-grey the astral world is tinted with. */
export const ASTRAL_TINT = [0.8, 0.86, 1.0];

/**
 * The astral world seen through astral perception (SR5#312): a faded, slightly photonegative grey copy of the
 * physical world, lit everywhere by the slow, drifting glow of the life around it.
 */
export class AstralBackgroundVisionShader extends BackgroundVisionShader {
    static override defaultUniforms = {
        ...super.defaultUniforms,
        colorTint: ASTRAL_TINT,
        glowColor: [0.75, 0.85, 1.0],
        shimmerIntensity: 0.1,
        negativeMix: 0.12,
    };

    /** Physical objects as grey shadows: dim, low contrast and partly inverted. */
    static SHADOW_WORLD = `
      float lum = perceivedBrightness(baseColor.rgb);
      float shade = mix(smoothstep(0.0, 1.0, lum), 1.0 - lum, negativeMix);
      finalColor = vec3(mix(0.16, 0.55, shade));`;

    /**
     * The ambient glow of life, as slowly drifting noise in screen space. Foundry's time starts at a random seed
     * of up to 100000, which GPU trigonometry can't handle, so it is wrapped to a whole number of periods of both
     * drifts (200 and 120), which keeps the loop seamless.
     */
    static AMBIENT_GLOW = `
      float t = mod(time, 6283.1853);
      vec2 p = vSamplerUvs * screenDimensions / 220.0;
      float n = fbm(p + vec2(sin(t * 0.2), cos(t * 0.12)) * 2.0);
      finalColor += glowColor * shimmerIntensity * n * (1.0 - dist * 0.6);`;

    static override _createFragmentShader() {
        return `
    ${this.SHADER_HEADER}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.PRNG}
    ${this.NOISE}
    ${this.FBM(3, 1.0)}

    uniform vec3 glowColor;
    uniform float shimmerIntensity;
    uniform float negativeMix;

    void main() {
      ${this.FRAGMENT_BEGIN}
      ${this.SHADOW_WORLD}
      ${this.ADJUSTMENTS}
      ${this.AMBIENT_GLOW}
      ${this.BACKGROUND_TECHNIQUES}
      ${this.FALLOFF}
      ${this.FRAGMENT_END}
    }`;
    }

    override get isRequired() {
        return true;
    }
}
