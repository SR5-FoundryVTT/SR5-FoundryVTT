//todo: v10 foundry-vtt-types
export default class AstralPerceptionBackgroundVisionShader extends AmplificationBackgroundVisionShader {
    static COLOR_TINT = [1, 1, 0];
  
    static override defaultUniforms = {
      ...super.defaultUniforms,
      colorTint: this.COLOR_TINT,
    };
  }
  