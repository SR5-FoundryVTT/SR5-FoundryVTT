//todo: v10 foundry-vtt-types 
//@ts-expect-error
export default class AstralPerceptionBackgroundVisionShader extends AmplificationBackgroundVisionShader {
    static COLOR_TINT = [0.25, 0.25, 0];
  
    static defaultUniforms = {
      ...super.defaultUniforms,
      colorTint: this.COLOR_TINT,
    };
  }
  