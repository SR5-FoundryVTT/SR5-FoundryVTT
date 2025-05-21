//todo: v10 foundry-vtt-types 
export default class LowLightBackgroundVisionShader extends AmplificationBackgroundVisionShader {
    static COLOR_TINT = [0.25, 1, 0.25];
  
    static override defaultUniforms = {
      ...super.defaultUniforms,
      colorTint: this.COLOR_TINT,
    };
  }
  