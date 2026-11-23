/**
 * The ghostly, hazy image a manifesting astral being shows on the physical plane (SR5#314): a pale, see-through
 * wash of its astral form. It is static, so it is safe in photosensitive mode.
 */
export class ManifestationFilter extends foundry.canvas.rendering.filters.AbstractBaseFilter {
    static override _createFragmentShader() {
        return `
    precision ${PIXI.Program.defaultFragmentPrecision} float;
    uniform vec3 hazeColor;
    uniform float haze;
    uniform float opacity;
    uniform sampler2D uSampler;
    varying vec2 vTextureCoord;

    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}

    void main() {
      vec4 baseColor = texture2D(uSampler, vTextureCoord);
      if ( baseColor.a > 0.0 ) baseColor.rgb /= baseColor.a;
      float lum = perceivedBrightness(baseColor.rgb);
      vec3 ghost = mix(baseColor.rgb, (0.35 + lum * 0.65) * hazeColor, haze);
      float alpha = baseColor.a * opacity;
      gl_FragColor = vec4(ghost * alpha, alpha);
    }
    `;
    }

    static override get defaultUniforms() {
        return {
            uSampler: null,
            hazeColor: [0.8, 0.9, 1.0],
            haze: 0.55,
            opacity: 0.7,
        };
    }
}
