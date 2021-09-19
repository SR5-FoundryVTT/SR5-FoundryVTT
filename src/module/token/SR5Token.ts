export class SR5Token extends Token {
    override _drawBar(number: number, bar: PIXI.Graphics, data: ReturnType<Token['getBarAttribute']>){
        // FoundryVTT draws resource bars as full/good when the value is the
        // same as the max and empty/bad at 0 (colored along a gradient).
        // Shadowrun condition trackers count up from 0 to the maximum.
        // We flip the values from Shadowrun format to FoundryVTT format here
        // for drawing.
        if (data.attribute.startsWith('track')) {
            data.value = data.max - data.value;
        }
        super._drawBar(number, bar, data);
    }
}