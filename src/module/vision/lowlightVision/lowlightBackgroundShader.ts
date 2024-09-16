//@ts-expect-error // TODO: foundry-vtt-types v10
export default class LowLightBackgroundVisionShader extends AmplificationBackgroundVisionShader {
    static COLOR_TINT = [0.25, 1, 0.25];
  
    static defaultUniforms = {
      ...super.defaultUniforms,
      colorTint: this.COLOR_TINT,
    };
  }
  