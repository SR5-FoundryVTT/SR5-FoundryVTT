/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Matrix = {
        dice: BaseValuePair<number> & ModifiableValue;
        base: BaseValuePair<number> & ModifiableValue;

        attack: AttributeField;
        sleaze: AttributeField;
        data_processing: AttributeField;
        firewall: AttributeField;
    };
}
