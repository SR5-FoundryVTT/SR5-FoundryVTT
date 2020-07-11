/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Matrix = {
        dice: BaseValuePair<number> & ModifiableValue;
        base: BaseValuePair<number> & ModifiableValue;

        attack: MatrixAttributeField;
        sleaze: MatrixAttributeField;
        data_processing: MatrixAttributeField;
        firewall: MatrixAttributeField;

        condition_monitor: ConditionData;
        rating: NumberOrEmpty;
        name: string;
        device: string;
        is_cyberdeck: boolean;
        // TODO fix this
        item: any;
    };

    export type MatrixAttributeField = AttributeField & {
        device_att: string;
    }
}
