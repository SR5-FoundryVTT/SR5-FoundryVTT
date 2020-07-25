declare namespace Shadowrun {
    export type ActorArmor = BaseValuePair<number> & ModifiableValue & {
        fire: number,
        electric: number,
        cold: number,
        acid: number,
        label?: string;
    }
}