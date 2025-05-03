declare namespace Shadowrun {
    export type Movement = {
        walk: ModifiableValue & {
            value: number;
            mult: number;
            base: number;
        };
        run: ModifiableValue & {
            value: number;
            mult: number;
            base: number;
        };
        sprint: number;
        swimming: number;
    };


}