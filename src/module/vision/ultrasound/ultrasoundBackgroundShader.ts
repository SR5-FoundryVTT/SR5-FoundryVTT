export default class UltrasoundBackgroundVisionShader extends foundry.canvas.rendering.shaders.AmplificationBackgroundVisionShader {
    static COLOR_TINT = [0.56, 0.67, 0.74];

    static override defaultUniforms = {
        ...super.defaultUniforms,
        colorTint: this.COLOR_TINT,
    };
}
