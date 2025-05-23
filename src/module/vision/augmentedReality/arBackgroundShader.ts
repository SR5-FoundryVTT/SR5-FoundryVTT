//todo: v10 foundry-vtt-types 
export default class AugmentedRealityVisionBackgroundVisionShader extends AmplificationBackgroundVisionShader {
    static COLOR_TINT = [0.15, 0.15, 0.88];
  
    static override defaultUniforms = {
        ...super.defaultUniforms,
        colorTint: this.COLOR_TINT,
    };
}
  