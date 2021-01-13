declare namespace Shadowrun {
    export type Action = SR5ItemData<ActionData> & {
        type: 'action';
    };

    export type ActionData = ActionPartData & DescriptionPartData;
    export type ActionRollData = {
            type: string;
            category: string;
            attribute: ActorAttribute;
            attribute2: ActorAttribute;
            skill: SkillName;
            spec: boolean;
            mod: number;
            mod_description: string;
            limit: LimitData;
            extended: boolean;
            damage: DamageData;
            opposed: OpposedTestData;
            alt_mod: number;
            dice_pool_mod: ModList<number>;
        };

    export type ActionPartData = {
        action: ActionRollData
    };

    /**
     * Action limit data.
     */
    export type LimitData = ModifiableValueLinked;
    /**
     * Action damage data.
     */
    export type DamageData = ModifiableValueLinked & {
        type: BaseValuePair<DamageType>;
        element: BaseValuePair<DamageElement>;
        ap: ModifiableValue;
    };
    /**
     * Action opposed test data.
     */
    export type OpposedTestData = {
        type: OpposedType;
        attribute: ActorAttribute;
        attribute2: ActorAttribute;
        skill: SkillName;
        mod: number;
        description: string;
    };
}
