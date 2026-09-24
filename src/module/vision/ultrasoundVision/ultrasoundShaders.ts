const { WaveBackgroundVisionShader, WaveColorationVisionShader } = foundry.canvas.rendering.shaders;

/** Gray, like the ultrasound detection outline. Foundry's wave shaders default to magenta. */
export const ULTRASOUND_COLOR = [0.75, 0.75, 0.75];

export class UltrasoundBackgroundVisionShader extends WaveBackgroundVisionShader {
    static override defaultUniforms = {
        ...super.defaultUniforms,
        colorTint: ULTRASOUND_COLOR,
    };
}

export class UltrasoundColorationVisionShader extends WaveColorationVisionShader {
    static override defaultUniforms = {
        ...super.defaultUniforms,
        colorEffect: ULTRASOUND_COLOR,
    };
}
