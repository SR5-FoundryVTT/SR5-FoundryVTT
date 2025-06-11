//todo: v10 foundry-vtt-types 
export default class AugmentedRealityVisionBackgroundVisionShader extends foundry.canvas.rendering.shaders.AmplificationBackgroundVisionShader {
    static COLOR_TINT = [0.15, 0.15, 0.88];
  
    static override defaultUniforms = {
        ...super.defaultUniforms,
        colorTint: this.COLOR_TINT,
    };
}
