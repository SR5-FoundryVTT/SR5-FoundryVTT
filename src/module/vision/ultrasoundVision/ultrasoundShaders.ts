const { WaveBackgroundVisionShader, WaveColorationVisionShader } = foundry.canvas.rendering.shaders;

/** Gray, like the ultrasound detection outline. Foundry's wave shaders default to magenta. */
export const ULTRASOUND_COLOR = [0.75, 0.75, 0.75];

/**
 * Foundry's tremorsense background without its four rotating arms: an even gray map of the surroundings.
 */
export class UltrasoundBackgroundVisionShader extends WaveBackgroundVisionShader {
    static override defaultUniforms = {
        ...super.defaultUniforms,
        colorTint: ULTRASOUND_COLOR,
    };

    static override _createFragmentShader() {
        return `
    ${this.SHADER_HEADER}
    ${this.PERCEIVED_BRIGHTNESS}

    void main() {
      ${this.FRAGMENT_BEGIN}
      vec3 grey = vec3(perceivedBrightness(baseColor.rgb));
      finalColor = mix(baseColor.rgb, grey * 0.5, 0.5) * mix(vec3(1.0), colorTint, 0.3);
      ${this.ADJUSTMENTS}
      ${this.BACKGROUND_TECHNIQUES}
      ${this.FALLOFF}
      ${this.FRAGMENT_END}
    }`;
    }
}

/**
 * Sonar pings: rings that travel outward from the token and fade towards the edge of the range. Foundry's
 * tremorsense adds four rotating corner origins and arms that hide the rings, which this drops.
 */
export class UltrasoundColorationVisionShader extends WaveColorationVisionShader {
    static override defaultUniforms = {
        ...super.defaultUniforms,
        colorEffect: ULTRASOUND_COLOR,
    };

    static override _createFragmentShader() {
        return `
    ${this.SHADER_HEADER}
    ${this.WAVE()}
    ${this.PERCEIVED_BRIGHTNESS}

    void main() {
      ${this.FRAGMENT_BEGIN}
      // Foundry's time starts at a random seed of up to 100000. GPU cosines lose their accuracy on such
      // arguments and the rings vanish, so wrap time to one ring period (2π / 8) first.
      float t = mod(time, 0.7853982) * -8.0;
      float rings = smoothstep(0.6, 1.0, wcos(-10.0, 1.5 - dist * 0.8, dist * 120.0, t));
      finalColor = vec3(rings) * colorEffect;
      ${this.COLORATION_TECHNIQUES}
      ${this.ADJUSTMENTS}
      ${this.FALLOFF}
      ${this.FRAGMENT_END}
    }`;
    }
}
