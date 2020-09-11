/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type ActorMatrix = {
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
        hot_sim: boolean;
        item?: any;
    };

    export type MatrixAttributeField = AttributeField & {
        device_att: string;
    }
}
