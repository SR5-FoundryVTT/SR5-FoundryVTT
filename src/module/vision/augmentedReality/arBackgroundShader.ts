//@ts-expect-error // TODO: foundry-vtt-types v10
export default class AugmentedRealityVisionBackgroundVisionShader extends AmplificationBackgroundVisionShader {
    static COLOR_TINT = [0.15, 0.15, 0.88];
  
    static defaultUniforms = {
      ...super.defaultUniforms,
      colorTint: this.COLOR_TINT,
    };
  }
  