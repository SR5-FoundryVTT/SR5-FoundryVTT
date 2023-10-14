//todo: v10 foundry-vtt-types 
//@ts-ignore
export default class AugmentedRealityVisionBackgroundVisionShader extends AmplificationBackgroundVisionShader {
    static COLOR_TINT = [0.15, 0.15, 0.88];
  
    static defaultUniforms = {
      ...super.defaultUniforms,
      colorTint: this.COLOR_TINT,
    };
  }
  