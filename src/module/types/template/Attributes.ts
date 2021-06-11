/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type SpecialTrait = 'magic' | 'resonance' | 'mundane' | '';

    export type Attributes = {
        [name: string]: AttributeField;
        edge: EdgeAttributeField;
    };

    export type EdgeAttributeField = AttributeField & {
        uses: number;
        max: number;
    }

    export type AttributeField = BaseValuePair<number> &
        CanHideFiled &
        ModifiableValue &
        LabelField & {
            limit?: string;
            temp?: number;
        };
}
