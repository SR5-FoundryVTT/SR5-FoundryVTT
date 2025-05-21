//todo: v10 foundry-vtt-types 
export default class ThermographicVisionBackgroundVisionShader extends AmplificationBackgroundVisionShader {
    static COLOR_TINT = [0.25, 0.41, 0.88];
  
    static override defaultUniforms = {
      ...super.defaultUniforms,
      colorTint: this.COLOR_TINT,
    };
  }
  