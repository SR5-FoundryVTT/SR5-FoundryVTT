/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Cyberware = SR5ItemType & {
        type: 'cyberware';
    };

    export type CyberwareData = {
        essence: number;
        action: ActionData;
    };
}
