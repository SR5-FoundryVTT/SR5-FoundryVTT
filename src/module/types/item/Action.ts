declare namespace Shadowrun {


    export interface ActionData extends
        ActionPartData,
        DescriptionPartData {
        result: ActionResultData
    }

    export interface ActionRollData {
            type: string
            category: string
            attribute: ActorAttribute
            attribute2: ActorAttribute
            skill: SkillName
            spec: boolean
            mod: number
            mod_description: string
            limit: LimitData
            threshold: BaseValuePair<number>
            extended: boolean
            damage: DamageData
            opposed: OpposedTestData
            alt_mod: number
            dice_pool_mod: ModList<number>
        }

    export interface ActionPartData {
        action: ActionRollData
    }

    /**
     * Action limit data.
     */
    export interface LimitData extends ModifiableValueLinked {}
    export type FormulaOperator = 'add'|'subtract'|'multiply'|'divide';

    /**
     * Info about the embedded source item that caused the damage
     */
    export interface DamageSource {
        actorId: string;
        itemId: string;
        itemName: string;
        itemType: string;
    }
    /**
     * Action damage data.
     */
    export interface DamageData extends ModifiableValueLinked {
        type: BaseValuePair<DamageType>;
        element: BaseValuePair<DamageElement>;
        ap: ModifiableValue;
        // See config.actionDamageFormulaOperators for operator mapping.
        base_formula_operator: FormulaOperator;
        source?: DamageSource;
    }

    /**
     * Action opposed test data.
     */
    export interface OpposedTestData {
        type: OpposedType;
        attribute: ActorAttribute;
        attribute2: ActorAttribute;
        skill: SkillName;
        mod: number;
        description: string;
    }

    export interface ActionResultData {
        success: {
            matrix: {
                placeMarks: boolean
            }
        }
    }
}
