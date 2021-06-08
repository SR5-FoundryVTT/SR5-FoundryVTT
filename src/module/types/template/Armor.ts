declare namespace Shadowrun {
    export type ActorArmorData = BaseValuePair<number> & ModifiableValue & LabelField

    export type ActorArmor = ActorArmorData & {
        fire: number,
        electric: number,
        cold: number,
        acid: number,
        label?: string;
    }
}