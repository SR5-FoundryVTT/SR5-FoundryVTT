//@ts-expect-error // TODO: foundry-vtt-types v10
export default class AstralPerceptionBackgroundVisionShader extends AmplificationBackgroundVisionShader {
    static COLOR_TINT = [1, 1, 0];
  
    static defaultUniforms = {
      ...super.defaultUniforms,
      colorTint: this.COLOR_TINT,
    };
  }
  