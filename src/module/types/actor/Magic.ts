declare namespace Shadowrun {
    export type Magic = {
        attribute: ActorAttribute;
        projecting: boolean;
        drain: BaseValuePair<number> & ModifiableValue;
    };
}
