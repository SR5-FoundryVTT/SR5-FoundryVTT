/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Cyberware = Item & {
        type: 'cyberware';
    };

    export type CyberwareData = {
        essence: number;
        action: ActionData;
    };
}
