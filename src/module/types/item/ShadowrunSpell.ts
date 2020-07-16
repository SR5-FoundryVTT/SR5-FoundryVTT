declare namespace Shadowrun {
    export type SpellData = {
        action: ActionData;
        drain: number;
        category: string;
        type: string;
        range: string;
        duration: string;
        combat: {
            type: string;
        };
        detection: {
            passive: boolean;
            type: string;
            extended: boolean;
        };
        illusion: {
            type: string;
            sense: string;
        };
        manipulation: {
            damaging: boolean;
            mental: boolean;
            environmental: boolean;
            physical: boolean;
        };
    };
}
