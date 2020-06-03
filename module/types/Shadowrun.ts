declare namespace Shadowrun {

    export type PhysicalAttribute      = "body"|"agility"|"reaction"|"strength";
    export type MentalAttribute        = "logic"|"intuition"|"charisma";
    export type SpecialAttribute       = "edge"|"essence"|"magic"|"resonance";
    export type MatrixAttribute        = "attack"|"sleaze"|"data processing"|"firewall";

    /**
     * Any valid attribute that an actor can have.
     */
    export type ActorAttribute = PhysicalAttribute | MentalAttribute | SpecialAttribute | MatrixAttribute | "";

    export type DamageType = "physical"|"stun"|"matrix"|"";
    
    export type DamageElement = "fire"|"cold"|"acid"|"electricity"|"radiation"|"";

    export type OpposedType = "defense"|"soak"|"armor"|"custom"|"";

    export type NumberOrEmpty = number | "";

    export type Skill = string;

    /**
     * A pair of fields for types that have a base and current value.
     */
    export type BaseValuePair<TType> = {
        base: TType,
        value: TType
    }
    /**
     * A pair of fields for types that have a current and max value.
     */
    export type ValueMaxPair<TType> = {
        value: TType,
        max: TType
    }

    /**
     * A list of mods to apply to a value.
     */
    export type ModList<TType> = {
        [name: string]: TType
    }
    /**
     * A value that is modifiable, having a base and current value, along with associated mod list.
     */
    export type ModifiableValue = BaseValuePair<number> & {
        mod: ModList<number>
    }
    /**
     * A modifiable value that also scales with an attribute.
     */
    export type ModifiableValueLinked = ModifiableValue & {
        "attribute": ActorAttribute
    }
}